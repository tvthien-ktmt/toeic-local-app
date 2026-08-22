from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from .db import Base

def utc_now() -> datetime:
    """Returns current timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String, nullable=False)
    doc_type = Column(String, nullable=False)  # RC_EXAM or LC_TRANSCRIPT
    content_hash = Column(String, unique=True, index=True, nullable=True)
    markdown_content = Column(Text, nullable=False)
    status = Column(String, default="uploaded")  # uploaded / converted / extracted
    uploaded_at = Column(DateTime, default=utc_now)
    
    # Built-in textbook attributes
    is_builtin = Column(Boolean, default=False, index=True)
    category = Column(String, nullable=True, index=True)  # ETS / HACKER / YBM / XANH CAM
    series = Column(String, nullable=True, index=True)    # e.g. "ETS 2024 RC", "YBM Vol 1"
    test_number = Column(Integer, nullable=True, index=True) # 1..10

    questions = relationship("Question", back_populates="document", cascade="all, delete-orphan")
    vocabularies = relationship("Vocabulary", back_populates="document", cascade="all, delete-orphan")
    exam_attempts = relationship("ExamAttempt", back_populates="document", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    part = Column(Integer, index=True, nullable=True)  # 5, 6, 7
    question_text = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False)  # JSON array string
    correct_answer = Column(String, nullable=True)
    explanation = Column(Text, nullable=True)
    option_explanations_json = Column(Text, nullable=True)  # JSON object string: {"A": "...", "B": "...", "C": "...", "D": "..."}
    translated_sentence = Column(Text, nullable=True)  # Full Vietnamese sentence translation with answer filled in
    grammar_topic = Column(String, index=True, nullable=True)
    common_trap = Column(Text, nullable=True)  # Why a specific wrong option is commonly chosen (competitive differentiator)
    topic_tag = Column(String, index=True, nullable=True)
    is_generated = Column(Boolean, default=False)
    source_question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    document = relationship("Document", back_populates="questions")
    practice_attempts = relationship("PracticeAttempt", back_populates="question", cascade="all, delete-orphan")


class Vocabulary(Base):
    __tablename__ = "vocabulary"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    word = Column(String, index=True, nullable=False)
    ipa = Column(String, nullable=True)
    part_of_speech = Column(String, nullable=True)
    meaning_vi = Column(Text, nullable=True)
    example_sentence = Column(Text, nullable=True)
    source_document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    appears_in_part = Column(String, nullable=True)
    topic_category = Column(String, index=True, default="khác / chưa phân loại")
    synonyms = Column(Text, nullable=True)  # JSON array string or comma separated
    antonyms = Column(Text, nullable=True)  # JSON array string or comma separated
    frequency_count = Column(Integer, default=1)
    source_type = Column(String, default="extracted")  # extracted / looked_up / suggested
    parent_word = Column(String, nullable=True)  # Parent word if suggested by Module 16

    __table_args__ = (
        UniqueConstraint('word', 'source_document_id', name='_word_doc_uc'),
    )

    document = relationship("Document", back_populates="vocabularies")
    flashcard = relationship("Flashcard", back_populates="vocabulary", uselist=False, cascade="all, delete-orphan")
    practice_attempts = relationship("PracticeAttempt", back_populates="vocabulary", cascade="all, delete-orphan")


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vocabulary_id = Column(Integer, ForeignKey("vocabulary.id"), unique=True, nullable=False)
    srs_level = Column(Integer, default=0)
    ease_factor = Column(Float, default=2.5)
    next_review_at = Column(DateTime, default=utc_now, index=True)
    last_reviewed_at = Column(DateTime, nullable=True)

    vocabulary = relationship("Vocabulary", back_populates="flashcard")


class PracticeAttempt(Base):
    __tablename__ = "practice_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vocabulary_id = Column(Integer, ForeignKey("vocabulary.id"), nullable=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    attempt_type = Column(String, nullable=False)  # quiz / typing / flashcard / question
    is_correct = Column(Boolean, nullable=False)
    time_spent_seconds = Column(Integer, default=0)
    part = Column(Integer, nullable=True)
    session_id = Column(String, nullable=True)
    attempted_at = Column(DateTime, default=utc_now)

    question = relationship("Question", back_populates="practice_attempts")
    vocabulary = relationship("Vocabulary", back_populates="practice_attempts")


class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    exam_title = Column(String, nullable=False)
    mode = Column(String, nullable=False)  # full_exam (75m) / practice (unlimited)
    raw_score = Column(Integer, nullable=False)  # e.g. 85 / 100
    total_questions = Column(Integer, default=100)
    toeic_score = Column(Integer, nullable=False)  # Scaled score out of 495 (e.g. 425)
    time_spent_seconds = Column(Integer, default=0)
    part5_correct = Column(Integer, default=0)
    part6_correct = Column(Integer, default=0)
    part7_correct = Column(Integer, default=0)
    answers_json = Column(Text, nullable=False)  # JSON string of user answers {question_id: selected_option}
    completed_at = Column(DateTime, default=utc_now)

    document = relationship("Document", back_populates="exam_attempts")


class AICache(Base):
    __tablename__ = "ai_cache"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    input_hash = Column(String, unique=True, index=True, nullable=False)
    prompt_type = Column(String, nullable=False)
    response_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)


class GrammarReference(Base):
    __tablename__ = "grammar_reference"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    topic_name = Column(String, unique=True, index=True, nullable=False)
    formula = Column(Text, nullable=False)
    key_rules_json = Column(Text, nullable=False)  # JSON array string of rules
    example_sentences_json = Column(Text, nullable=False)  # JSON array string of example sentences
    created_at = Column(DateTime, default=utc_now)


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_type = Column(String, nullable=False)  # practice / quiz / flashcard / reading
    duration_seconds = Column(Integer, nullable=False)
    started_at = Column(DateTime, default=utc_now)
    ended_at = Column(DateTime, default=utc_now)


# ====================================================
# MODULE 12 — Curriculum Engine Models
# ====================================================

class CurriculumTopic(Base):
    """Module 12.1.3 — Canonical curriculum topic from cross-referencing 4 knowledge sources."""
    __tablename__ = "curriculum_topics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    canonical_name = Column(String, unique=True, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)  # grammar_topic / question_type / vocab_topic
    level = Column(String, nullable=False)                 # basic / intermediate / advanced
    parts_json = Column(Text, nullable=True)               # JSON array: [5] / [5,6] / [7]
    prerequisite_topic_id = Column(Integer, ForeignKey("curriculum_topics.id"), nullable=True, index=True)
    source_files_json = Column(Text, nullable=True)        # JSON array of source file names
    source_count = Column(Integer, default=1)              # Number of 4 sources that mention this
    agreement_note = Column(Text, nullable=True)           # Cross-source comparison note
    mapped_grammar_topics_db_json = Column(Text, nullable=True)  # JSON array: grammar_topic values in questions table
    question_count = Column(Integer, default=0)            # Cached count from questions table
    has_specific_db_topic = Column(Boolean, default=False) # True if specific (not generic Part X) topic exists
    db_coverage_note = Column(Text, nullable=True)         # Human-readable coverage note
    created_at = Column(DateTime, default=utc_now)

    # Self-referential relationship for prerequisites
    prerequisite = relationship("CurriculumTopic", remote_side=[id], foreign_keys=[prerequisite_topic_id])
    lesson = relationship("Lesson", back_populates="curriculum_topic", uselist=False, cascade="all, delete-orphan")
    mastery_records = relationship("UserMastery", back_populates="curriculum_topic", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_curriculum_topics_prerequisite", "prerequisite_topic_id"),
        Index("idx_curriculum_topics_category_level", "category", "level"),
    )


class Lesson(Base):
    """Module 12.2 — AI-generated lesson content for a CurriculumTopic."""
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    curriculum_topic_id = Column(Integer, ForeignKey("curriculum_topics.id"), unique=True, nullable=False)
    content_markdown = Column(Text, nullable=False)         # Full lesson in Markdown (rendered by react-markdown+remark-gfm)
    worked_example_question_ids_json = Column(Text, nullable=True)  # JSON array of question IDs used as examples
    quick_check_question_ids_json = Column(Text, nullable=True)     # JSON array of question IDs for quick check quiz
    has_real_examples = Column(Boolean, default=False)      # True if worked examples come from real DB questions
    ai_cache_hash = Column(String, nullable=True)           # SHA256 hash key used to cache in ai_cache table
    created_at = Column(DateTime, default=utc_now)

    curriculum_topic = relationship("CurriculumTopic", back_populates="lesson")

    __table_args__ = (
        Index("idx_lessons_topic", "curriculum_topic_id"),
    )


class UserMastery(Base):
    """Module 12.4/12.5 — Per-topic mastery state for the personalized roadmap."""
    __tablename__ = "user_mastery"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    curriculum_topic_id = Column(Integer, ForeignKey("curriculum_topics.id"), nullable=False)
    status = Column(String, nullable=False, default="unknown")  # unknown / weak / ok
    correct_count = Column(Integer, default=0)      # Correct answers on questions tagged to this topic
    total_count = Column(Integer, default=0)        # Total attempts on questions tagged to this topic
    mastery_pct = Column(Float, default=0.0)        # correct_count / total_count * 100
    last_updated_at = Column(DateTime, default=utc_now)

    curriculum_topic = relationship("CurriculumTopic", back_populates="mastery_records")

    __table_args__ = (
        UniqueConstraint("curriculum_topic_id", name="_user_mastery_topic_uc"),
        Index("idx_user_mastery_status", "status"),
    )
