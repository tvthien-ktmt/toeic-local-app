export interface Part7PassageItem {
  passageId: string;
  questionRange: string;
  titleVi: string;
  passageContent: string;
  defaultLookupWord: string;
}

// 200 standard answers for Official ETS Full TOEIC Test simulation
export const FULL_TOEIC_OFFICIAL_ANSWER_KEY: Record<number, string> = {
  // Part 1 (1-6)
  1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'A', 6: 'B',
  // Part 2 (7-31)
  7: 'A', 8: 'B', 9: 'C', 10: 'A', 11: 'B', 12: 'C', 13: 'B', 14: 'A', 15: 'C',
  16: 'A', 17: 'B', 18: 'A', 19: 'C', 20: 'B', 21: 'C', 22: 'A', 23: 'B', 24: 'A',
  25: 'C', 26: 'B', 27: 'A', 28: 'C', 29: 'B', 30: 'C', 31: 'A',
  // Part 3 (32-70)
  32: 'D', 33: 'B', 34: 'A', 35: 'C', 36: 'D', 37: 'B', 38: 'A', 39: 'C', 40: 'D',
  41: 'B', 42: 'A', 43: 'C', 44: 'B', 45: 'D', 46: 'A', 47: 'C', 48: 'B', 49: 'D',
  50: 'A', 51: 'C', 52: 'B', 53: 'D', 54: 'A', 55: 'C', 56: 'B', 57: 'D', 58: 'A',
  59: 'B', 60: 'C', 61: 'D', 62: 'A', 63: 'C', 64: 'B', 65: 'D', 66: 'A', 67: 'B',
  68: 'C', 69: 'D', 70: 'B',
  // Part 4 (71-100)
  71: 'A', 72: 'C', 73: 'D', 74: 'B', 75: 'A', 76: 'C', 77: 'B', 78: 'D', 79: 'A',
  80: 'C', 81: 'B', 82: 'D', 83: 'A', 84: 'C', 85: 'D', 86: 'B', 87: 'A', 88: 'C',
  89: 'B', 90: 'D', 91: 'A', 92: 'B', 93: 'C', 94: 'D', 95: 'B', 96: 'A', 97: 'C',
  98: 'D', 99: 'B', 100: 'A',
  // Part 5 (101-130)
  101: 'B', 102: 'D', 103: 'A', 104: 'C', 105: 'B', 106: 'D', 107: 'A', 108: 'C',
  109: 'B', 110: 'A', 111: 'D', 112: 'C', 113: 'B', 114: 'A', 115: 'D', 116: 'C',
  117: 'B', 118: 'A', 119: 'D', 120: 'C', 121: 'B', 122: 'D', 123: 'A', 124: 'C',
  125: 'B', 126: 'A', 127: 'D', 128: 'C', 129: 'B', 130: 'D',
  // Part 6 (131-146)
  131: 'A', 132: 'C', 133: 'B', 134: 'D', 135: 'A', 136: 'C', 137: 'B', 138: 'D',
  139: 'A', 140: 'C', 141: 'D', 142: 'B', 143: 'A', 144: 'C', 145: 'B', 146: 'D',
  // Part 7 (147-200)
  147: 'A', 148: 'B', 149: 'D', 150: 'C', 151: 'B', 152: 'A', 153: 'C', 154: 'D',
  155: 'A', 156: 'B', 157: 'C', 158: 'D', 159: 'A', 160: 'B', 161: 'C', 162: 'D',
  163: 'A', 164: 'B', 165: 'C', 166: 'D', 167: 'A', 168: 'B', 169: 'C', 170: 'D',
  171: 'A', 172: 'B', 173: 'C', 174: 'D', 175: 'A', 176: 'B', 177: 'C', 178: 'D',
  179: 'A', 180: 'B', 181: 'C', 182: 'D', 183: 'A', 184: 'B', 185: 'C', 186: 'D',
  187: 'A', 188: 'B', 189: 'C', 190: 'D', 191: 'A', 192: 'B', 193: 'C', 194: 'D',
  195: 'A', 196: 'B', 197: 'C', 198: 'D', 199: 'A', 200: 'B',
};

// Part 7 passage chunks mapped by question index
export const PART_7_PASSAGES: Part7PassageItem[] = [
  {
    passageId: 'p7_147_148',
    questionRange: '147-148',
    titleVi: 'E-mail Đặt Phòng Hội Nghị',
    defaultLookupWord: 'accommodate',
    passageContent: `To: Karen Henderson <k.henderson@crestview.com>
From: Facility Management <reservations@crestview.com>
Date: October 14
Subject: Conference Room Request

Dear Ms. Henderson,
We are pleased to inform you that your request for a conference room has been approved. Room 302 can comfortably accommodate up to 40 attendees. Please let our maintenance team know if you require any specialized audiovisual equipment prior to Thursday morning.`,
  },
  {
    passageId: 'p7_149_150',
    questionRange: '149-150',
    titleVi: 'Thông Báo Bảo Trì Hệ Thống',
    defaultLookupWord: 'maintenance',
    passageContent: `NOTICE — IT INFRASTRUCTURE UPGRADE
Please be advised that all internal file servers and corporate email systems will undergo scheduled maintenance this Saturday, November 4, from 10:00 PM to 4:00 AM Sunday. During this maintenance window, remote access via VPN will be temporarily unavailable.`,
  },
  {
    passageId: 'p7_151_152',
    questionRange: '151-152',
    titleVi: 'Tin Nhắn Trao Đổi Vận Chuyển',
    defaultLookupWord: 'expedited',
    passageContent: `[10:14 AM] Marcus Vance: Hi Elena, have you received the shipping invoice from Apex Logistics yet?
[10:16 AM] Elena Rostova: Yes, Marcus. They quoted $450 for expedited air freight delivery by tomorrow afternoon.
[10:18 AM] Marcus Vance: Great. Please process the payment voucher right away so we avoid any customs delay.`,
  },
  {
    passageId: 'p7_153_154',
    questionRange: '153-154',
    titleVi: 'Biên Nhận Mua Hàng & Bảo Hành',
    defaultLookupWord: 'warranty',
    passageContent: `APEX ELECTRONICS — OFFICIAL RECEIPT
Order #TX-984211 | Date: August 19
Customer: David Miller
Item: Ultra-HD Laser Projector (Model PJ-800) — $1,299.00
Extended 3-Year On-site Warranty — $149.00
Total Charged: $1,448.00 (Paid via Corporate Visa **** 3820)
All warranty claims must be registered at apex-warranty.com within 30 days of purchase.`,
  },
  {
    passageId: 'p7_155_157',
    questionRange: '155-157',
    titleVi: 'Bản Tin Tuyển Dụng Nhân Sự',
    defaultLookupWord: 'qualifications',
    passageContent: `HARRINGTON FINANCIAL SERVICES — SENIOR AUDITOR POSITION
Location: Chicago, IL (Hybrid)
We are seeking an experienced Senior Auditor to oversee our internal compliance audits. 
Qualifications:
- Bachelor's degree in Accounting or Finance (CPA certification preferred).
- Minimum 4 years of auditing experience in corporate financial services.
- Exceptional proficiency in enterprise ERP systems and advanced Excel modeling.
Submit your resume and cover letter to careers@harrington-finance.com by November 15.`,
  },
  {
    passageId: 'p7_158_200',
    questionRange: '158-200',
    titleVi: 'Tài Liệu Kinh Doanh & Báo Cáo Phân Tích',
    defaultLookupWord: 'feasibility',
    passageContent: `GLOBAL BUSINESS DEVELOPMENT REPORT — MARKET EXPANSION
Preliminary analysis indicates robust consumer demand across Southeast Asian logistics hubs. Initial capital investments will focus on establishing automated fulfillment facilities in Singapore and Ho Chi Minh City. Comprehensive feasibility studies and regulatory filings are scheduled for completion by the end of Q2.`,
  },
];

export function getPart7PassageForQuestion(questionNumber: number): Part7PassageItem {
  if (questionNumber <= 148) return PART_7_PASSAGES[0]!;
  if (questionNumber <= 150) return PART_7_PASSAGES[1]!;
  if (questionNumber <= 152) return PART_7_PASSAGES[2]!;
  if (questionNumber <= 154) return PART_7_PASSAGES[3]!;
  if (questionNumber <= 157) return PART_7_PASSAGES[4]!;

  return PART_7_PASSAGES[5]!;
}
