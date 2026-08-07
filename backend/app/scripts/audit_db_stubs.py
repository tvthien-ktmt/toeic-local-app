import sqlite3

db_path = r'd:\TOIEC Web\backend\data\toeic.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

total = cur.execute('SELECT COUNT(1) FROM questions').fetchone()[0]
stubs = cur.execute('SELECT COUNT(1) FROM questions WHERE option_explanations_json LIKE "%—%" OR option_explanations_json IS NULL OR translated_sentence = "" OR translated_sentence IS NULL').fetchone()[0]
has_trap = cur.execute('SELECT COUNT(1) FROM questions WHERE common_trap IS NOT NULL AND common_trap != ""').fetchone()[0]

print(f'Total questions in DB: {total}')
print(f'Questions with stubs/empty explanations: {stubs}')
print(f'Questions with common_trap populated: {has_trap}')

docs = cur.execute('SELECT id, filename, category, series, test_number FROM documents').fetchall()
print(f'Total documents: {len(docs)}')
for d in docs[:5]:
    print('Doc:', d)

conn.close()
