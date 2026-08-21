"""
TOEIC Reading Comprehension Standardized Taxonomy Specification (RC_Format.md).
Defines taxonomy enums, category hierarchies, document types, and distractor types.
"""
from typing import Dict, List, Any

# ====================================================
# 1. PART 5 TAXONOMY
# ====================================================
PART5_TAXONOMY: Dict[str, List[str]] = {
    "WORD_FORM": [
        "P5_WORD_FORM_NOUN",
        "P5_WORD_FORM_VERB",
        "P5_WORD_FORM_ADJECTIVE",
        "P5_WORD_FORM_ADVERB",
        "P5_WORD_FORM_PRONOUN",
        "P5_WORD_FORM_DETERMINER",
        "P5_WORD_FORM_NOUN_ADJ_ADV_DISTINCTION"
    ],
    "VERB": [
        "P5_VERB_TENSE_PRESENT",
        "P5_VERB_TENSE_PAST",
        "P5_VERB_TENSE_FUTURE",
        "P5_VERB_TENSE_PERFECT",
        "P5_VERB_TENSE_CONTINUOUS",
        "P5_VERB_SUBJECT_VERB_AGREEMENT",
        "P5_VERB_ACTIVE_PASSIVE",
        "P5_VERB_MODAL",
        "P5_VERB_INFINITIVE",
        "P5_VERB_GERUND",
        "P5_VERB_PARTICIPLE"
    ],
    "PREPOSITION": [
        "P5_PREP_TIME",
        "P5_PREP_PLACE",
        "P5_PREP_DIRECTION",
        "P5_PREP_VERB_PREPOSITION",
        "P5_PREP_ADJECTIVE_PREPOSITION",
        "P5_PREP_NOUN_PREPOSITION",
        "P5_PREP_COLLOCATION"
    ],
    "CONNECTOR": [
        "P5_CONNECTOR_COORDINATING",
        "P5_CONNECTOR_SUBORDINATING",
        "P5_CONNECTOR_CONTRAST",
        "P5_CONNECTOR_CAUSE_EFFECT",
        "P5_CONNECTOR_CONDITION",
        "P5_CONNECTOR_TIME"
    ],
    "PRONOUN_DETERMINER": [
        "P5_PRONOUN_PERSONAL",
        "P5_PRONOUN_POSSESSIVE",
        "P5_PRONOUN_REFLEXIVE",
        "P5_DETERMINER_QUANTIFIER",
        "P5_DETERMINER_EACH_EVERY"
    ],
    "CLAUSE": [
        "P5_CLAUSE_RELATIVE",
        "P5_CLAUSE_REDUCED_RELATIVE",
        "P5_CLAUSE_NOUN_CLAUSE",
        "P5_CLAUSE_ADVERB_CLAUSE"
    ],
    "COMPARISON": [
        "P5_COMPARATIVE",
        "P5_SUPERLATIVE",
        "P5_EQUALITY",
        "P5_DOUBLE_COMPARATIVE"
    ],
    "VOCABULARY": [
        "P5_VOCAB_MEANING",
        "P5_VOCAB_CONTEXT",
        "P5_VOCAB_COLLOCATION",
        "P5_VOCAB_BUSINESS",
        "P5_VOCAB_WORKPLACE",
        "P5_VOCAB_FINANCE",
        "P5_VOCAB_MARKETING",
        "P5_VOCAB_HR",
        "P5_VOCAB_LOGISTICS"
    ]
}

# ====================================================
# 2. PART 6 TAXONOMY
# ====================================================
PART6_TAXONOMY: Dict[str, List[str]] = {
    "GRAMMAR": [
        "P6_GRAMMAR_WORD_FORM",
        "P6_GRAMMAR_TENSE",
        "P6_GRAMMAR_SVA",
        "P6_GRAMMAR_PREPOSITION",
        "P6_GRAMMAR_CONJUNCTION"
    ],
    "VOCABULARY": [
        "P6_VOCAB_MEANING",
        "P6_VOCAB_CONTEXT",
        "P6_VOCAB_COLLOCATION",
        "P6_VOCAB_BUSINESS"
    ],
    "CONTEXT": [
        "P6_CONTEXT_LOCAL",
        "P6_CONTEXT_PARAGRAPH",
        "P6_CONTEXT_CAUSE_EFFECT",
        "P6_CONTEXT_CONTRAST",
        "P6_CONTEXT_SEQUENCE"
    ],
    "SENTENCE_INSERTION": [
        "P6_INSERTION_POSITION",
        "P6_INSERTION_REFERENCE",
        "P6_INSERTION_TRANSITION",
        "P6_INSERTION_LOGICAL_FLOW"
    ]
}

# ====================================================
# 3. PART 7 TAXONOMY
# ====================================================
PART7_TAXONOMY: Dict[str, List[str]] = {
    "DETAIL": [
        "P7_DETAIL_PERSON",
        "P7_DETAIL_DATE_TIME",
        "P7_DETAIL_LOCATION",
        "P7_DETAIL_PRICE_NUMBER",
        "P7_DETAIL_FACT_REASON"
    ],
    "MAIN_IDEA": [
        "P7_MAIN_PURPOSE",
        "P7_MAIN_TOPIC",
        "P7_MAIN_SUMMARY"
    ],
    "PURPOSE": [
        "P7_PURPOSE_EMAIL",
        "P7_PURPOSE_NOTICE",
        "P7_PURPOSE_ADVERTISEMENT",
        "P7_PURPOSE_MEMO",
        "P7_PURPOSE_ARTICLE"
    ],
    "INFERENCE": [
        "P7_INFERENCE_IMPLICATION",
        "P7_INFERENCE_SUGGESTED",
        "P7_INFERENCE_REASON",
        "P7_INFERENCE_CONCLUSION"
    ],
    "VOCABULARY_IN_CONTEXT": [
        "P7_VOCAB_MEANING",
        "P7_VOCAB_PARAPHRASE",
        "P7_VOCAB_SYNONYM_CONTEXT"
    ],
    "REFERENCE": [
        "P7_REFERENCE_PRONOUN",
        "P7_REFERENCE_PHRASE"
    ],
    "NEGATIVE": [
        "P7_NOT_STATED",
        "P7_EXCEPT",
        "P7_NOT_TRUE"
    ],
    "CROSS_REFERENCE": [
        "P7_CROSS_DATE",
        "P7_CROSS_PERSON",
        "P7_CROSS_EVENT",
        "P7_CROSS_SCHEDULE"
    ],
    "SYNTHESIS": [
        "P7_SYNTHESIS_DOUBLE",
        "P7_SYNTHESIS_TRIPLE",
        "P7_SYNTHESIS_COMBINED_FACT"
    ]
}

# ====================================================
# 4. DOCUMENT TYPES & DISTRACTOR TYPES
# ====================================================
DOCUMENT_TYPES = [
    "EMAIL", "LETTER", "MEMO", "NOTICE", "ADVERTISEMENT",
    "ARTICLE", "FORM", "SCHEDULE", "WEBPAGE", "CHAT",
    "TEXT_MESSAGE", "INVOICE", "REPORT", "ANNOUNCEMENT", "REVIEW"
]

DISTRACTOR_TYPES = {
    "PART5": [
        "DISTRACTOR_WRONG_PART_OF_SPEECH",
        "DISTRACTOR_WRONG_TENSE",
        "DISTRACTOR_WRONG_COLLOCATION",
        "DISTRACTOR_WRONG_PREPOSITION",
        "DISTRACTOR_WRONG_MEANING"
    ],
    "PART7": [
        "DISTRACTOR_KEYWORD_MATCH",
        "DISTRACTOR_TRUE_BUT_IRRELEVANT",
        "DISTRACTOR_OVER_INFERENCE",
        "DISTRACTOR_WRONG_REFERENCE",
        "DISTRACTOR_PARTIAL_INFORMATION"
    ]
}
