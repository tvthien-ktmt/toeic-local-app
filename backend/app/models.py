from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from .db import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String, nullable=False)
    doc_type = Column(String, nullable=False)  # RC_EXAM or LC_TRANSCRIPT
    content_hash = Column(String, unique=True, index=True, nullable=True)
    markdown_content = Column(Text, nullable=False)
    status = Column(String, default="uploaded")  # uploaded / converted / extracted
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Built-in textbook attributes
    is_builtin = Column(Boolean, default=False, index=True)
    category = Column(String, nullable=True, index=True)  # ETS / HACKER / YBM / XANH CAM
    series = Column(String, nullable=True, index=True)    # e.g. "ETS 2024 RC", "YBM Vol 1"
    test_number = Column(Integer, nullable=True, index=True) # 1..10

    questions = relationship("Question", back_populates="document", cascade="all, delete-orphan")
    vocabularies = relationship("Vocabulary", back_populates="document", cascade="all, delete-orphan")


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
    topic_tag = Column(String, index=True, nullable=True)
    is_generated = Column(Boolean, default=False)
    source_question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="questions")


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


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vocabulary_id = Column(Integer, ForeignKey("vocabulary.id"), unique=True, nullable=False)
    srs_level = Column(Integer, default=0)
    ease_factor = Column(Float, default=2.5)
    next_review_at = Column(DateTime, default=datetime.utcnow, index=True)
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
    attempted_at = Column(DateTime, default=datetime.utcnow)


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
    completed_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document")


class AICache(Base):
    __tablename__ = "ai_cache"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    input_hash = Column(String, unique=True, index=True, nullable=False)
    prompt_type = Column(String, nullable=False)
    response_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class GrammarReference(Base):
    __tablename__ = "grammar_reference"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    topic_name = Column(String, unique=True, index=True, nullable=False)
    formula = Column(Text, nullable=False)
    key_rules_json = Column(Text, nullable=False)  # JSON array string of rules
    example_sentences_json = Column(Text, nullable=False)  # JSON array string of example sentences
    created_at = Column(DateTime, default=datetime.utcnow)


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_type = Column(String, nullable=False)  # practice / quiz / flashcard / reading
    duration_seconds = Column(Integer, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, default=datetime.utcnow)
