import os
import re
import json
import hashlib
import time
import logging
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from ..models import AICache

# Load .env file automatically from current directory, backend dir, or workspace root
load_dotenv(".env")
load_dotenv("backend/.env")
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env"))

logger = logging.getLogger("gemini_service")

def get_gemini_api_keys() -> List[str]:
    """Retrieves all configured Gemini API keys (primary and secondary rotation keys) from environment."""
    keys = []
    # Primary key
    k_main = os.getenv("GEMINI_API_KEY", "").strip()
    if k_main:
        keys.append(k_main)
    
    # Secondary keys (GEMINI_API_KEY_2, GEMINI_API_KEY_3, ...)
    for idx in range(2, 11):
        k_sub = os.getenv(f"GEMINI_API_KEY_{idx}", "").strip()
        if k_sub and k_sub not in keys:
            keys.append(k_sub)
            
    return keys

def get_gemini_api_key() -> str:
    """Returns the primary active Gemini API key from the rotation pool."""
    keys = get_gemini_api_keys()
    return keys[0] if keys else ""

def get_input_hash(prompt_type: str, content_chunk: str) -> str:
    """Computes a SHA-256 fingerprint from prompt type and content chunk for SQLite AI caching."""
    raw = f"{prompt_type}::{content_chunk}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def call_gemini_api(prompt: str, json_schema_required: bool = True) -> str:
    """
    Calls Gemini API REST endpoint with explicit disclosure, maxOutputTokens=8192, multi-key rotation, and exponential backoff.
    Passes API key in HTTP header rather than query string to prevent leakage in proxy/server logs.
    """
    keys = get_gemini_api_keys()
    if not keys:
        logger.warning("[MODE: FALLBACK_MOCK] Reason: GEMINI_API_KEY is missing or empty in environment / .env!")
        raise ValueError("Chưa cấu hình GEMINI_API_KEY trong file .env!")

    import urllib.request
    import urllib.error

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json" if json_schema_required else "text/plain"
        }
    }
    data = json.dumps(payload).encode("utf-8")

    # Try available keys in sequence
    for key_idx, api_key in enumerate(keys):
        logger.info(f"[MODE: GEMINI_API] Executing live request to Gemini API (Key #{key_idx + 1})...")
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent"
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": api_key
            }
        )

        max_retries = 2
        backoff_seconds = 2.0

        for attempt in range(max_retries):
            try:
                with urllib.request.urlopen(req, timeout=45) as resp:
                    raw_bytes = resp.read()
                    result_json = json.loads(raw_bytes.decode("utf-8"))
                    candidates = result_json.get("candidates", [])
                    if not candidates:
                        raise ValueError("Gemini API không trả về candidate nào.")
                    part_text = candidates[0]["content"]["parts"][0]["text"]
                    logger.info(f"[GEMINI_API SUCCESS] Key #{key_idx + 1} received {len(part_text)} chars from API.")
                    return part_text
            except urllib.error.HTTPError as err:
                if err.code in (429, 503):
                    logger.warning(f"[GEMINI_API RATE LIMIT HTTP {err.code}] Key #{key_idx + 1} Attempt {attempt + 1}/{max_retries}, switching/waiting...")
                    time.sleep(backoff_seconds)
                    backoff_seconds *= 1.5
                else:
                    logger.error(f"[GEMINI_API HTTP ERROR] Key #{key_idx + 1} HTTP {err.code}: {err.reason}")
                    break
            except Exception as ex:
                logger.error(f"[GEMINI_API ERROR] Key #{key_idx + 1}: {ex}")
                if attempt < max_retries - 1:
                    time.sleep(backoff_seconds)
                else:
                    break

    logger.warning("[GEMINI_API QUOTA EXCEEDED] Quota limit hit on all Gemini API keys. Triggering smart fallback extraction.")
    raise ValueError("GEMINI_QUOTA_EXCEEDED: Đã chạm hạn ngạch API Gemini Free Tier trên toàn bộ Key. Tự động chuyển sang luồng xử lý dự phòng.")


def query_gemini_with_cache(
    db: Session,
    prompt_type: str,
    prompt_text: str,
    content_chunk: str
) -> Dict[str, Any]:
    """
    Queries Gemini API with mandatory SQLite caching.
    Explicitly discloses whether response comes from SQLite Cache or Live Gemini API.
    Cleans up corrupted cache entries automatically.
    """
    input_hash = get_input_hash(prompt_type, content_chunk)

    # 1. Check SQLite Cache
    cached = db.query(AICache).filter(AICache.input_hash == input_hash).first()
    if cached:
        logger.info(f"[SQLITE CACHE HIT] prompt_type='{prompt_type}', hash={input_hash[:10]}... (Returned from DB cache, 0 API tokens spent)")
        try:
            return json.loads(cached.response_json)
        except json.JSONDecodeError as cache_decode_err:
            logger.warning(f"[CACHE CORRUPT] Invalid JSON in cache for hash {input_hash[:10]}: {cache_decode_err}. Deleting corrupt entry...")
            try:
                db.delete(cached)
                db.commit()
            except Exception:
                db.rollback()

    logger.info(f"[SQLITE CACHE MISS] prompt_type='{prompt_type}', hash={input_hash[:10]}... Triggering live Gemini API request...")
    
    # 2. Call Gemini Live API
    raw_response = call_gemini_api(prompt_text, json_schema_required=True)

    cleaned_response = raw_response.strip()
    if cleaned_response.startswith("```json"):
        cleaned_response = cleaned_response[7:]
    if cleaned_response.startswith("```"):
        cleaned_response = cleaned_response[3:]
    if cleaned_response.endswith("```"):
        cleaned_response = cleaned_response[:-3]
    cleaned_response = cleaned_response.strip()

    try:
        parsed_json = json.loads(cleaned_response)
    except Exception as parse_err:
        logger.warning(f"[GEMINI JSON PARSE WARNING] Direct json.loads failed: {parse_err}. Attempting structured extraction...")
        parsed_json = None

        # Try to find outermost bracketed JSON structure
        start_arr = cleaned_response.find("[")
        end_arr = cleaned_response.rfind("]")
        if start_arr != -1 and end_arr != -1 and end_arr > start_arr:
            try:
                parsed_json = json.loads(cleaned_response[start_arr:end_arr + 1])
            except Exception as extract_arr_err:
                logger.debug(f"Array slice parse failed: {extract_arr_err}")

        if parsed_json is None:
            start_obj = cleaned_response.find("{")
            end_obj = cleaned_response.rfind("}")
            if start_obj != -1 and end_obj != -1 and end_obj > start_obj:
                try:
                    parsed_json = json.loads(cleaned_response[start_obj:end_obj + 1])
                except Exception as extract_obj_err:
                    logger.debug(f"Object slice parse failed: {extract_obj_err}")

        # Truncated array repair
        if not parsed_json and cleaned_response.startswith("["):
            last_brace = cleaned_response.rfind("}")
            if last_brace != -1:
                truncated_array = cleaned_response[:last_brace + 1].strip() + "]"
                try:
                    parsed_json = json.loads(truncated_array)
                    logger.info(f"[GEMINI JSON REPAIR SUCCESS] Truncated JSON array repaired cleanly! Parsed {len(parsed_json)} valid items.")
                except Exception as trunc_err:
                    logger.debug(f"Array truncation repair parse failed: {trunc_err}")

        if parsed_json is None:
            logger.error(f"[GEMINI JSON PARSE ERROR] Failed to parse JSON response ({len(cleaned_response)} chars):\n{cleaned_response[:500]}...")
            raise parse_err

    # 3. Save to Cache
    new_cache = AICache(
        input_hash=input_hash,
        prompt_type=prompt_type,
        response_json=json.dumps(parsed_json, ensure_ascii=False)
    )
    db.add(new_cache)
    db.commit()

    return parsed_json
