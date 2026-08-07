import sqlite3
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


db_path = r'd:\TOIEC Web\backend\data\toeic.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

enriched_qs = cur.execute('SELECT id, question_text, options_json, correct_answer, option_explanations_json, common_trap, translated_sentence, grammar_topic FROM questions WHERE common_trap IS NOT NULL AND common_trap != "" LIMIT 5').fetchall()

print(f"Found {len(enriched_qs)} enriched questions in DB:\n")
for q in enriched_qs:
    print("==================================================")
    print(f"ID: {q[0]}")
    print(f"Question: {q[1][:100]}")
    print(f"Correct Answer: ({q[3]})")
    print(f"Grammar Topic: {q[7]}")
    print(f"Option Explanations JSON: {q[4]}")
    print(f"Common Trap: {q[5]}")
    print(f"Translated Sentence: {q[6]}")

conn.close()
