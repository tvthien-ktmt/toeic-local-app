import re
from typing import List, Dict, Any, Optional

def chunk_markdown_document(markdown_text: str, doc_type: str) -> List[Dict[str, Any]]:
    """
    Splits Markdown document into Part chunks (Part 5, 6, 7 or Listening Part 1-4).
    """
    chunks = []
    if not markdown_text or not markdown_text.strip():
        return chunks

    if doc_type == "RC_EXAM":
        # Strategy 1: Look for PART headings or 'Questions XXX-XXX'
        part5_match = re.search(r'(?i)(#+\s*PART\s*5|PART\s*5|Questions?\s*101[\s\-–]+130)', markdown_text)
        part6_match = re.search(r'(?i)(#+\s*PART\s*6|PART\s*6|Questions?\s*131[\s\-–]+146)', markdown_text)
        part7_match = re.search(r'(?i)(#+\s*PART\s*7|PART\s*7|Questions?\s*147[\s\-–]+200)', markdown_text)

        p5_pos = part5_match.start() if part5_match else -1
        p6_pos = part6_match.start() if part6_match else -1
        p7_pos = part7_match.start() if part7_match else -1

        # If headings found, slice according to positions
        positions = []
        if p5_pos != -1: positions.append((p5_pos, 5))
        if p6_pos != -1: positions.append((p6_pos, 6))
        if p7_pos != -1: positions.append((p7_pos, 7))

        positions.sort(key=lambda x: x[0])

        if positions:
            for idx, (pos, part_num) in enumerate(positions):
                start = pos
                end = positions[idx + 1][0] if idx + 1 < len(positions) else len(markdown_text)
                part_text = markdown_text[start:end].strip()
                if part_text:
                    chunks.append({"part": part_num, "content": part_text})
        else:
            # Fallback strategy: Regex search for question numbers 101..130 -> Part 5, 131..146 -> Part 6, 147..200 -> Part 7
            q101 = re.search(r'\b101\.', markdown_text)
            q131 = re.search(r'\b131\.', markdown_text)
            q147 = re.search(r'\b147\.', markdown_text)

            pos2 = []
            if q101: pos2.append((q101.start(), 5))
            if q131: pos2.append((q131.start(), 6))
            if q147: pos2.append((q147.start(), 7))
            pos2.sort(key=lambda x: x[0])

            if pos2:
                for idx, (pos, part_num) in enumerate(pos2):
                    start = pos
                    end = pos2[idx + 1][0] if idx + 1 < len(pos2) else len(markdown_text)
                    part_text = markdown_text[start:end].strip()
                    if part_text:
                        chunks.append({"part": part_num, "content": part_text})
            else:
                # Could not detect clear boundary: flag for manual review, return full text as Part 5 or unclassified
                chunks.append({"part": 5, "content": markdown_text, "needs_review": True})

    elif doc_type == "LC_TRANSCRIPT":
        # Look for PART 1, PART 2, PART 3, PART 4 in transcript
        matches = list(re.finditer(r'(?i)(#+\s*PART\s*([1-4])|PART\s*([1-4]))', markdown_text))
        if matches:
            for idx, match in enumerate(matches):
                part_num = int(match.group(2) or match.group(3))
                start = match.start()
                end = matches[idx + 1].start() if idx + 1 < len(matches) else len(markdown_text)
                part_text = markdown_text[start:end].strip()
                if part_text:
                    chunks.append({"part": part_num, "content": part_text})
        else:
            # Fallback: full text as Part 1 or general transcript
            chunks.append({"part": 1, "content": markdown_text, "needs_review": True})

    return chunks
