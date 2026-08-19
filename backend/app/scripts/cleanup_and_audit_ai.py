import sqlite3
import logging

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

db_path = r'd:\TOIEC Web\backend\data\toeic.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# 1. Wipe ANY fake string templates completely
cur.execute("""
UPDATE questions 
SET common_trap = NULL, translated_sentence = NULL, option_explanations_json = NULL
WHERE common_trap LIKE '%do có cùng gốc từ%'
   OR translated_sentence LIKE 'Bản dịch:%'
   OR option_explanations_json LIKE '%phù hợp chính xác về cả cấu trúc%'
""")
conn.commit()

# 2. Count genuine Gemini enriched questions
total = cur.execute('SELECT COUNT(1) FROM questions').fetchone()[0]
real_gemini = cur.execute('SELECT COUNT(1) FROM questions WHERE common_trap IS NOT NULL AND common_trap != ""').fetchone()[0]

logger.info(f"Total questions in DB: {total}")
logger.info(f"Genuine Gemini enriched questions: {real_gemini} ({round(real_gemini/max(1, total)*100, 2)}%)")
logger.info(f"Questions awaiting AI enrichment: {total - real_gemini}")

conn.close()
