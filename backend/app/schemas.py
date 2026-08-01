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
