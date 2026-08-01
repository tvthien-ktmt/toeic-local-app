import axios from 'axios';

export interface DocumentSummary {
  id: number;
  filename: string;
  doc_type: 'RC_EXAM' | 'LC_TRANSCRIPT';
  content_hash: string | null;
  status: string;
  uploaded_at: string;
  markdown_length: number;
}

export interface DocumentDetail extends DocumentSummary {
  markdown_content: string;
}

const API_BASE = '/api/documents';

export const uploadDocument = async (file: File, docType: 'RC_EXAM' | 'LC_TRANSCRIPT'): Promise<DocumentDetail> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', docType);

  const response = await axios.post<DocumentDetail>(`${API_BASE}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchDocuments = async (): Promise<DocumentSummary[]> => {
  const response = await axios.get<DocumentSummary[]>(API_BASE);
  return response.data;
};

export const fetchDocumentById = async (id: number): Promise<DocumentDetail> => {
  const response = await axios.get<DocumentDetail>(`${API_BASE}/${id}`);
  return response.data;
};

export const deleteDocument = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(`${API_BASE}/${id}`);
  return response.data;
};
