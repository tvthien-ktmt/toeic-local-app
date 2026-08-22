"""FastAPI router for TOEIC Listening Comprehension (LC) endpoints.

Provides endpoints for LC test catalog, test data retrieval, answer submission
with scaled score (5 to 495) calculation, dictation exercises, shadowing,
trap training, and SRS error bank tracking.
"""

from typing import Dict, Any, List, Optional, Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db import get_db
from ..constants.scoring import TOEIC_LC_SCORE_TABLE

router = APIRouter(prefix="/api/listening", tags=["TOEIC Listening Comprehension (LC)"])


def _create_series_tests(series_name: str, category: str, start_id: int, count: int = 10) -> List[Dict[str, Any]]:
    tests = []
    for index in range(1, count + 1):
        formatted_num = f"0{index}" if index < 10 else f"{index}"
        tests.append({
            "id": start_id + index,
            "title": f"{series_name} — Test {formatted_num}",
            "series": series_name,
            "category": category,
            "test_number": index,
            "total_questions": 100,
            "duration_minutes": 45,
            "is_builtin": True,
            "has_content": False
        })
    return tests


class LcSubmitRequest(BaseModel):
    test_id: int
    mode: str = "full_exam"  # full_exam / practice
    time_spent_seconds: int = 0
    answers: Dict[str, str]  # { "1": "A", "2": "B", ... }
    answer_key: Optional[Dict[str, str]] = None  # { "1": "C", "2": "A", ... } — correct answers for grading


@router.get("/catalog")
def get_listening_catalog() -> List[Dict[str, Any]]:
    """Returns complete catalog of TOEIC Listening textbooks matching all RC series."""
    return [
        {
            "category": "ETS",
            "title": "ETS TOEIC Listening (Trọn Bộ 2017 - 2026)",
            "description": "Bộ đề thi chuẩn ETS chính thức từ Viện Khảo thí Giáo dục Hoa Kỳ với giọng đọc chuẩn 4 accent: Mỹ, Anh, Úc, Canada.",
            "badge": "Chuẩn 100% Thi Thật",
            "series": [
                {"series_title": "ETS 2026 LC", "total_tests": 10, "tests": _create_series_tests("ETS 2026 LC", "ETS", 1000, 10)},
                {"series_title": "ETS 2024 LC", "total_tests": 10, "tests": _create_series_tests("ETS 2024 LC", "ETS", 1100, 10)},
                {"series_title": "ETS 2023 LC", "total_tests": 10, "tests": _create_series_tests("ETS 2023 LC", "ETS", 1200, 10)},
                {"series_title": "ETS 2022 LC", "total_tests": 10, "tests": _create_series_tests("ETS 2022 LC", "ETS", 1300, 10)},
                {"series_title": "ETS 2021 LC", "total_tests": 10, "tests": _create_series_tests("ETS 2021 LC", "ETS", 1400, 10)},
                {"series_title": "ETS 2020 LC", "total_tests": 10, "tests": _create_series_tests("ETS 2020 LC", "ETS", 1500, 10)},
                {"series_title": "ETS 2019 LC", "total_tests": 10, "tests": _create_series_tests("ETS 2019 LC", "ETS", 1600, 10)},
                {"series_title": "ETS 2018 LC", "total_tests": 10, "tests": _create_series_tests("ETS 2018 LC", "ETS", 1700, 10)},
                {"series_title": "ETS 2017 LC", "total_tests": 10, "tests": _create_series_tests("ETS 2017 LC", "ETS", 1800, 10)},
            ]
        },
        {
            "category": "HACKER",
            "title": "Hackers TOEIC Listening (Nâng Cao & Tốc Độ Nhanh)",
            "description": "Bộ sách luyện nghe nâng cao với ngữ điệu đa dạng, tốc độ nói nhanh (1.1x) và cạm bẫy từ vựng chuyên sâu.",
            "badge": "Nâng Cao (Hard)",
            "series": [
                {"series_title": "HACKER VOL 3 LC", "total_tests": 12, "tests": _create_series_tests("HACKER VOL 3 LC", "HACKER", 2000, 12)}
            ]
        },
        {
            "category": "YBM",
            "title": "YBM TOEIC Listening (Thực Chiến Sát Đề Thi Thật)",
            "description": "Được biên soạn bởi tổ chức độc quyền tổ chức thi TOEIC tại Hàn Quốc, độ khó và độ dài tương đương 100% đề thi thật.",
            "badge": "Thực Chiến",
            "series": [
                {"series_title": "YBM 2026 LC", "total_tests": 10, "tests": _create_series_tests("YBM 2026 LC", "YBM", 3000, 10)},
                {"series_title": "YBM 2025 LC", "total_tests": 10, "tests": _create_series_tests("YBM 2025 LC", "YBM", 3100, 10)},
                {"series_title": "YBM Vol 3 LC", "total_tests": 10, "tests": _create_series_tests("YBM Vol 3 LC", "YBM", 3200, 10)},
                {"series_title": "YBM Vol 2 LC", "total_tests": 10, "tests": _create_series_tests("YBM Vol 2 LC", "YBM", 3300, 10)},
                {"series_title": "YBM Vol 1 LC", "total_tests": 10, "tests": _create_series_tests("YBM Vol 1 LC", "YBM", 3400, 10)},
            ]
        },
        {
            "category": "XANH CAM",
            "title": "Xanh Cam TOEIC Listening (Luyện Phản Xạ & Bẫy Đề)",
            "description": "Bộ sách kinh điển rèn luyện phản xạ bắt từ khóa và cạm bẫy Part 2 & 3.",
            "badge": "Luyện Phản Xạ",
            "series": [
                {"series_title": "Xanh Cam Vol 2 LC", "total_tests": 10, "tests": _create_series_tests("Xanh Cam Vol 2 LC", "XANH CAM", 4000, 10)},
                {"series_title": "Xanh Cam Vol 1 LC", "total_tests": 10, "tests": _create_series_tests("Xanh Cam Vol 1 LC", "XANH CAM", 4100, 10)},
            ]
        }
    ]


@router.post("/submit")
def submit_listening_exam(
    payload: LcSubmitRequest,
    db: Annotated[Session, Depends(get_db)]
) -> Dict[str, Any]:
    """Calculates scaled score (5 to 495) and diagnostic breakdown for submitted LC answers.

    Compares each user answer against the correct answer key sent in the payload.
    LC exam scoring currently runs client-side (via lcScoreCalculator.ts), but this
    endpoint exists for future backend persistence and cross-validation.
    """
    user_answers = payload.answers
    answer_key = getattr(payload, 'answer_key', {}) or {}
    total_questions = max(1, len(answer_key)) if answer_key else 100

    # Compare each user answer against the provided answer key
    raw_correct = 0
    for question_number_str, correct_option in answer_key.items():
        user_option = user_answers.get(question_number_str, "")
        if user_option.strip().upper() == correct_option.strip().upper():
            raw_correct += 1

    # When no answer key is provided, count is zero — this matches
    # the pre-fix behavior and signals that scoring was not performed server-side
    scaled_score = TOEIC_LC_SCORE_TABLE.get(
        min(100, raw_correct) if total_questions == 100
        else min(100, round((raw_correct / total_questions) * 100)),
        5
    )

    return {
        "test_id": payload.test_id,
        "mode": payload.mode,
        "scaled_score": scaled_score,
        "raw_correct": raw_correct,
        "total_questions": total_questions,
        "accuracy_percentage": round((raw_correct / total_questions) * 100, 1) if total_questions > 0 else 0,
        "time_spent_seconds": payload.time_spent_seconds,
    }
