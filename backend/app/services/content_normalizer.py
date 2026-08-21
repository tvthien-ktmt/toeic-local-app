import re
import json
from typing import Dict, Any, List, Optional, Tuple

def parse_inline_nodes(text: str) -> List[Dict[str, Any]]:
    """
    Parses a string into a list of structured inline nodes:
    - text
    - bold (**text**)
    - italic (*text* or _text_)
    - blank ([131] or [132])
    - position_marker ([1], [2], [3], [4])
    """
    if not text:
        return []

    # Combined regex pattern for inline elements
    pattern = re.compile(
        r'(\*\*(.+?)\*\*)'                    # 1, 2: bold
        r'|(\*([^\*]+?)\*)'                   # 3, 4: italic
        r'|(\[([1-4])\])'                     # 5, 6: position marker [1]..[4]
        r'|(\[(\d{3})\]|-------|\b_{3,}\b)'   # 7, 8: blank [131] or -------
    )

    nodes: List[Dict[str, Any]] = []
    last_idx = 0

    for m in pattern.finditer(text):
        start, end = m.span()
        if start > last_idx:
            pre_text = text[last_idx:start]
            if pre_text:
                nodes.append({"type": "text", "text": pre_text})

        if m.group(1):  # Bold
            nodes.append({"type": "bold", "text": m.group(2)})
        elif m.group(3):  # Italic
            nodes.append({"type": "italic", "text": m.group(4)})
        elif m.group(5):  # Position Marker [1]..[4]
            pos = int(m.group(6))
            nodes.append({
                "type": "position_marker",
                "position": pos,
                "markerId": f"POS-{pos}",
                "text": f"[{pos}]"
            })
        elif m.group(7):  # Blank
            q_num_str = m.group(8)
            q_num = int(q_num_str) if q_num_str else None
            nodes.append({
                "type": "blank",
                "questionNumber": q_num,
                "blankId": f"BLANK-{q_num}" if q_num else "BLANK",
                "text": f"[{q_num}]" if q_num else "_______"
            })

        last_idx = end

    if last_idx < len(text):
        rem_text = text[last_idx:]
        if rem_text:
            nodes.append({"type": "text", "text": rem_text})

    return nodes if nodes else [{"type": "text", "text": text}]


def detect_document_type(text: str, header: str = "") -> str:
    """Detects document type from passage text or header."""
    comb = (header + " " + text[:500]).lower()
    if any(k in comb for k in ["e-mail", "email", "from:", "to:", "subject:"]):
        return "EMAIL"
    if any(k in comb for k in ["chat", "discussion", "instant message", "text message"]):
        return "CHAT"
    if any(k in comb for k in ["web page", "website", "http://", "https://", "www.", ".com"]):
        return "WEBPAGE"
    if any(k in comb for k in ["receipt", "invoice", "cashier", "subtotal", "total: $"]):
        return "RECEIPT"
    if any(k in comb for k in ["schedule", "agenda", "timetable", "flight schedule"]):
        return "SCHEDULE"
    if any(k in comb for k in ["notice", "announcement", "warning:"]):
        return "NOTICE"
    if any(k in comb for k in ["memo", "memorandum"]):
        return "MEMO"
    if any(k in comb for k in ["article", "newspaper", "press release", "journal", "report"]):
        return "ARTICLE"
    if any(k in comb for k in ["advertisement", "ad", "for sale", "hiring", "special offer"]):
        return "ADVERTISEMENT"
    if any(k in comb for k in ["form", "application", "survey", "questionnaire"]):
        return "FORM"
    return "GENERIC"


def parse_email_metadata(lines: List[str]) -> Tuple[Dict[str, Any], List[str]]:
    """Extracts email header fields (From, To, Date, Subject, Attachments) from start of document."""
    meta = {
        "from": "",
        "to": "",
        "date": "",
        "subject": "",
        "cc": [],
        "attachments": []
    }
    body_lines: List[str] = []
    in_header = True

    for line in lines:
        if in_header:
            m_from = re.match(r'^(?:\*\*)?From:\s*(?:\*\*)?\s*(.*)$', line, re.IGNORECASE)
            m_to = re.match(r'^(?:\*\*)?To:\s*(?:\*\*)?\s*(.*)$', line, re.IGNORECASE)
            m_date = re.match(r'^(?:\*\*)?Date:\s*(?:\*\*)?\s*(.*)$', line, re.IGNORECASE)
            m_subj = re.match(r'^(?:\*\*)?Subject:\s*(?:\*\*)?\s*(.*)$', line, re.IGNORECASE)
            m_att = re.match(r'^(?:\*\*)?Attachments?:\s*(?:\*\*)?\s*(.*)$', line, re.IGNORECASE)

            if m_from:
                meta["from"] = m_from.group(1).strip()
            elif m_to:
                meta["to"] = m_to.group(1).strip()
            elif m_date:
                meta["date"] = m_date.group(1).strip()
            elif m_subj:
                meta["subject"] = m_subj.group(1).strip()
            elif m_att:
                meta["attachments"].append(m_att.group(1).strip())
            elif line.strip() == "" or line.strip() == "---":
                if meta["from"] or meta["to"] or meta["subject"]:
                    in_header = False
            else:
                if meta["from"] or meta["to"] or meta["subject"]:
                    in_header = False
                    body_lines.append(line)
                else:
                    body_lines.append(line)
        else:
            body_lines.append(line)

    return meta, body_lines


def parse_chat_messages(lines: List[str]) -> List[Dict[str, Any]]:
    """Parses chat dialogues e.g. [1:43 P.M.] Jody Rodriguez: message."""
    messages: List[Dict[str, Any]] = []
    chat_pat = re.compile(r'^(?:\[?(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\]?\s+)?(?:\*\*)?([A-Za-z\s\.\-]+?)(?:\*\*)?:\s*(.*)$')

    for line in lines:
        if not line.strip():
            continue
        m = chat_pat.match(line.strip())
        if m:
            messages.append({
                "time": (m.group(1) or "").strip(),
                "speaker": (m.group(2) or "Speaker").strip(),
                "text": m.group(3).strip(),
                "children": parse_inline_nodes(m.group(3).strip())
            })
        else:
            if messages:
                messages[-1]["text"] += " " + line.strip()
                messages[-1]["children"] = parse_inline_nodes(messages[-1]["text"])
            else:
                messages.append({
                    "time": "",
                    "speaker": "Speaker",
                    "text": line.strip(),
                    "children": parse_inline_nodes(line.strip())
                })

    return messages


def parse_table_block(table_lines: List[str]) -> Optional[Dict[str, Any]]:
    """Parses Markdown / ASCII table into structured headers and rows."""
    if len(table_lines) < 2:
        return None

    rows: List[List[str]] = []
    for line in table_lines:
        if re.match(r'^\s*\|?\s*[-:]+[-|\s:]*$', line):
            continue  # separator row
        cols = [c.strip() for c in line.split('|')]
        # Filter out empty leading/trailing elements from | col1 | col2 |
        if len(cols) >= 2 and cols[0] == '' and cols[-1] == '':
            cols = cols[1:-1]
        elif len(cols) >= 1 and cols[0] == '':
            cols = cols[1:]
        elif len(cols) >= 1 and cols[-1] == '':
            cols = cols[:-1]
        if any(cols):
            rows.append(cols)

    if not rows:
        return None

    headers = rows[0]
    data_rows = rows[1:] if len(rows) > 1 else []
    return {
        "type": "table",
        "headers": headers,
        "rows": data_rows
    }


def parse_raw_passage_to_blocks(raw_text: str, doc_type: str) -> List[Dict[str, Any]]:
    """Parses raw text into structured semantic blocks."""
    blocks: List[Dict[str, Any]] = []
    lines = raw_text.strip().split('\n')

    # If document is email, extract email headers first
    if doc_type == "EMAIL":
        meta, rem_lines = parse_email_metadata(lines)
        if any(meta.values()):
            blocks.append({
                "type": "metadata",
                "metadataType": "EMAIL_HEADER",
                "data": meta
            })
        lines = rem_lines

    # If document is chat
    if doc_type == "CHAT":
        chat_msgs = parse_chat_messages(lines)
        if chat_msgs:
            blocks.append({
                "type": "chat_dialog",
                "messages": chat_msgs
            })
            return blocks

    # Process paragraphs, headings, lists, tables
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue

        # Divider
        if line in ["---", "***", "___"]:
            blocks.append({"type": "divider"})
            i += 1
            continue

        # Heading (# Heading or **HEADING**)
        m_head = re.match(r'^(#{1,3})\s+(.*)$', line)
        if m_head:
            level = len(m_head.group(1))
            h_text = m_head.group(2).strip()
            blocks.append({
                "type": "heading" if level <= 2 else "subheading",
                "text": h_text,
                "children": parse_inline_nodes(h_text)
            })
            i += 1
            continue

        # Table detection
        if '|' in line and (i + 1 < len(lines) and '|' in lines[i + 1]):
            tbl_lines = []
            while i < len(lines) and '|' in lines[i]:
                tbl_lines.append(lines[i])
                i += 1
            tbl_block = parse_table_block(tbl_lines)
            if tbl_block:
                blocks.append(tbl_block)
                continue
            else:
                for tl in tbl_lines:
                    blocks.append({"type": "paragraph", "text": tl, "children": parse_inline_nodes(tl)})
                continue

        # List item (- item or * item or 1. item)
        m_list = re.match(r'^[-*•]\s+(.*)$', line)
        if m_list:
            list_items = []
            while i < len(lines) and re.match(r'^[-*•]\s+(.*)$', lines[i].strip()):
                list_items.append(re.match(r'^[-*•]\s+(.*)$', lines[i].strip()).group(1).strip())
                i += 1
            blocks.append({
                "type": "list",
                "items": [
                    {"text": item, "children": parse_inline_nodes(item)}
                    for item in list_items
                ]
            })
            continue

        # Signature detection
        if any(line.lower().startswith(k) for k in ["sincerely,", "best regards,", "cordially,", "regards,"]):
            sig_lines = [line]
            i += 1
            while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith("#"):
                sig_lines.append(lines[i].strip())
                i += 1
            blocks.append({
                "type": "signature",
                "text": "\n".join(sig_lines),
                "children": parse_inline_nodes(" ".join(sig_lines))
            })
            continue

        # Standard paragraph
        p_lines = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith(("#", "-", "*", "|")) and lines[i].strip() not in ["---", "***"]:
            p_lines.append(lines[i].strip())
            i += 1

        full_p = " ".join(p_lines)
        blocks.append({
            "type": "paragraph",
            "text": full_p,
            "children": parse_inline_nodes(full_p)
        })

    return blocks


def split_multi_document_text(raw_text: str) -> List[Tuple[str, str, str]]:
    """
    Splits multi-document passages (Double/Triple) by '---' dividers or document headings.
    Returns list of (doc_title, doc_type, doc_content).
    """
    # Split by standard '---' or '***' divider
    parts = re.split(r'\n\s*[-*_]{3,}\s*\n', raw_text)
    if len(parts) > 1:
        docs = []
        for idx, p in enumerate(parts):
            p_clean = p.strip()
            if not p_clean:
                continue
            first_line = p_clean.split('\n')[0].strip('#* ')
            d_type = detect_document_type(p_clean, first_line)
            docs.append((first_line or f"Document {idx+1}", d_type, p_clean))
        if len(docs) > 1:
            return docs

    # Single document fallback
    first_line = raw_text.strip().split('\n')[0].strip('#* ') if raw_text.strip() else ""
    d_type = detect_document_type(raw_text, first_line)
    return [(first_line or "Document", d_type, raw_text)]


def classify_question_type(prompt_text: str, options: List[Dict[str, Any]]) -> str:
    """Classifies question into TOEIC taxonomy."""
    p_low = prompt_text.lower()

    if any(k in p_low for k in ["in which of the positions", "marked [1]", "marked [2]", "marked [3]", "marked [4]"]):
        return "SENTENCE_INSERTION"
    if any(k in p_low for k in ["closest in meaning to", "in line", "most nearly means"]):
        return "VOCABULARY"
    if any(k in p_low for k in ["what is indicated", "what is mentioned", "according to the", "what time", "how much", "who is"]):
        return "DETAIL"
    if any(k in p_low for k in ["why", "purpose of", "reason for"]):
        return "PURPOSE"
    if any(k in p_low for k in ["main idea", "mainly about", "what is the topic"]):
        return "MAIN_IDEA"
    if any(k in p_low for k in ["what is implied", "what can be inferred", "most likely", "probably"]):
        return "INFERENCE"
    if any(k in p_low for k in ["not mentioned", "not indicated", "not true", "except"]):
        return "NEGATIVE"

    return "DETAIL"


def normalize_full_test(test_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforms raw test dictionary into the formal structured runtime JSON schema
    specified in Render_QuestionRC.md.
    """
    test_number = test_dict.get("test_number", 1)
    normalized = {
        "test_number": test_number,
        "title": f"TOEIC Reading Test {test_number:02d}",
        "duration_seconds": 4500,
        "total_questions": 100,
        "parts": {
            "part5": {
                "part": 5,
                "title": "Part 5: Incomplete Sentences",
                "start_q": 101,
                "end_q": 130,
                "questions": []
            },
            "part6": {
                "part": 6,
                "title": "Part 6: Text Completion",
                "start_q": 131,
                "end_q": 146,
                "passages": []
            },
            "part7": {
                "part": 7,
                "title": "Part 7: Reading Comprehension",
                "start_q": 147,
                "end_q": 200,
                "passage_sets": []
            }
        }
    }

    # 1. Normalize Part 5
    for q in test_dict.get("parts", {}).get("part5", {}).get("questions", []):
        q_num = q.get("number") or q.get("q_num", 101)
        q_stem_text = q.get("question") or q.get("question_text", "")
        # Clean leading numbers e.g. "101. "
        q_stem_text = re.sub(r'^\s*\d{3}\.?\s*', '', q_stem_text)

        # Parse options
        raw_opts = q.get("options", {})
        formatted_opts = []
        if isinstance(raw_opts, dict):
            for key in ["A", "B", "C", "D"]:
                if key in raw_opts:
                    formatted_opts.append({"key": key, "text": str(raw_opts[key])})
        elif isinstance(raw_opts, list):
            for opt_entry in raw_opts:
                if isinstance(opt_entry, str):
                    m_opt = re.match(r'^\s*\(?([A-D])\)?[\.\s]+(.*)$', opt_entry)
                    if m_opt:
                        formatted_opts.append({"key": m_opt.group(1).upper(), "text": m_opt.group(2).strip()})
                    else:
                        formatted_opts.append({"key": chr(65 + len(formatted_opts)), "text": opt_entry})
                elif isinstance(opt_entry, dict):
                    formatted_opts.append(opt_entry)

        normalized["parts"]["part5"]["questions"].append({
            "number": q_num,
            "part": 5,
            "question_type": "INCOMPLETE_SENTENCE",
            "stem": {
                "type": "paragraph",
                "text": q_stem_text,
                "children": parse_inline_nodes(q_stem_text)
            },
            "options": formatted_opts,
            "correct_answer": q.get("answer") or q.get("correct_answer", ""),
            "explanation": q.get("explanation", "")
        })

    # 2. Normalize Part 6
    p6_groups = test_dict.get("parts", {}).get("part6", {}).get("passage_groups", [])
    for p_idx, g in enumerate(p6_groups, 1):
        s_q = g.get("start_q", 131)
        e_q = g.get("end_q", 134)
        raw_p = g.get("raw_passage", "")
        hdr = g.get("header", f"Questions {s_q}-{e_q} refer to the following text.")
        d_type = detect_document_type(raw_p, hdr)

        # Parse passage into structured blocks
        blocks = parse_raw_passage_to_blocks(raw_p, d_type)

        # Parse questions
        p6_qs = []
        for q in g.get("questions", []):
            q_num = q.get("number") or q.get("q_num", s_q)
            q_stem = q.get("question") or q.get("question_text", "")
            q_stem = re.sub(r'^\s*\d{3}\.?\s*', '', q_stem).strip()
            if not q_stem:
                q_stem = "Select the best answer."

            raw_opts = q.get("options", {})
            formatted_opts = []
            if isinstance(raw_opts, dict):
                for key in ["A", "B", "C", "D"]:
                    if key in raw_opts:
                        formatted_opts.append({"key": key, "text": str(raw_opts[key])})
            elif isinstance(raw_opts, list):
                for opt_entry in raw_opts:
                    if isinstance(opt_entry, str):
                        m_opt = re.match(r'^\s*\(?([A-D])\)?[\.\s]+(.*)$', opt_entry)
                        if m_opt:
                            formatted_opts.append({"key": m_opt.group(1).upper(), "text": m_opt.group(2).strip()})
                        else:
                            formatted_opts.append({"key": chr(65 + len(formatted_opts)), "text": opt_entry})
                    elif isinstance(opt_entry, dict):
                        formatted_opts.append(opt_entry)

            p6_qs.append({
                "number": q_num,
                "part": 6,
                "question_type": "TEXT_COMPLETION",
                "linked_blank_id": f"BLANK-{q_num}",
                "stem": {
                    "type": "paragraph",
                    "text": q_stem,
                    "children": parse_inline_nodes(q_stem)
                },
                "options": formatted_opts,
                "correct_answer": q.get("answer") or q.get("correct_answer", ""),
                "explanation": q.get("explanation", "")
            })

        normalized["parts"]["part6"]["passages"].append({
            "passage_id": f"P6-T{test_number:02d}-G{p_idx:02d}",
            "header": hdr,
            "start_q": s_q,
            "end_q": e_q,
            "document_type": d_type,
            "blocks": blocks,
            "questions": p6_qs
        })

    # 3. Normalize Part 7
    p7_groups = test_dict.get("parts", {}).get("part7", {}).get("passage_groups", [])
    for p_idx, g in enumerate(p7_groups, 1):
        s_q = g.get("start_q", 147)
        e_q = g.get("end_q", 148)
        raw_p = g.get("raw_passage", "")
        hdr = g.get("header", f"Questions {s_q}-{e_q} refer to the following text.")

        # Check multi-document
        doc_splits = split_multi_document_text(raw_p)
        num_docs = len(doc_splits)
        p_type = "SINGLE" if num_docs == 1 else ("DOUBLE" if num_docs == 2 else "TRIPLE")

        documents = []
        for d_i, (d_title, d_type, d_content) in enumerate(doc_splits, 1):
            d_blocks = parse_raw_passage_to_blocks(d_content, d_type)
            documents.append({
                "document_id": f"DOC-{d_i}",
                "document_type": d_type,
                "title": d_title,
                "blocks": d_blocks
            })

        # Parse questions
        p7_qs = []
        for q in g.get("questions", []):
            q_num = q.get("number") or q.get("q_num", s_q)
            q_stem = q.get("question") or q.get("question_text", "")
            q_stem = re.sub(r'^\s*\d{3}\.?\s*', '', q_stem).strip()

            raw_opts = q.get("options", {})
            formatted_opts = []
            if isinstance(raw_opts, dict):
                for key in ["A", "B", "C", "D"]:
                    if key in raw_opts:
                        opt_val = str(raw_opts[key])
                        # Handle position options for sentence insertion e.g. [1], [2]
                        m_pos = re.match(r'^\s*\[([1-4])\]\s*$', opt_val)
                        if m_pos:
                            formatted_opts.append({
                                "key": key,
                                "position": int(m_pos.group(1)),
                                "text": opt_val
                            })
                        else:
                            formatted_opts.append({"key": key, "text": opt_val})
            elif isinstance(raw_opts, list):
                for opt_entry in raw_opts:
                    if isinstance(opt_entry, str):
                        m_opt = re.match(r'^\s*\(?([A-D])\)?[\.\s]+(.*)$', opt_entry)
                        if m_opt:
                            formatted_opts.append({"key": m_opt.group(1).upper(), "text": m_opt.group(2).strip()})
                        else:
                            formatted_opts.append({"key": chr(65 + len(formatted_opts)), "text": opt_entry})
                    elif isinstance(opt_entry, dict):
                        formatted_opts.append(opt_entry)

            q_type = classify_question_type(q_stem, formatted_opts)

            p7_qs.append({
                "number": q_num,
                "part": 7,
                "question_type": q_type,
                "stem": {
                    "type": "paragraph",
                    "text": q_stem,
                    "children": parse_inline_nodes(q_stem)
                },
                "options": formatted_opts,
                "correct_answer": q.get("answer") or q.get("correct_answer", ""),
                "explanation": q.get("explanation", "")
            })

        normalized["parts"]["part7"]["passage_sets"].append({
            "passage_set_id": f"P7-T{test_number:02d}-SET{p_idx:02d}",
            "header": hdr,
            "start_q": s_q,
            "end_q": e_q,
            "passage_type": p_type,
            "documents": documents,
            "questions": p7_qs
        })

    return normalized


def extract_true_question_number(q_text: str, fallback_num: int) -> int:
    """
    Extracts the precise TOEIC 3-digit question number (101-200) from question text,
    ignoring passage headers like 'Questions 131-134 refer to...'.
    """
    cleaned = re.sub(
        r'^\s*(?:\*\*)?Questions?\s+\d{3}\s*[-–]\s*\d{3}\s+refer\s+to\s+the\s+following\s+[^.\n*]+[\.\*]?\s*(?:\*\*)?',
        '',
        q_text,
        flags=re.IGNORECASE
    )
    m = re.search(r'(?:^|\n)\s*(?:Questions?\s+)?(\d{3})\.\s+', cleaned)
    if m:
        return int(m.group(1))
    m2 = re.findall(r'(?:^|\n|\s)(\d{3})\.\s+', cleaned)
    if m2:
        return int(m2[-1])
    return fallback_num


def extract_clean_stem_and_passage(q_text: str, q_num: int) -> Tuple[int, int, str, str, str]:
    """
    Extracts start question, end question, document type, raw passage text,
    and prompt stem from question content.
    """
    m_head = re.search(
        r'Questions?\s+(\d{3})\s*[-–]\s*(\d{3})\s+refer\s+to\s+the\s+following\s+([^.\n*]+)[\.\*]?',
        q_text,
        re.IGNORECASE
    )
    if m_head:
        s_q = int(m_head.group(1))
        e_q = int(m_head.group(2))
        doc_type = m_head.group(3).strip()
        after_head = q_text[m_head.end():].strip()
        
        m_q_start = re.search(
            r'(?:\n\n|\n)\s*(?:Questions?\s+)?' + str(q_num) + r'\.\s+(.*)$',
            after_head,
            re.DOTALL
        )
        if m_q_start:
            p_text = after_head[:m_q_start.start()].strip()
            q_stem = m_q_start.group(0).strip()
        else:
            m_any_q = re.search(r'(?:\n\n|\n)\s*(?:Questions?\s+)?\d{3}\.\s+(.*)$', after_head, re.DOTALL)
            if m_any_q:
                p_text = after_head[:m_any_q.start()].strip()
                q_stem = m_any_q.group(0).strip()
            else:
                p_text = after_head
                q_stem = f"{q_num}. Choose the best answer."
        return s_q, e_q, doc_type, p_text, q_stem
    else:
        return q_num, q_num, "text", "", q_text


def get_normalized_exam_payload(doc: Any, qs: List[Any], mode: Optional[str] = None) -> Dict[str, Any]:
    """
    Builds the complete structured TOEIC RC runtime payload for an exam document.
    Ensures all 100 questions in Part 5, 6, and 7 are correctly numbered,
    properly grouped into passage sets, and preserved without loss.
    """
    is_secure = (mode == "full_exam")
    
    # 1. Format raw questions into intermediate structure with exact sequential numbering
    raw_qs = []
    for index, q in enumerate(qs, 101):
        try:
            options = json.loads(q.options_json) if q.options_json else []
        except Exception:
            options = []

        q_num = extract_true_question_number(q.question_text, index)
        part_num = q.part or (5 if q_num <= 130 else (6 if q_num <= 146 else 7))
        
        try:
            opt_exps = json.loads(q.option_explanations_json) if q.option_explanations_json else {}
            if isinstance(opt_exps, dict) and not any(v and str(v).strip() not in ('—', '-') for v in opt_exps.values()):
                opt_exps = {}
        except Exception:
            opt_exps = {}

        raw_qs.append({
            "id": q.id,
            "q_num": q_num,
            "number": q_num,
            "part": part_num,
            "question_text": q.question_text,
            "options": options,
            "correct_answer": "" if is_secure else q.correct_answer,
            "explanation": "" if is_secure else q.explanation,
            "option_explanations": {} if is_secure else opt_exps,
            "translated_sentence": "" if is_secure else q.translated_sentence,
            "grammar_topic": q.grammar_topic if (q.grammar_topic and not q.grammar_topic.lower().startswith(f"part {part_num}")) else f"Part {part_num}",
            "common_trap": "" if is_secure else q.common_trap
        })

    raw_qs.sort(key=lambda item: item["number"])

    # 2. Build test dict structure
    test_dict = {
        "test_number": doc.test_number or 1,
        "parts": {
            "part5": {"questions": []},
            "part6": {"passage_groups": []},
            "part7": {"passage_groups": []}
        }
    }

    for q in raw_qs:
        qn = q["number"]
        if 101 <= qn <= 130 or q["part"] == 5:
            test_dict["parts"]["part5"]["questions"].append(q)
        elif 131 <= qn <= 146 or q["part"] == 6:
            s_q, e_q, doc_type, p_txt, q_stem = extract_clean_stem_and_passage(q["question_text"], qn)
            if s_q == qn and e_q == qn:
                chunk_start = 131 + ((qn - 131) // 4) * 4
                chunk_end = min(146, chunk_start + 3)
                s_q, e_q = chunk_start, chunk_end

            g_found = False
            for g in test_dict["parts"]["part6"]["passage_groups"]:
                if g["start_q"] == s_q and g["end_q"] == e_q:
                    q_copy = dict(q)
                    q_copy["question_text"] = q_stem
                    g["questions"].append(q_copy)
                    if not g["raw_passage"] and p_txt:
                        g["raw_passage"] = p_txt
                    g_found = True
                    break

            if not g_found:
                q_copy = dict(q)
                q_copy["question_text"] = q_stem
                test_dict["parts"]["part6"]["passage_groups"].append({
                    "start_q": s_q,
                    "end_q": e_q,
                    "header": f"Questions {s_q}-{e_q} refer to the following {doc_type}.",
                    "raw_passage": p_txt,
                    "questions": [q_copy]
                })
        else:
            s_q, e_q, doc_type, p_txt, q_stem = extract_clean_stem_and_passage(q["question_text"], qn)
            g_found = False
            for g in test_dict["parts"]["part7"]["passage_groups"]:
                if g["start_q"] == s_q and g["end_q"] == e_q:
                    q_copy = dict(q)
                    q_copy["question_text"] = q_stem
                    g["questions"].append(q_copy)
                    if not g["raw_passage"] and p_txt:
                        g["raw_passage"] = p_txt
                    g_found = True
                    break

            if not g_found:
                q_copy = dict(q)
                q_copy["question_text"] = q_stem
                test_dict["parts"]["part7"]["passage_groups"].append({
                    "start_q": s_q,
                    "end_q": e_q,
                    "header": f"Questions {s_q}-{e_q} refer to the following {doc_type}.",
                    "raw_passage": p_txt,
                    "questions": [q_copy]
                })

    norm_res = normalize_full_test(test_dict)
    
    return {
        "status": "success",
        "document": {
            "id": doc.id,
            "filename": doc.filename,
            "category": doc.category,
            "series": doc.series,
            "test_number": doc.test_number,
            "markdown_content": doc.markdown_content,
            "is_builtin": doc.is_builtin
        },
        "total_questions": len(raw_qs),
        "parts": norm_res["parts"],
        "questions": raw_qs
    }

