import React from 'react';
import { BlankRenderer } from './BlankRenderer';
import { PositionMarkerRenderer } from './PositionMarkerRenderer';
import type { InlineNode } from '../../../types/toeicContent';

interface InlineRendererProps {
  nodes?: InlineNode[];
  userAnswers?: Record<number, string>;
  activeQuestionNumber?: number;
  onSelectBlank?: (questionNumber: number) => void;
}

/**
 * Renders an array of semantic inline nodes (text, bold, italic, blank, position marker).
 */
export const InlineRenderer: React.FC<InlineRendererProps> = ({
  nodes,
  userAnswers,
  activeQuestionNumber,
  onSelectBlank,
}) => {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  return (
    <>
      {nodes.map((node, index) => {
        if (node.type === 'bold') {
          return (
            <strong key={index} className="font-bold text-theme-primary">
              {node.text}
            </strong>
          );
        }

        if (node.type === 'italic') {
          return (
            <em key={index} className="italic text-theme-primary/90">
              {node.text}
            </em>
          );
        }

        if (node.type === 'underline') {
          return (
            <span key={index} className="underline underline-offset-2">
              {node.text}
            </span>
          );
        }

        if (node.type === 'blank') {
          return (
            <BlankRenderer
              key={index}
              questionNumber={node.questionNumber}
              selectedAnswer={node.questionNumber ? userAnswers?.[node.questionNumber] : undefined}
              isActive={node.questionNumber === activeQuestionNumber}
              onClick={() => {
                if (node.questionNumber && onSelectBlank) {
                  onSelectBlank(node.questionNumber);
                }
              }}
            />
          );
        }

        if (node.type === 'position_marker') {
          return (
            <PositionMarkerRenderer
              key={index}
              position={node.position || 1}
            />
          );
        }

        return <span key={index}>{node.text}</span>;
      })}
    </>
  );
};
