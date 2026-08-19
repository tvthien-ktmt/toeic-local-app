import sqlite3
import logging

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

db_path = r'd:\TOIEC Web\backend\data\toeic.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

total = cur.execute('SELECT COUNT(1) FROM questions').fetchone()[0]
stubs = cur.execute('SELECT COUNT(1) FROM questions WHERE option_explanations_json LIKE "%—%" OR option_explanations_json IS NULL OR translated_sentence = "" OR translated_sentence IS NULL').fetchone()[0]
has_trap = cur.execute('SELECT COUNT(1) FROM questions WHERE common_trap IS NOT NULL AND common_trap != ""').fetchone()[0]

logger.info(f'Total questions in DB: {total}')
logger.info(f'Questions with stubs/empty explanations: {stubs}')
logger.info(f'Questions with common_trap populated: {has_trap}')

docs = cur.execute('SELECT id, filename, category, series, test_number FROM documents').fetchall()
logger.info(f'Total documents: {len(docs)}')
for d in docs[:5]:
    logger.info(f'Doc: {d}')

conn.close()
