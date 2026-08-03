from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class DocumentBase(BaseModel):
    filename: str
    doc_type: str  # RC_EXAM or LC_TRANSCRIPT

class DocumentCreate(DocumentBase):
    markdown_content: str
    content_hash: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    content_hash: Optional[str] = None
    markdown_content: str
    status: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentSummary(DocumentBase):
    id: int
    content_hash: Optional[str] = None
    status: str
    uploaded_at: datetime
    markdown_length: int

    model_config = ConfigDict(from_attributes=True)


class QuestionResponse(BaseModel):
    id: int
    document_id: Optional[int] = None
    part: Optional[int] = None
    question_text: str
    options_json: str
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    option_explanations_json: Optional[str] = None
    translated_sentence: Optional[str] = None
    grammar_topic: Optional[str] = None
    topic_tag: Optional[str] = None
    is_generated: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VocabularyLookupRequest(BaseModel):
    word: str
    context_sentence: Optional[str] = ""
    document_id: Optional[int] = None


class RelatedVocabRequest(BaseModel):
    word: str
    topic_category: Optional[str] = None


class VocabularyResponse(BaseModel):
    id: int
    word: str
    ipa: Optional[str] = None
    part_of_speech: Optional[str] = None
    meaning_vi: Optional[str] = None
    example_sentence: Optional[str] = None
    source_document_id: Optional[int] = None
    appears_in_part: Optional[str] = None
    topic_category: str = "khác / chưa phân loại"
    synonyms: Optional[str] = None
    antonyms: Optional[str] = None
    frequency_count: int = 1
    source_type: str = "extracted"
    parent_word: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class GrammarReferenceResponse(BaseModel):
    id: int
    topic_name: str
    formula: str
    key_rules_json: str
    example_sentences_json: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudySessionCreate(BaseModel):
    session_type: str  # practice / quiz / flashcard / reading
    duration_seconds: int


class StudySessionResponse(BaseModel):
    id: int
    session_type: str
    duration_seconds: int
    started_at: datetime
    ended_at: datetime

    model_config = ConfigDict(from_attributes=True)
