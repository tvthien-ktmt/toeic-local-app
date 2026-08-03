import os
import re
import json
import hashlib
import time
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from ..models import AICache

# Load .env file automatically from current directory, backend dir, or workspace root
load_dotenv(".env")
load_dotenv("backend/.env")
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env"))

logger = logging.getLogger("gemini_service")
logging.basicConfig(level=logging.INFO)

def get_gemini_api_key() -> str:
    key = os.getenv("GEMINI_API_KEY", "").strip()
    return key

def get_input_hash(prompt_type: str, content_chunk: str) -> str:
    raw = f"{prompt_type}::{content_chunk}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def call_gemini_api(prompt: str, json_schema_required: bool = True) -> str:
    """
    Calls Gemini API REST endpoint with explicit disclosure, maxOutputTokens=8192, and exponential backoff.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        print("[MODE: FALLBACK_MOCK] Reason: GEMINI_API_KEY is missing or empty in environment / .env!")
        raise ValueError("Chưa cấu hình GEMINI_API_KEY trong file .env!")

    print(f"[MODE: GEMINI_API] Executing live request to Gemini API (Key: {api_key[:6]}***)...")

    import urllib.request
    import urllib.error

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"

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
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"}
    )

    max_retries = 5
    backoff_seconds = 4.0

    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw_bytes = resp.read()
                result_json = json.loads(raw_bytes.decode("utf-8"))
                candidates = result_json.get("candidates", [])
                if not candidates:
                    raise ValueError("Gemini API không trả về candidate nào.")
                part_text = candidates[0]["content"]["parts"][0]["text"]
                print(f"[GEMINI_API SUCCESS] Received {len(part_text)} chars from API.")
                return part_text
        except urllib.error.HTTPError as e:
            if e.code in [429, 503]:
                print(f"[GEMINI_API BUSY/RATE LIMIT HTTP {e.code}] Retry {attempt + 1}/{max_retries} after {backoff_seconds}s backoff...")
                time.sleep(backoff_seconds)
                backoff_seconds *= 2
            else:
                body = e.read().decode("utf-8", errors="ignore")
                print(f"[GEMINI_API ERROR] HTTP {e.code}: {body[:200]}")
                raise RuntimeError(f"Lỗi Gemini API HTTP {e.code}: {body}")
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(backoff_seconds)
            backoff_seconds *= 2

    raise RuntimeError("Vượt quá số lần thử Gemini API!")


def query_gemini_with_cache(
    db: Session,
    prompt_type: str,
    prompt_text: str,
    content_chunk: str
) -> Dict[str, Any]:
    """
    Queries Gemini API with mandatory SQLite caching.
    Explicitly discloses whether response comes from SQLite Cache or Live Gemini API.
    """
    input_hash = get_input_hash(prompt_type, content_chunk)

    # 1. Check SQLite Cache
    cached = db.query(AICache).filter(AICache.input_hash == input_hash).first()
    if cached:
        print(f"[SQLITE CACHE HIT] prompt_type='{prompt_type}', hash={input_hash[:10]}... (Returned from DB cache, 0 API tokens spent)")
        try:
            return json.loads(cached.response_json)
        except json.JSONDecodeError:
            pass

    print(f"[SQLITE CACHE MISS] prompt_type='{prompt_type}', hash={input_hash[:10]}... Triggering live Gemini API request...")
    
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
        print(f"[GEMINI JSON PARSE WARNING] Direct json.loads failed: {parse_err}. Attempting regex repair...")
        arr_match = re.search(r'\[.*\]', cleaned_response, re.DOTALL)
        obj_match = re.search(r'\{.*\}', cleaned_response, re.DOTALL)
        
        parsed_json = None
        if arr_match:
            try:
                parsed_json = json.loads(arr_match.group(0))
            except Exception:
                pass
        if not parsed_json and obj_match:
            try:
                parsed_json = json.loads(obj_match.group(0))
            except Exception:
                pass

        if not parsed_json and cleaned_response.startswith("["):
            last_brace = cleaned_response.rfind("}")
            if last_brace != -1:
                truncated_array = cleaned_response[:last_brace + 1].strip() + "]"
                try:
                    parsed_json = json.loads(truncated_array)
                    print(f"[GEMINI JSON REPAIR SUCCESS] Truncated JSON array repaired cleanly! Parsed {len(parsed_json)} valid items.")
                except Exception:
                    pass

        if parsed_json is None:
            print(f"[GEMINI JSON PARSE ERROR] Failed to parse JSON response ({len(cleaned_response)} chars):\n{cleaned_response[:500]}...")
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
