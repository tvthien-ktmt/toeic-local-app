import sqlite3
import json
import sys
import logging

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

db_path = r'd:\TOIEC Web\backend\data\toeic.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

enriched_qs = cur.execute('SELECT id, question_text, options_json, correct_answer, option_explanations_json, common_trap, translated_sentence, grammar_topic FROM questions WHERE common_trap IS NOT NULL AND common_trap != "" LIMIT 5').fetchall()

logger.info(f"Found {len(enriched_qs)} enriched questions in DB:\n")
for q in enriched_qs:
    logger.info("==================================================")
    logger.info(f"ID: {q[0]}")
    logger.info(f"Question: {q[1][:100]}")
    logger.info(f"Correct Answer: ({q[3]})")
    logger.info(f"Grammar Topic: {q[7]}")
    logger.info(f"Option Explanations JSON: {q[4]}")
    logger.info(f"Common Trap: {q[5]}")
    logger.info(f"Translated Sentence: {q[6]}")

conn.close()
