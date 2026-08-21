import React from 'react';
import { EmailRenderer } from './EmailRenderer';
import { ChatRenderer } from './ChatRenderer';
import { ReceiptRenderer } from './ReceiptRenderer';
import { WebPageRenderer } from './WebPageRenderer';
import { NoticeRenderer } from './NoticeRenderer';
import { MemoRenderer } from './MemoRenderer';
import { ArticleRenderer } from './ArticleRenderer';
import { AdvertisementRenderer } from './AdvertisementRenderer';
import { TableRenderer } from './TableRenderer';
import { GenericDocumentRenderer } from './GenericDocumentRenderer';
import type { DocumentData } from '../../../types/toeicContent';

interface DocumentRendererProps {
  document: DocumentData;
  userAnswers?: Record<number, string>;
  activeQuestionNumber?: number;
  onSelectBlank?: (questionNumber: number) => void;
}

/**
 * Master Document Renderer dispatching to dedicated renderers based on document_type.
 * Strictly adheres to Render_QuestionRC.md Rule 4: No regex guessing, type comes from backend.
 */
export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  document,
  userAnswers,
  activeQuestionNumber,
  onSelectBlank,
}) => {
  switch (document.document_type) {
    case 'EMAIL':
      return (
        <EmailRenderer
          document={document}
          userAnswers={userAnswers}
          activeQuestionNumber={activeQuestionNumber}
          onSelectBlank={onSelectBlank}
        />
      );

    case 'CHAT':
      return <ChatRenderer document={document} />;

    case 'RECEIPT':
      return <ReceiptRenderer document={document} />;

    case 'WEBPAGE':
      return (
        <WebPageRenderer
          document={document}
          userAnswers={userAnswers}
          activeQuestionNumber={activeQuestionNumber}
          onSelectBlank={onSelectBlank}
        />
      );

    case 'NOTICE':
      return (
        <NoticeRenderer
          document={document}
          userAnswers={userAnswers}
          activeQuestionNumber={activeQuestionNumber}
          onSelectBlank={onSelectBlank}
        />
      );

    case 'MEMO':
      return (
        <MemoRenderer
          document={document}
          userAnswers={userAnswers}
          activeQuestionNumber={activeQuestionNumber}
          onSelectBlank={onSelectBlank}
        />
      );

    case 'ARTICLE':
      return (
        <ArticleRenderer
          document={document}
          userAnswers={userAnswers}
          activeQuestionNumber={activeQuestionNumber}
          onSelectBlank={onSelectBlank}
        />
      );

    case 'ADVERTISEMENT':
      return (
        <AdvertisementRenderer
          document={document}
          userAnswers={userAnswers}
          activeQuestionNumber={activeQuestionNumber}
          onSelectBlank={onSelectBlank}
        />
      );

    case 'SCHEDULE':
    case 'TABLE':
      return (
        <TableRenderer
          document={document}
          userAnswers={userAnswers}
          activeQuestionNumber={activeQuestionNumber}
          onSelectBlank={onSelectBlank}
        />
      );

    default:
      return (
        <GenericDocumentRenderer
          document={document}
          userAnswers={userAnswers}
          activeQuestionNumber={activeQuestionNumber}
          onSelectBlank={onSelectBlank}
        />
      );
  }
};
