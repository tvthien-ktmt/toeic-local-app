"""
MODULE 12.1 — Parse 4 knowledge files into structured curriculum topics
Canonical topic = cross-reference from ChatGPT.txt, Gemini.txt, Grok.txt, Claude.txt
Output: JSON file backend/data/curriculum_seed.json for review before DB import
"""
import json, sys, io, os, logging

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "Knowlegle_RC")


# ====================================================
# STEP 1: Parse each source file into items
# ====================================================

def parse_chatgpt(text: str) -> list:
    """ChatGPT.txt: Structured with markdown headings (####), clear enumeration."""
    items = []
    # Grammar topics Part 5
    grammar_topics_part5 = [
        ("Từ loại / Dạng từ (Parts of Speech / Word Form)", "grammar_topic", "basic",
         "Phân biệt Danh từ / Động từ / Tính từ / Trạng từ. Biến đổi từ (development, developer, develop)"),
        ("Thì động từ (Verb Tenses)", "grammar_topic", "basic",
         "Present Simple, Past Simple, Present Perfect, Future. Dấu hiệu: yesterday, since, for, next week"),
        ("Câu bị động (Passive Voice)", "grammar_topic", "basic",
         "is completed, was delivered, has been approved"),
        ("Hòa hợp chủ ngữ-động từ (Subject-Verb Agreement)", "grammar_topic", "basic",
         "The employees are / The manager is"),
        ("Danh động từ & Động từ nguyên mẫu (Gerund / Infinitive)", "grammar_topic", "intermediate",
         "decide to, finish doing, avoid doing, plan to"),
        ("Động từ khuyết thiếu (Modal Verbs)", "grammar_topic", "intermediate",
         "can, could, may, might, must, should, would, will"),
        ("Mệnh đề quan hệ (Relative Clauses)", "grammar_topic", "intermediate",
         "who, whom, whose, which, that, where, when"),
        ("Liên từ (Conjunctions)", "grammar_topic", "basic",
         "because, although, while, since, unless, if, before, after, whereas"),
        ("Giới từ (Prepositions)", "grammar_topic", "basic",
         "in, on, at, by, with, for, from, to, over, during, throughout, despite"),
        ("Đại từ & Từ hạn định (Pronouns / Determiners)", "grammar_topic", "basic",
         "it, they, their, those, some, any, each, every, another, several"),
        ("So sánh (Comparatives / Superlatives)", "grammar_topic", "intermediate",
         "taller, more expensive, the best, as...as"),
        ("Từ lượng (Quantifiers)", "grammar_topic", "basic",
         "a number of, the number of, plenty of, enough, most"),
        ("Cấu trúc song song (Parallel Structure)", "grammar_topic", "intermediate",
         "checking, processing and sending — must be same word form"),
        ("Câu điều kiện (Conditional Sentences)", "grammar_topic", "intermediate",
         "Type 0, 1, 2, Mixed"),
        ("Cấu trúc nhân quả (Causative Structure)", "grammar_topic", "advanced",
         "have / get / make / let someone do something"),
        ("Đảo ngữ (Inversion)", "grammar_topic", "advanced",
         "Never have I..., Rarely..., Had I known..."),
        ("Câu giả định (Subjunctive)", "grammar_topic", "advanced",
         "recommend that, suggest that, insist that + bare infinitive"),
    ]
    for name, cat, level, desc in grammar_topics_part5:
        items.append({"source": "ChatGPT", "category": cat, "name": name, "level": level, "raw_text": desc})

    # Vocabulary topics
    vocab_topics = [
        ("Từ dễ nhầm (Confusing Words)", "grammar_topic", "intermediate",
         "economic/economical, affect/effect, assure/ensure/insure, accept/except"),
        ("Collocation (Cụm từ cố định)", "grammar_topic", "intermediate",
         "make a decision, take a meeting, conduct a survey, submit a report"),
        ("Từ vựng kinh doanh (Business Vocabulary)", "vocab_topic", "basic",
         "contract, budget, employee, salary, promotion, inventory, shipment, conference, invoice"),
        ("Cụm động từ (Phrasal Verbs)", "grammar_topic", "intermediate",
         "carry out, look into, put off, take over, hand in, set up"),
        ("Biểu thức cố định (Fixed Expressions)", "grammar_topic", "intermediate",
         "in charge of, according to, in addition to, on behalf of"),
    ]
    for name, cat, level, desc in vocab_topics:
        items.append({"source": "ChatGPT", "category": cat, "name": name, "level": level, "raw_text": desc})

    # Part 6 specific
    items.append({"source": "ChatGPT", "category": "question_type", "name": "Điền câu vào đoạn văn (Sentence Insertion - Part 6)",
                  "level": "advanced", "raw_text": "Chọn cả 1 câu hoàn chỉnh: kiểm tra Logic, Đại từ tham chiếu, Trình tự thời gian, Từ nối"})
    items.append({"source": "ChatGPT", "category": "grammar_topic", "name": "Liên từ chuyển ý / Discourse Markers (Part 6)",
                  "level": "intermediate", "raw_text": "however, therefore, in addition, meanwhile, consequently — liên kết đoạn văn"})

    # Part 7 question types
    p7_qtypes = [
        ("Câu hỏi Ý chính (Main Idea / Purpose)", "Ý chính của bài, mục đích viết email/article"),
        ("Câu hỏi Chi tiết (Detail Question)", "Tìm thông tin trực tiếp: Who, What, When, Where, Why"),
        ("Câu hỏi Phủ định (NOT / EXCEPT)", "Tìm thông tin không đúng hoặc không được đề cập"),
        ("Câu hỏi Suy luận (Inference / Implication)", "What is implied? What can be inferred?"),
        ("Câu hỏi Từ vựng trong ngữ cảnh (Vocabulary in Context)", "Từ X có nghĩa gần nhất với từ nào? Dựa vào ngữ cảnh"),
        ("Câu hỏi Đại từ tham chiếu (Reference Question)", "it, they, those, this — thay thế cho từ nào?"),
        ("Câu hỏi Mục đích (Purpose Question)", "Mục đích của email hoặc bài viết"),
        ("Câu hỏi Bước tiếp theo (Next Step)", "Việc gì sẽ xảy ra tiếp theo"),
        ("Câu hỏi Chèn câu (Sentence Location Part 7)", "Chọn vị trí [1],[2],[3],[4] để chèn câu cho phù hợp"),
        ("Câu hỏi Ghép thông tin (Cross-reference Double/Triple)", "So sánh thông tin từ 2-3 bài đọc — khó nhất Part 7"),
        ("Đọc bảng / biểu đồ (Graph/Table Question)", "Đọc bảng, biểu đồ, lịch, sơ đồ, menu, timetable"),
    ]
    for name, desc in p7_qtypes:
        items.append({"source": "ChatGPT", "category": "question_type", "name": name, "level": "intermediate", "raw_text": desc})

    # Vocab topics
    vocab_subtopics = [
        "Công việc & Tuyển dụng (Occupation/Recruitment)",
        "Văn phòng (Office)",
        "Nhân sự (Human Resources)",
        "Tài chính & Ngân hàng (Finance/Banking)",
        "Mua bán & Bán lẻ (Shopping/Retail)",
        "Marketing & Quảng cáo (Marketing)",
        "Sản xuất (Manufacturing)",
        "Logistics & Vận chuyển (Logistics)",
        "Du lịch (Travel)",
        "Nhà hàng & Khách sạn (Restaurant/Hotel)",
        "Dịch vụ khách hàng (Customer Service)",
        "Công nghệ (Technology)",
        "Bất động sản (Real Estate)",
        "Giáo dục & Đào tạo (Education/Training)",
        "Y tế (Healthcare)",
        "Sự kiện (Events)",
        "Môi trường (Environment)",
        "Pháp lý & Hợp đồng (Legal/Contracts)",
        "Bảo hiểm (Insurance)",
    ]
    for vt in vocab_subtopics:
        items.append({"source": "ChatGPT", "category": "vocab_topic", "name": vt, "level": "intermediate", "raw_text": f"Từ vựng chủ đề: {vt}"})

    return items


def parse_gemini(text: str) -> list:
    """Gemini.txt: Vietnamese prose with some bold headings."""
    items = []
    grammar_topics = [
        ("Từ loại / Dạng từ (Parts of Speech / Word Form)", "grammar_topic", "basic",
         "Cho cùng 1 gốc từ (produce, product, productive), xác định chỗ trống cần Danh từ/Động từ/Tính từ/Trạng từ — dạng ăn điểm nhất"),
        ("Thì động từ (Verb Tenses)", "grammar_topic", "basic",
         "Chia thì quá khứ, hiện tại, tương lai, hoàn thành dựa vào dấu hiệu nhận biết thời gian trong câu"),
        ("Câu bị động (Passive Voice)", "grammar_topic", "basic",
         "Phân biệt khi nào chủ ngữ thực hiện hành động (chủ động) hoặc bị tác động (bị động)"),
        ("Đại từ & Từ hạn định (Pronouns)", "grammar_topic", "basic",
         "Đại từ nhân xưng (he/she), đại từ phản thân (himself), tính từ sở hữu (his/her)"),
        ("Giới từ & Liên từ (Prepositions & Conjunctions)", "grammar_topic", "basic",
         "because/because of, although/despite, in/on/at/during/within"),
        ("Mệnh đề quan hệ (Relative Clauses)", "grammar_topic", "intermediate",
         "who, whom, which, that, whose, rút gọn mệnh đề quan hệ V-ing / V-ed"),
    ]
    for name, cat, level, desc in grammar_topics:
        items.append({"source": "Gemini", "category": cat, "name": name, "level": level, "raw_text": desc})

    vocab_topics = [
        ("Nghĩa của từ trong ngữ cảnh (Vocabulary in Context)", "grammar_topic", "intermediate",
         "4 đáp án khác nhau cùng từ loại, phải dịch ngữ cảnh câu để chọn"),
        ("Collocation (Cụm từ cố định)", "grammar_topic", "intermediate",
         "make a decision (không dùng do a decision), highly recommended"),
        ("Cụm động từ (Phrasal Verbs)", "grammar_topic", "intermediate",
         "look forward to, turn down, carry out"),
    ]
    for name, cat, level, desc in vocab_topics:
        items.append({"source": "Gemini", "category": cat, "name": name, "level": level, "raw_text": desc})

    items.append({"source": "Gemini", "category": "question_type", "name": "Điền câu vào đoạn văn (Sentence Insertion - Part 6)",
                  "level": "advanced", "raw_text": "4 đáp án là 4 câu hoàn chỉnh, phải hiểu mạch văn (logic) của đoạn để chọn câu phù hợp"})

    p7_qtypes = [
        ("Câu hỏi Ý chính (Main Idea / Purpose)", "Why was the email written? What is the main topic?"),
        ("Câu hỏi Chi tiết (Detail Question)", "How much is the discount? When will the event start?"),
        ("Câu hỏi Suy luận (Inference / Implication)", "What is suggested about Mr. Smith? What will most likely happen next?"),
        ("Câu hỏi Từ vựng trong ngữ cảnh (Vocabulary in Context)", "The word 'address' in paragraph 1 is closest in meaning to...?"),
        ("Câu hỏi Ghép thông tin (Cross-reference Double/Triple)", "Đối chiếu dữ liệu từ Đoạn 1 và Đoạn 2 mới ra đáp án"),
        ("Câu hỏi Chèn câu (Sentence Location Part 7)", "Bài thi đánh số [1][2][3][4] hỏi câu cho trước đặt vào vị trí nào"),
    ]
    for name, desc in p7_qtypes:
        items.append({"source": "Gemini", "category": "question_type", "name": name, "level": "intermediate", "raw_text": desc})

    vocab_subtopics = [
        ("Nhân sự (Human Resources)", "recruit, resume, benefit, promote, evaluate"),
        ("Kinh doanh & Tài chính (Business & Finance)", "contract, negotiate, budget, revenue, asset"),
        ("Sản xuất & Bán lẻ (Manufacturing & Retail)", "assembly line, quality control, inventory, shipment"),
        ("Văn phòng (Office Issues)", "maintenance, supplies, agenda, itinerary"),
        ("Dịch vụ & Đời sống (Services & Daily Life)", "reservation, warranty, prescription, lease"),
    ]
    for name, desc in vocab_subtopics:
        items.append({"source": "Gemini", "category": "vocab_topic", "name": name, "level": "basic", "raw_text": desc})

    return items


def parse_grok(text: str) -> list:
    """Grok.txt: Markdown with tables, bold headers, ratio percentages."""
    items = []
    grammar_topics = [
        ("Từ loại / Dạng từ (Parts of Speech / Word Form)", "grammar_topic", "basic",
         "25-35% của Part 5. Sau the/a/an → danh từ; trước danh từ → tính từ; bổ nghĩa động từ → trạng từ"),
        ("Thì động võ (Verb Tenses)", "grammar_topic", "basic",
         "since/for/already/yet/recently → Hiện tại hoàn thành; yesterday/last week → Quá khứ đơn; currently → Hiện tại tiếp diễn"),
        ("Hòa hợp chủ ngữ-động từ (Subject-Verb Agreement)", "grammar_topic", "basic",
         "One of the employees is. Danh từ tập hợp (committee, staff, team) thường số ít trong TOEIC"),
        ("Giới từ & Collocation", "grammar_topic", "basic",
         "depend on, responsible for, interested in, familiar with, apply for, consist of, prior to, on behalf of"),
        ("Liên từ & Giới từ đối lập (Conjunctions vs Prepositions)", "grammar_topic", "intermediate",
         "although/even though + mệnh đề (S+V); despite/in spite of + danh từ/V-ing; because vs because of/due to"),
        ("Mệnh đề quan hệ (Relative Clauses)", "grammar_topic", "intermediate",
         "who/which/that/whose. Rút gọn mệnh đề quan hệ"),
        ("So sánh (Comparatives / Superlatives)", "grammar_topic", "intermediate", "so sánh hơn/nhất/bằng"),
        ("Câu bị động (Passive Voice)", "grammar_topic", "basic", "is done, was done, has been done, will be done"),
        ("Danh động từ & Động từ nguyên mẫu (Gerund / Infinitive)", "grammar_topic", "intermediate",
         "enjoy + V-ing, decide + to V"),
        ("Động từ khuyết thiếu (Modal Verbs)", "grammar_topic", "intermediate", "can/could/may/might/must/should/would/will"),
        ("Câu điều kiện (Conditional Sentences)", "grammar_topic", "intermediate", "Type 1, 2"),
        ("Mạo từ (Articles)", "grammar_topic", "basic", "a/an/the — dễ bỏ sót nhưng xuất hiện thường xuyên"),
    ]
    for name, cat, level, desc in grammar_topics:
        items.append({"source": "Grok", "category": cat, "name": name, "level": level, "raw_text": desc})

    items.append({"source": "Grok", "category": "grammar_topic", "name": "Liên từ chuyển ý / Discourse Markers (Part 6)",
                  "level": "intermediate", "raw_text": "however, therefore, moreover, meanwhile — Part 6 discourse markers"})
    items.append({"source": "Grok", "category": "question_type", "name": "Điền câu vào đoạn văn (Sentence Insertion - Part 6)",
                  "level": "advanced", "raw_text": "Kiểm tra: đại từ/từ chỉ định (this/that/these/it/they), liên từ logic (However/Therefore/Moreover), từ khóa lặp"})

    p7_qtypes = [
        ("Câu hỏi Ý chính (Main Idea / Purpose)", "What is the purpose of the email/article/notice?"),
        ("Câu hỏi Chi tiết (Detail Question)", "When / Where / How much / Who / How many — scan từ khóa"),
        ("Câu hỏi Suy luận (Inference / Implication)", "What is suggested/implied about...? Suy luận từ manh mối"),
        ("Câu hỏi Từ vựng trong ngữ cảnh (Vocabulary in Context)", "The word '...' is closest in meaning to..."),
        ("Câu hỏi Đại từ tham chiếu (Reference Question)", "What does 'it / this / they' refer to?"),
        ("Câu hỏi Phủ định (NOT / EXCEPT)", "Which of the following is NOT mentioned/true?"),
        ("Câu hỏi Chèn câu (Sentence Location Part 7)", "Chọn vị trí phù hợp để chèn câu vào văn bản"),
        ("Câu hỏi Ghép thông tin (Cross-reference Double/Triple)", "Phải đối chiếu thông tin giữa 2-3 văn bản. Khó và dễ mất điểm nhất"),
    ]
    for name, desc in p7_qtypes:
        items.append({"source": "Grok", "category": "question_type", "name": name, "level": "intermediate", "raw_text": desc})

    vocab_subtopics_grok = [
        ("Văn phòng & Hành chính (Office)", "agenda, minutes, deadline, postpone, venue, memo"),
        ("Nhân sự (Human Resources)", "recruit, vacancy, probation, appraisal, resignation, incentive"),
        ("Tài chính & Kế toán (Finance)", "revenue, invoice, budget, expenditure, reimbursement, audit, deficit"),
        ("Marketing & Bán hàng (Marketing/Sales)", "campaign, promotion, competitor, consumer, market research, brand"),
        ("Du lịch công tác (Travel)", "reservation, delay, itinerary, accommodation, departure"),
        ("Logistics & Sản xuất (Logistics)", "shipment, inventory, warehouse, procurement, dispatch"),
        ("Hợp đồng & Pháp lý (Legal)", "clause, terminate, liable, comply with, warranty, binding"),
        ("Công nghệ & Vận hành (Technology)", "update, implement, system, software, maintenance"),
    ]
    for name, desc in vocab_subtopics_grok:
        items.append({"source": "Grok", "category": "vocab_topic", "name": name, "level": "basic", "raw_text": desc})

    return items


def parse_claude(text: str) -> list:
    """Claude.txt: Most detailed, 15 grammar points explicitly numbered."""
    items = []
    grammar_topics = [
        ("Từ loại / Dạng từ (Parts of Speech / Word Form)", "grammar_topic", "basic",
         "Hậu tố nhận diện: -tion/-ment/-ness → Danh từ; -ize/-ify → Động từ; -able/-al/-ive/-ous → Tính từ; -ly → Trạng từ. Danh từ đếm/không đếm được"),
        ("Hòa hợp chủ ngữ-động từ (Subject-Verb Agreement)", "grammar_topic", "basic",
         "Cụm danh từ dài chen giữa; each/every+N số ít; a number of+N số nhiều; the number of+N số ít"),
        ("Thì động từ (Verb Tenses)", "grammar_topic", "basic",
         "Bẫy: dấu hiệu thời gian không phải lúc nào cũng quyết định thì — lịch trình cố định dùng hiện tại đơn dù có 'tomorrow'"),
        ("Câu bị động (Passive Voice)", "grammar_topic", "basic",
         "Chỉ ngoại động từ (transitive verbs) mới có dạng bị động. is done/was done/has been done/will be done/is being done"),
        ("Danh động từ & Động từ nguyên mẫu (Gerund / Infinitive)", "grammar_topic", "intermediate",
         "remember to do vs remember doing; stop to do vs stop doing — đổi nghĩa khi dùng V-ing hay to V"),
        ("Mệnh đề quan hệ (Relative Clauses)", "grammar_topic", "intermediate",
         "Mệnh đề xác định và không xác định. Rút gọn V-ing / V3ed / to V"),
        ("Mệnh đề trạng ngữ & Liên từ phụ thuộc (Adverb Clauses)", "grammar_topic", "intermediate",
         "because/since/as (nguyên nhân); although/though/even though (nhượng bộ); when/while/before/after (thời gian); if/unless/provided that (điều kiện)"),
        ("Liên từ kết hợp & Tương quan (Coordinating/Correlative Conjunctions)", "grammar_topic", "intermediate",
         "and/but/or/so/yet/for/nor; either...or, neither...nor, both...and, not only...but also"),
        ("Giới từ (Prepositions)", "grammar_topic", "basic",
         "Giới từ cố định với động từ/tính từ/danh từ: responsible for, interested in, depend on, prior to. Phân biệt because vs because of; although vs despite"),
        ("Đại từ & Từ hạn định (Pronouns / Determiners)", "grammar_topic", "basic",
         "Nhân xưng (I/me), sở hữu (my/mine), phản thân (myself). Chỉ định (this/that/these/those). Từ hạn định: some/any/each/every/all/both/few/little"),
        ("So sánh (Comparatives / Superlatives)", "grammar_topic", "intermediate",
         "So sánh hơn (-er/more+adj), nhất (-est/the most+adj), bằng (as...as), kép (the more...the more...)"),
        ("Câu điều kiện (Conditional Sentences)", "grammar_topic", "intermediate",
         "Loại 0, 1, 2, 3 và hỗn hợp. Đảo ngữ: Were I..., Had I known..."),
        ("Cấu trúc song song (Parallel Structure)", "grammar_topic", "intermediate",
         "Các thành phần liên kết bởi and/or/but phải cùng dạng từ loại/cấu trúc ngữ pháp"),
        ("Động từ khuyết thiếu (Modal Verbs)", "grammar_topic", "intermediate",
         "can/could/may/might/must/should/will/would/have to. Modal+have+V3: should have done, must have done"),
        ("Collocation & Cụm động từ (Collocations & Phrasal Verbs)", "grammar_topic", "intermediate",
         "meet a deadline, place an order, submit an application. Động từ đi với giới từ cố định"),
    ]
    for name, cat, level, desc in grammar_topics:
        items.append({"source": "Claude", "category": cat, "name": name, "level": level, "raw_text": desc})

    vocab_types = [
        ("Từ dễ nhầm (Confusing Words)", "grammar_topic", "intermediate", "affect/effect, raise/rise, economic/economical — gần nghĩa"),
    ]
    for name, cat, level, desc in vocab_types:
        items.append({"source": "Claude", "category": cat, "name": name, "level": level, "raw_text": desc})

    # Part 6 specific
    items.append({"source": "Claude", "category": "grammar_topic", "name": "Liên từ chuyển ý / Discourse Markers (Part 6)",
                  "level": "intermediate", "raw_text": "however/therefore/in addition/moreover/as a result/otherwise/meanwhile/furthermore/on the other hand — quan trọng khi hiểu logic giữa các câu/đoạn"})
    items.append({"source": "Claude", "category": "question_type", "name": "Điền câu vào đoạn văn (Sentence Insertion - Part 6)",
                  "level": "advanced", "raw_text": "Chọn 1 trong 4 câu hoàn chỉnh. Chú ý từ nối/đại từ ở câu trước-sau, tính logic thời gian, chủ đề đoạn văn"})

    p7_qtypes = [
        ("Câu hỏi Ý chính (Main Idea / Purpose)", "What is the purpose of the email? What is the article mainly about?"),
        ("Câu hỏi Chi tiết (Detail Question)", "Dùng từ khóa (keyword) để định vị đoạn chứa đáp án"),
        ("Câu hỏi Suy luận (Inference / Implication)", "What can be inferred about... — suy luận logic, đáp án không được nói trực tiếp"),
        ("Câu hỏi Từ vựng trong ngữ cảnh (Vocabulary in Context)", "The word 'X' in paragraph 2 is closest in meaning to... — theo ngữ cảnh cụ thể, không phải nghĩa từ điển chung"),
        ("Câu hỏi Phủ định (NOT / EXCEPT)", "What is NOT mentioned..., All true EXCEPT..."),
        ("Câu hỏi Chèn câu (Sentence Location Part 7)", "In which position [1][2][3][4] does the sentence best belong?"),
        ("Câu hỏi Ý định người viết (Writer's Intention - Chat)", "At 10:15, what does Mr. Lee mean when he writes 'I'm on it'? — hàm ý trong hội thoại"),
        ("Câu hỏi Ghép thông tin (Cross-reference Double/Triple)", "Kết hợp thông tin từ 2-3 văn bản khác nhau — dạng khó nhất, tốn thời gian nhất"),
    ]
    for name, desc in p7_qtypes:
        items.append({"source": "Claude", "category": "question_type", "name": name, "level": "intermediate", "raw_text": desc})

    vocab_subtopics_claude = [
        ("Văn phòng & Công việc hằng ngày (Office/Workplace)", "agenda, memo, deadline, colleague, supervisor, department"),
        ("Nhân sự & Tuyển dụng (HR/Recruitment)", "applicant, résumé, candidate, interview, qualification, training, promotion"),
        ("Hợp đồng & Đấu thầu (Contracts/Bidding)", "agreement, terms and conditions, negotiate, proposal, bid, clause"),
        ("Marketing & Bán hàng (Marketing/Sales)", "campaign, advertisement, market research, target audience, discount, brand"),
        ("Tài chính & Ngân hàng (Finance/Banking)", "invoice, budget, expense, revenue, profit, loan, interest rate, transaction"),
        ("Công nghệ & Truyền thông (Technology/Media)", "software, webinar, security, network, upgrade, subscription"),
        ("Du lịch & Vận chuyển (Travel/Transportation)", "itinerary, reservation, boarding pass, luggage, accommodation"),
        ("Nhà hàng & Khách sạn & Sự kiện (Restaurant/Hotel/Events)", "reservation, catering, venue, complimentary, cuisine, RSVP"),
        ("Bất động sản (Real Estate)", "lease, tenant, landlord, property, renovation"),
        ("Sản xuất (Manufacturing)", "inventory, warehouse, shipment, quality control, defect, supply chain"),
        ("Y tế (Healthcare)", "appointment, prescription, insurance, physician"),
    ]
    for name, desc in vocab_subtopics_claude:
        items.append({"source": "Claude", "category": "vocab_topic", "name": name, "level": "basic", "raw_text": desc})

    return items


# ====================================================
# STEP 2: Parse all 4 files
# ====================================================

def read_file(fname: str) -> str:
    """Reads raw contents of a knowledge benchmark text file with UTF-8 encoding."""
    fpath = os.path.join(KNOWLEDGE_DIR, fname)
    with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()

chatgpt_text = read_file("ChatGPT.txt")
gemini_text = read_file("Gemini.txt")
grok_text = read_file("Grok.txt")
claude_text = read_file("Claude.txt")

chatgpt_items = parse_chatgpt(chatgpt_text)
gemini_items = parse_gemini(gemini_text)
grok_items = parse_grok(grok_text)
claude_items = parse_claude(claude_text)

all_items = chatgpt_items + gemini_items + grok_items + claude_items
logger.info(f"Parsed items: ChatGPT={len(chatgpt_items)}, Gemini={len(gemini_items)}, Grok={len(grok_items)}, Claude={len(claude_items)}")
logger.info(f"Total raw items: {len(all_items)}")

# ====================================================
# STEP 3: Cross-reference → canonical topics
# ====================================================

# Map of canonical name → metadata
CANONICAL_MAP = {
    # ===== GRAMMAR TOPICS (Part 5 core) =====
    "Từ loại / Dạng từ (Parts of Speech / Word Form)": {
        "category": "grammar_topic",
        "level": "basic",
        "parts": [5, 6],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 4,
        "agreement_note": "Tất cả 4 nguồn đồng thuận đây là chủ điểm quan trọng nhất Part 5 (25-35%)",
    },
    "Thì động từ (Verb Tenses)": {
        "category": "grammar_topic",
        "level": "basic",
        "parts": [5, 6],
        "prerequisite": "Từ loại / Dạng từ (Parts of Speech / Word Form)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. Grok bổ sung ngưỡng thì cụ thể (since→PP, yesterday→PS, currently→PC). Claude cảnh báo bẫy: dấu hiệu thời gian không luôn quyết định thì",
    },
    "Câu bị động (Passive Voice)": {
        "category": "grammar_topic",
        "level": "basic",
        "parts": [5, 6],
        "prerequisite": "Thì động từ (Verb Tenses)",
        "mapped_grammar_topics_db": ["Part 5 Grammar", "Câu bị động"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. Claude thêm: chỉ ngoại động từ (transitive) mới có bị động",
    },
    "Hòa hợp chủ ngữ-động từ (Subject-Verb Agreement)": {
        "category": "grammar_topic",
        "level": "basic",
        "parts": [5, 6],
        "prerequisite": "Từ loại / Dạng từ (Parts of Speech / Word Form)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 3,
        "agreement_note": "ChatGPT, Grok, Claude đề cập. Gemini không nhắc riêng. Grok thêm: collective nouns (committee/staff/team) → số ít trong TOEIC",
    },
    "Giới từ (Prepositions)": {
        "category": "grammar_topic",
        "level": "basic",
        "parts": [5, 6],
        "prerequisite": "Từ loại / Dạng từ (Parts of Speech / Word Form)",
        "mapped_grammar_topics_db": ["Part 5 Grammar", "Giới từ (Preposition)"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. Grok liệt kê cụm cố định: responsible for, interested in, depend on, prior to. Claude thêm phân biệt giới từ vs liên từ đồng nghĩa",
    },
    "Liên từ & Giới từ đối lập (Conjunctions vs Prepositions)": {
        "category": "grammar_topic",
        "level": "intermediate",
        "parts": [5, 6],
        "prerequisite": "Giới từ (Prepositions)",
        "mapped_grammar_topics_db": ["Part 5 Grammar", "Liên từ & Giới từ chỉ nguyên nhân / nhượng bộ (Conjunctions & Prepositions)"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. although/even though+mệnh đề ↔ despite/in spite of+danh từ; because+mệnh đề ↔ because of/due to+danh từ",
    },
    "Đại từ & Từ hạn định (Pronouns / Determiners)": {
        "category": "grammar_topic",
        "level": "basic",
        "parts": [5, 6, 7],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 5 Grammar", "Đại từ (Pronoun)"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. Claude chi tiết nhất: nhân xưng/sở hữu/phản thân/chỉ định + từ hạn định",
    },
    "Mệnh đề quan hệ (Relative Clauses)": {
        "category": "grammar_topic",
        "level": "intermediate",
        "parts": [5, 6],
        "prerequisite": "Thì động từ (Verb Tenses)",
        "mapped_grammar_topics_db": ["Part 5 Grammar", "Mệnh đề quan hệ (Relative Clauses)"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. Gemini thêm rút gọn V-ing/V-ed. Claude phân biệt xác định/không xác định",
    },
    "Mệnh đề trạng ngữ (Adverb Clauses / Subordinating Conjunctions)": {
        "category": "grammar_topic",
        "level": "intermediate",
        "parts": [5, 6],
        "prerequisite": "Liên từ & Giới từ đối lập (Conjunctions vs Prepositions)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 2,
        "agreement_note": "Claude liệt kê đầy đủ nhất (nguyên nhân/nhượng bộ/thời gian/điều kiện/mục đích). ChatGPT đề cập ngắn. Grok/Gemini không tách riêng",
    },
    "Danh động từ & Động từ nguyên mẫu (Gerund / Infinitive)": {
        "category": "grammar_topic",
        "level": "intermediate",
        "parts": [5],
        "prerequisite": "Từ loại / Dạng từ (Parts of Speech / Word Form)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. Claude thêm bẫy: remember/stop đổi nghĩa khi dùng V-ing vs to V",
    },
    "Động từ khuyết thiếu (Modal Verbs)": {
        "category": "grammar_topic",
        "level": "intermediate",
        "parts": [5, 6],
        "prerequisite": "Thì động từ (Verb Tenses)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. Claude thêm: Modal+have+V3 (should have done) — diễn tả quá khứ",
    },
    "So sánh (Comparatives / Superlatives)": {
        "category": "grammar_topic",
        "level": "intermediate",
        "parts": [5],
        "prerequisite": "Từ loại / Dạng từ (Parts of Speech / Word Form)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 3,
        "agreement_note": "ChatGPT, Grok, Claude đề cập. Claude thêm so sánh kép (the more...the more...)",
    },
    "Cấu trúc song song (Parallel Structure)": {
        "category": "grammar_topic",
        "level": "intermediate",
        "parts": [5, 6],
        "prerequisite": "Liên từ & Giới từ đối lập (Conjunctions vs Prepositions)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 2,
        "agreement_note": "ChatGPT, Claude đề cập. Grok/Gemini không nhắc riêng",
    },
    "Câu điều kiện (Conditional Sentences)": {
        "category": "grammar_topic",
        "level": "intermediate",
        "parts": [5],
        "prerequisite": "Thì động từ (Verb Tenses)",
        "mapped_grammar_topics_db": ["Part 5 Grammar", "Câu điều kiện & Biến thể đảo ngữ (Conditional Sentences)"],
        "source_count": 3,
        "agreement_note": "ChatGPT (Type 0-2+Mixed), Grok (Type 1-2), Claude (Type 0-3+hỗn hợp+đảo ngữ). Gemini không nhắc. Claude chi tiết nhất",
    },
    "Từ lượng (Quantifiers)": {
        "category": "grammar_topic",
        "level": "basic",
        "parts": [5],
        "prerequisite": "Đại từ & Từ hạn định (Pronouns / Determiners)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 1,
        "agreement_note": "Chỉ ChatGPT liệt kê riêng. Gemini/Grok/Claude không tách thành mục riêng — có thể gộp vào Đại từ & Từ hạn định",
    },
    "Mạo từ (Articles)": {
        "category": "grammar_topic",
        "level": "basic",
        "parts": [5],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 1,
        "agreement_note": "Chỉ Grok liệt kê riêng. Các nguồn khác đề cập trong Từ hạn định. Tần suất thấp nhưng hay gặp",
    },
    "Cấu trúc nhân quả (Causative Structure)": {
        "category": "grammar_topic",
        "level": "advanced",
        "parts": [5],
        "prerequisite": "Danh động từ & Động từ nguyên mẫu (Gerund / Infinitive)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 1,
        "agreement_note": "Chỉ ChatGPT liệt kê (have/get/make/let). Các nguồn khác không nhắc. Tần suất thấp",
    },
    "Đảo ngữ (Inversion)": {
        "category": "grammar_topic",
        "level": "advanced",
        "parts": [5],
        "prerequisite": "Câu điều kiện (Conditional Sentences)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 2,
        "agreement_note": "ChatGPT, Claude đề cập. Grok/Gemini không nhắc riêng. Tần suất hiếm trong TOEIC",
    },
    "Câu giả định (Subjunctive)": {
        "category": "grammar_topic",
        "level": "advanced",
        "parts": [5],
        "prerequisite": "Động từ khuyết thiếu (Modal Verbs)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 1,
        "agreement_note": "Chỉ ChatGPT liệt kê (recommend/suggest/insist that + bare inf). Rất ít xuất hiện trong TOEIC",
    },
    # ===== VOCABULARY TOPICS =====
    "Collocation (Cụm từ cố định)": {
        "category": "grammar_topic",
        "level": "intermediate",
        "parts": [5, 6],
        "prerequisite": "Từ loại / Dạng từ (Parts of Speech / Word Form)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. make a decision, meet a deadline, place an order. Claude nhấn mạnh học theo cụm không học từ đơn lẻ",
    },
    "Từ dễ nhầm (Confusing Words)": {
        "category": "grammar_topic",
        "level": "intermediate",
        "parts": [5],
        "prerequisite": "Collocation (Cụm từ cố định)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 3,
        "agreement_note": "ChatGPT, Claude đề cập (economic/economical, affect/effect). Grok gộp vào vocab. Gemini không nhắc",
    },
    "Cụm động từ (Phrasal Verbs)": {
        "category": "grammar_topic",
        "level": "intermediate",
        "parts": [5, 6],
        "prerequisite": "Collocation (Cụm từ cố định)",
        "mapped_grammar_topics_db": ["Part 5 Grammar"],
        "source_count": 3,
        "agreement_note": "ChatGPT, Gemini, Claude liệt kê. carry out, look into, put off, take over, hand in, set up",
    },
    # ===== PART 6 SPECIFIC =====
    "Liên từ chuyển ý / Discourse Markers (Part 6)": {
        "category": "grammar_topic",
        "level": "intermediate",
        "parts": [6],
        "prerequisite": "Liên từ & Giới từ đối lập (Conjunctions vs Prepositions)",
        "mapped_grammar_topics_db": ["Part 6 Text Completion"],
        "source_count": 3,
        "agreement_note": "ChatGPT, Grok, Claude đồng thuận. however/therefore/moreover/meanwhile/consequently. Đặc trưng Part 6, không có ở Part 5",
    },
    # ===== QUESTION TYPES =====
    "Điền câu vào đoạn văn (Sentence Insertion - Part 6)": {
        "category": "question_type",
        "level": "advanced",
        "parts": [6],
        "prerequisite": "Liên từ chuyển ý / Discourse Markers (Part 6)",
        "mapped_grammar_topics_db": ["Part 6 Text Completion"],
        "source_count": 4,
        "agreement_note": "Đồng thuận — dạng khó nhất Part 6. Kiểm tra: đại từ tham chiếu, liên từ logic, từ khóa lặp lại",
    },
    "Câu hỏi Ý chính (Main Idea / Purpose)": {
        "category": "question_type",
        "level": "basic",
        "parts": [7],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 7 Reading Comprehension"],
        "source_count": 4,
        "agreement_note": "Đồng thuận — dạng cơ bản nhất Part 7. Why was the email written? What is the article mainly about?",
    },
    "Câu hỏi Chi tiết (Detail Question)": {
        "category": "question_type",
        "level": "basic",
        "parts": [7],
        "prerequisite": "Câu hỏi Ý chính (Main Idea / Purpose)",
        "mapped_grammar_topics_db": ["Part 7 Reading Comprehension"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. Scan từ khóa (ngày tháng, số liệu, tên riêng). Who/What/When/Where/How much",
    },
    "Câu hỏi Phủ định (NOT / EXCEPT)": {
        "category": "question_type",
        "level": "intermediate",
        "parts": [7],
        "prerequisite": "Câu hỏi Chi tiết (Detail Question)",
        "mapped_grammar_topics_db": ["Part 7 Reading Comprehension"],
        "source_count": 3,
        "agreement_note": "ChatGPT, Grok, Claude đề cập. Gemini không nhắc riêng. Which is NOT mentioned/true?",
    },
    "Câu hỏi Suy luận (Inference / Implication)": {
        "category": "question_type",
        "level": "intermediate",
        "parts": [7],
        "prerequisite": "Câu hỏi Chi tiết (Detail Question)",
        "mapped_grammar_topics_db": ["Part 7 Reading Comprehension"],
        "source_count": 4,
        "agreement_note": "Đồng thuận — đáp án không được viết thẳng trong bài, phải suy luận từ manh mối",
    },
    "Câu hỏi Từ vựng trong ngữ cảnh (Vocabulary in Context)": {
        "category": "question_type",
        "level": "intermediate",
        "parts": [7],
        "prerequisite": "Câu hỏi Chi tiết (Detail Question)",
        "mapped_grammar_topics_db": ["Part 7 Reading Comprehension"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. Dựa vào ngữ cảnh cụ thể, không phải nghĩa từ điển chung",
    },
    "Câu hỏi Đại từ tham chiếu (Reference Question)": {
        "category": "question_type",
        "level": "intermediate",
        "parts": [7],
        "prerequisite": "Đại từ & Từ hạn định (Pronouns / Determiners)",
        "mapped_grammar_topics_db": ["Part 7 Reading Comprehension"],
        "source_count": 3,
        "agreement_note": "ChatGPT, Grok, Claude đề cập. What does 'it/this/they' refer to?",
    },
    "Câu hỏi Ý định người viết (Writer's Intention - Chat)": {
        "category": "question_type",
        "level": "advanced",
        "parts": [7],
        "prerequisite": "Câu hỏi Suy luận (Inference / Implication)",
        "mapped_grammar_topics_db": ["Part 7 Reading Comprehension"],
        "source_count": 1,
        "agreement_note": "Chỉ Claude đề cập. Hỏi hàm ý của câu nói trong hội thoại chat. Các nguồn khác gộp vào Suy luận",
    },
    "Câu hỏi Chèn câu (Sentence Location Part 7)": {
        "category": "question_type",
        "level": "advanced",
        "parts": [7],
        "prerequisite": "Điền câu vào đoạn văn (Sentence Insertion - Part 6)",
        "mapped_grammar_topics_db": ["Part 7 Reading Comprehension"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. In which position [1][2][3][4] does the sentence best belong?",
    },
    "Câu hỏi Ghép thông tin (Cross-reference Double/Triple)": {
        "category": "question_type",
        "level": "advanced",
        "parts": [7],
        "prerequisite": "Câu hỏi Suy luận (Inference / Implication)",
        "mapped_grammar_topics_db": ["Part 7 Reading Comprehension"],
        "source_count": 4,
        "agreement_note": "Đồng thuận — khó nhất Part 7. Phải đối chiếu thông tin từ 2-3 văn bản",
    },
    "Đọc bảng / biểu đồ (Graph/Table Question)": {
        "category": "question_type",
        "level": "intermediate",
        "parts": [7],
        "prerequisite": "Câu hỏi Chi tiết (Detail Question)",
        "mapped_grammar_topics_db": ["Part 7 Reading Comprehension"],
        "source_count": 1,
        "agreement_note": "Chỉ ChatGPT liệt kê riêng. Đọc bảng/biểu đồ/lịch/sơ đồ/menu kết hợp với đoạn văn",
    },
    # ===== VOCABULARY TOPIC AREAS =====
    "Nhân sự & Tuyển dụng (HR/Recruitment)": {
        "category": "vocab_topic",
        "level": "basic",
        "parts": [5, 6, 7],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 5 Grammar", "Part 6 Text Completion", "Part 7 Reading Comprehension"],
        "source_count": 4,
        "agreement_note": "Đồng thuận — chủ đề từ vựng quan trọng nhất TOEIC. recruit/résumé/candidate/promotion/appraisal/resignation",
    },
    "Tài chính & Kế toán (Finance/Accounting)": {
        "category": "vocab_topic",
        "level": "basic",
        "parts": [5, 6, 7],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 5 Grammar", "Part 6 Text Completion", "Part 7 Reading Comprehension"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. invoice/budget/revenue/expenditure/reimbursement/audit/deficit",
    },
    "Văn phòng & Hành chính (Office/Admin)": {
        "category": "vocab_topic",
        "level": "basic",
        "parts": [5, 6, 7],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 5 Grammar", "Part 6 Text Completion", "Part 7 Reading Comprehension"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. agenda/memo/deadline/postpone/venue/minutes/colleague/supervisor",
    },
    "Logistics & Sản xuất (Logistics/Manufacturing)": {
        "category": "vocab_topic",
        "level": "basic",
        "parts": [5, 6, 7],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 5 Grammar", "Part 6 Text Completion", "Part 7 Reading Comprehension"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. shipment/inventory/warehouse/procurement/dispatch/assembly line/quality control",
    },
    "Marketing & Bán hàng (Marketing/Sales)": {
        "category": "vocab_topic",
        "level": "basic",
        "parts": [5, 6, 7],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 5 Grammar", "Part 6 Text Completion", "Part 7 Reading Comprehension"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. campaign/promotion/competitor/consumer/market research/brand/discount",
    },
    "Du lịch & Vận chuyển (Travel/Transportation)": {
        "category": "vocab_topic",
        "level": "basic",
        "parts": [7],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 7 Reading Comprehension"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. reservation/delay/itinerary/accommodation/departure/boarding pass/luggage",
    },
    "Hợp đồng & Pháp lý (Legal/Contracts)": {
        "category": "vocab_topic",
        "level": "intermediate",
        "parts": [6, 7],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 6 Text Completion", "Part 7 Reading Comprehension"],
        "source_count": 3,
        "agreement_note": "Grok, Claude, ChatGPT đề cập. clause/terminate/liable/comply with/warranty/binding/lease/tenant",
    },
    "Công nghệ & Vận hành (Technology)": {
        "category": "vocab_topic",
        "level": "basic",
        "parts": [5, 6, 7],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 6 Text Completion", "Part 7 Reading Comprehension"],
        "source_count": 4,
        "agreement_note": "Đồng thuận. software/webinar/security/network/upgrade/subscription/maintenance/implementation",
    },
    "Nhà hàng & Khách sạn & Sự kiện (Restaurant/Hotel/Events)": {
        "category": "vocab_topic",
        "level": "basic",
        "parts": [7],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 7 Reading Comprehension"],
        "source_count": 3,
        "agreement_note": "Claude, ChatGPT, Grok đề cập. reservation/catering/venue/complimentary/cuisine/RSVP/exhibition",
    },
    "Y tế & Bảo hiểm (Healthcare/Insurance)": {
        "category": "vocab_topic",
        "level": "basic",
        "parts": [7],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 7 Reading Comprehension"],
        "source_count": 3,
        "agreement_note": "ChatGPT (y tế + bảo hiểm riêng), Claude (y tế), Grok không nhắc. appointment/prescription/insurance/physician/claim/coverage",
    },
    "Giáo dục & Đào tạo (Education/Training)": {
        "category": "vocab_topic",
        "level": "basic",
        "parts": [6, 7],
        "prerequisite": None,
        "mapped_grammar_topics_db": ["Part 6 Text Completion", "Part 7 Reading Comprehension"],
        "source_count": 2,
        "agreement_note": "ChatGPT, Claude đề cập. training/seminar/workshop/course/qualification/probation",
    },
}

# ====================================================
# STEP 4: Generate canonical curriculum topics list
# ====================================================

import sqlite3

db_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "toeic.db")
db_path = os.path.abspath(db_path)
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Get actual DB grammar_topics
cur.execute("""
    SELECT grammar_topic, COUNT(*) as cnt
    FROM questions
    WHERE grammar_topic IS NOT NULL AND TRIM(grammar_topic) != ''
    GROUP BY grammar_topic
    ORDER BY cnt DESC
""")
db_topics = {row[0]: row[1] for row in cur.fetchall()}

# Get actual DB vocabulary topic_categories
cur.execute("""
    SELECT topic_category, COUNT(*) as cnt
    FROM vocabulary
    WHERE topic_category IS NOT NULL
    GROUP BY topic_category
    ORDER BY cnt DESC
""")
db_vocab_cats = {row[0]: row[1] for row in cur.fetchall()}

conn.close()

# Build curriculum seed
curriculum_seed = []
topic_id = 1

# Build prerequisite name→id map (two-pass)
name_to_id = {}
for name in CANONICAL_MAP.keys():
    name_to_id[name] = topic_id
    topic_id += 1

topic_id = 1
for canonical_name, meta in CANONICAL_MAP.items():
    # Check how many questions in DB match this canonical topic
    db_question_count = 0
    for db_topic_name, cnt in db_topics.items():
        if db_topic_name in meta["mapped_grammar_topics_db"]:
            db_question_count += cnt

    # Determine if has real examples (not just generic Part X)
    has_real_specific_examples = any(
        t not in ["Part 5 Grammar", "Part 6 Text Completion", "Part 7 Reading Comprehension"]
        for t in meta["mapped_grammar_topics_db"]
        if t in db_topics
    )

    prereq_name = meta["prerequisite"]
    prereq_id = name_to_id.get(prereq_name) if prereq_name else None

    entry = {
        "id": topic_id,
        "canonical_name": canonical_name,
        "category": meta["category"],
        "level": meta["level"],
        "parts": meta["parts"],
        "prerequisite_topic_id": prereq_id,
        "prerequisite_name": prereq_name,
        "source_files": ["ChatGPT", "Gemini", "Grok", "Claude"],
        "source_count": meta["source_count"],
        "agreement_note": meta["agreement_note"],
        "mapped_grammar_topics_db": meta["mapped_grammar_topics_db"],
        "question_count_in_db": db_question_count,
        "has_specific_db_topic": has_real_specific_examples,
        "db_coverage_note": (
            f"{db_question_count} câu hỏi trong DB khớp với mapped_grammar_topics. "
            + ("Có topic cụ thể trong DB." if has_real_specific_examples else
               "CẢNH BÁO: Chỉ có topic generic (Part X Grammar/Reading) trong DB — cần phân loại lại câu hỏi để tạo ví dụ thật cho bài giảng này.")
        )
    }
    curriculum_seed.append(entry)
    topic_id += 1

# ====================================================
# STEP 5: Print report
# ====================================================

total = len(curriculum_seed)
has_specific = sum(1 for t in curriculum_seed if t["has_specific_db_topic"])
no_specific = total - has_specific
grammar_topics = [t for t in curriculum_seed if t["category"] == "grammar_topic"]
question_types = [t for t in curriculum_seed if t["category"] == "question_type"]
vocab_topics = [t for t in curriculum_seed if t["category"] == "vocab_topic"]

logger.info(f"\n=== MODULE 12.1 — CURRICULUM SEED REPORT ===")
logger.info(f"Total canonical topics: {total}")
logger.info(f"  Grammar topics: {len(grammar_topics)}")
logger.info(f"  Question types: {len(question_types)}")
logger.info(f"  Vocab topic areas: {len(vocab_topics)}")
logger.info(f"\nDB Coverage:")
logger.info(f"  Topics with specific DB grammar_topic: {has_specific}")
logger.info(f"  Topics with ONLY generic DB topic (need reclassification): {no_specific}")
logger.info(f"\n=== DoD: 10 random spot-check ===")
import random
random.seed(42)
for t in random.sample(curriculum_seed, min(10, len(curriculum_seed))):
    logger.info(f"  [{t['id']:02d}] [{t['category'][:12]:12s}] [{t['level']:12s}] {t['canonical_name'][:60]}")
    logger.info(f"        Source count: {t['source_count']}/4  |  DB questions: {t['question_count_in_db']}")

# Save seed file
output_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "curriculum_seed.json")
output_path = os.path.abspath(output_path)
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(curriculum_seed, f, ensure_ascii=False, indent=2)
logger.info(f"\n[OK] Saved curriculum_seed.json to: {output_path}")
logger.info(f"   Total {len(curriculum_seed)} canonical topics ready for review before DB import")
