export interface QuestionItem {
  id: number;
  q_num: number;
  part: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  option_explanations: Record<string, string>;
  translated_sentence: string;
  grammar_topic: string;
  common_trap?: string;
}

export interface PassageGroup {
  id: string;
  part: number;
  isPassageGroup: boolean;
  passageText: string;
  docType: string;
  qStart: number;
  qEnd: number;
  questions: Array<{
    item: QuestionItem;
    promptOnly: string;
  }>;
}

/**
 * Groups TOEIC exam questions into sequential passage blocks for Part 6 & 7 reading views.
 * Part 5 single questions are kept as individual single-question groups.
 * 
 * @param questions - Flat list of parsed QuestionItem models from backend.
 * @returns Array of grouped passages containing nested question items.
 */
export function groupQuestionsForDisplay(questions: QuestionItem[]): PassageGroup[] {
  const groups: PassageGroup[] = [];
  let currentGroup: PassageGroup | null = null;

  for (const questionItem of questions) {
    if (questionItem.part === 5) {
      if (currentGroup) {
        groups.push(currentGroup);
        currentGroup = null;
      }
      groups.push({
        id: `q-${questionItem.id}`,
        part: 5,
        isPassageGroup: false,
        passageText: '',
        docType: '',
        qStart: questionItem.q_num,
        qEnd: questionItem.q_num,
        questions: [{ item: questionItem, promptOnly: questionItem.question_text }],
      });
    } else {
      const headerMatch = questionItem.question_text.match(
        /^\s*(?:\*\*)?Questions?\s+(\d{3})[\s\-–]+(\d{3})\s+refer\s+to\s+the\s+following\s+([^.\n*]+)[\.\*]?\s*(?:\*\*)?\s*([\s\S]*)$/i
      );

      if (headerMatch) {
        const qStart = parseInt(headerMatch[1], 10);
        const qEnd = parseInt(headerMatch[2], 10);
        const docType = headerMatch[3].trim();
        const body = headerMatch[4];

        const promptMatch = body.match(/^([\s\S]*?)(?:\n\n(?=(?:\d{3}|33)\.\s+.*))([\s\S]*)$/);
        const passageOnly = promptMatch ? promptMatch[1].trim() : body.trim();
        const promptOnly = promptMatch
          ? promptMatch[2].trim()
          : body.trim().startsWith(`${questionItem.q_num}.`)
          ? body.trim()
          : `${questionItem.q_num}. ${questionItem.question_text}`;
        const fullPassage = `**Questions ${qStart}-${qEnd} refer to the following ${docType}.**\n\n${passageOnly}`;

        if (currentGroup && currentGroup.qStart === qStart && currentGroup.qEnd === qEnd) {
          currentGroup.questions.push({ item: questionItem, promptOnly });
        } else {
          if (currentGroup) {
            groups.push(currentGroup);
          }
          currentGroup = {
            id: `passage-${qStart}-${qEnd}-${questionItem.id}`,
            part: questionItem.part,
            isPassageGroup: true,
            passageText: fullPassage,
            docType,
            qStart,
            qEnd,
            questions: [{ item: questionItem, promptOnly }],
          };
        }
      } else {
        if (currentGroup) {
          groups.push(currentGroup);
          currentGroup = null;
        }
        groups.push({
          id: `q-${questionItem.id}`,
          part: questionItem.part,
          isPassageGroup: false,
          passageText: '',
          docType: '',
          qStart: questionItem.q_num,
          qEnd: questionItem.q_num,
          questions: [{ item: questionItem, promptOnly: questionItem.question_text }],
        });
      }
    }
  }

  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
}
