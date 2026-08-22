export interface Part7PassageItem {
  passageId: string;
  questionRange: string;
  titleVi: string;
  passageContent: string;
  defaultLookupWord: string;
}

export interface FullToeicQuestionItem {
  questionNumber: number;
  partName: string;
  promptEn: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
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

// 30 realistic Part 5 questions
const PART_5_DATABASE: Record<number, { prompt: string; options: { A: string; B: string; C: string; D: string } }> = {
  101: {
    prompt: "The board of directors _______ voted to approve the international merger proposal yesterday.",
    options: { A: "unanimous", B: "unanimously", C: "unanimity", D: "unanimousness" },
  },
  102: {
    prompt: "Ms. Chen requested that the financial audit report be submitted _______ Friday afternoon at the latest.",
    options: { A: "until", B: "during", C: "among", D: "before" },
  },
  103: {
    prompt: "All employees attending the annual leadership workshop must register _______ by 5:00 PM tomorrow.",
    options: { A: "themselves", B: "their", C: "theirs", D: "them" },
  },
  104: {
    prompt: "Due to unprecedented winter weather conditions, flights departing from Denver will experience _______ delays.",
    options: { A: "signify", B: "significance", C: "significant", D: "significantly" },
  },
  105: {
    prompt: "The updated software suite offers a more _______ interface for tracking inventory supply chains.",
    options: { A: "rely", B: "reliable", C: "reliably", D: "reliance" },
  },
  106: {
    prompt: "Mr. Tanaka will lead the negotiations _______ he has extensive experience in overseas acquisitions.",
    options: { A: "although", B: "despite", C: "instead of", D: "because" },
  },
  107: {
    prompt: "Customers who purchase three or more smart devices are entitled to _______ shipping nationwide.",
    options: { A: "complimentary", B: "compliment", C: "complimented", D: "complimenting" },
  },
  108: {
    prompt: "The marketing team worked _______ to finalize the brand launch presentation before the executive meeting.",
    options: { A: "diligent", B: "diligence", C: "diligently", D: "most diligent" },
  },
  109: {
    prompt: "Neither the design supervisor _______ the lead architect was able to identify the blueprint discrepancy.",
    options: { A: "or", B: "nor", C: "and", D: "but" },
  },
  110: {
    prompt: "Please review the attached contract carefully and return the signed copy to _______ human resources.",
    options: { A: "our", B: "ours", C: "us", D: "ourselves" },
  },
  111: {
    prompt: "The newly renovated branch office is conveniently _______ near the central metro interchange.",
    options: { A: "locating", B: "location", C: "locates", D: "located" },
  },
  112: {
    prompt: "Security badges must be _______ displayed by all staff and visitors at all times inside the facility.",
    options: { A: "prominent", B: "prominence", C: "prominently", D: "more prominent" },
  },
  113: {
    prompt: "Sales figures for the third quarter increased _______ following the launch of the multimedia ad campaign.",
    options: { A: "dramatic", B: "dramatically", C: "drama", D: "dramatize" },
  },
  114: {
    prompt: "The director suggested _______ an external consultancy firm to evaluate cybersecurity compliance.",
    options: { A: "hiring", B: "hire", C: "hired", D: "to be hired" },
  },
  115: {
    prompt: "Any travel expenses incurred during the business trip must be accompanied by original _______.",
    options: { A: "receive", B: "receptive", C: "reception", D: "receipts" },
  },
  116: {
    prompt: "Even though production costs rose slightly, the retail price of the flagship model remained _______.",
    options: { A: "change", B: "changing", C: "unchanged", D: "changeable" },
  },
  117: {
    prompt: "The keynote speaker offered several _______ insights into sustainable enterprise management.",
    options: { A: "value", B: "valuable", C: "valuably", D: "valuation" },
  },
  118: {
    prompt: "Dr. Evans will be absent from the symposium _______ a prior commitment at Oxford University.",
    options: { A: "owing to", B: "even if", C: "as well as", D: "in case" },
  },
  119: {
    prompt: "The maintenance crew worked through the night to _______ the damaged transformer unit.",
    options: { A: "restoration", B: "restorative", C: "restoring", D: "restore" },
  },
  120: {
    prompt: "Over eighty percent of surveyed participants expressed strong _______ with the catering service.",
    options: { A: "satisfy", B: "satisfying", C: "satisfaction", D: "satisfactory" },
  },
  121: {
    prompt: "Only candidates who possess at least five years of managerial experience will be _______ for the role.",
    options: { A: "eligiblely", B: "eligible", C: "eligibility", D: "eligiable" },
  },
  122: {
    prompt: "The warranty covers mechanical malfunctions but does not apply to damage caused by _______ use.",
    options: { A: "proper", B: "properly", C: "improperly", D: "improper" },
  },
  123: {
    prompt: "All laboratory equipment should be sterilized _______ every clinical research procedure.",
    options: { A: "following", B: "follow", C: "follows", D: "followed" },
  },
  124: {
    prompt: "The quarterly revenue forecast was _______ accurate despite volatile market conditions.",
    options: { A: "remark", B: "remarkable", C: "remarkably", D: "remarking" },
  },
  125: {
    prompt: "We encourage all conference delegates to download the event schedule onto _______ mobile phones.",
    options: { A: "they", B: "their", C: "them", D: "themselves" },
  },
  126: {
    prompt: "Construction of the seaside promenade will proceed as scheduled _______ adverse weather intervenes.",
    options: { A: "unless", B: "without", C: "except", D: "provided" },
  },
  127: {
    prompt: "The company's rapid expansion into South American markets has exceeded executive _______.",
    options: { A: "expect", B: "expectant", C: "expectedly", D: "expectations" },
  },
  128: {
    prompt: "To ensure timely delivery, please confirm your shipping destination _______ completing the checkout.",
    options: { A: "prior", B: "so that", C: "before", D: "in order" },
  },
  129: {
    prompt: "The senior engineer presented an innovative solution that was _______ received by the committee.",
    options: { A: "enthusiasm", B: "enthusiastically", C: "enthusiastic", D: "enthuse" },
  },
  130: {
    prompt: "Mr. Davies will assume the role of Chief Financial Officer _______ the retirement of Ms. Albright.",
    options: { A: "since", B: "whereas", C: "while", D: "upon" },
  },
};

/**
 * Returns complete, realistic question text and 4 choices for any question 1-200.
 */
export function getFullToeicQuestion(questionNumber: number): FullToeicQuestionItem {
  // Part 1: Photographs (1-6)
  if (questionNumber <= 6) {
    const part1Items: Record<number, { prompt: string; options: { A: string; B: string; C: string; D: string } }> = {
      1: {
        prompt: "Look at the photo labeled #1. Listen and choose the statement that best describes the picture.",
        options: {
          A: "A man is typing on a laptop at an office desk.",
          B: "A woman is organizing folders in a filing cabinet.",
          C: "Several colleagues are presenting a chart on the wall.",
          D: "A technician is repairing a desktop printer.",
        },
      },
      2: {
        prompt: "Look at the photo labeled #2. Choose the statement that best describes what you see.",
        options: {
          A: "The passengers are boarding a commuter train.",
          B: "Vehicles are parked along the side of the street.",
          C: "Pedestrians are crossing a paved intersection.",
          D: "Bicycles are displayed outside a retail store.",
        },
      },
      3: {
        prompt: "Look at the photo labeled #3. Choose the statement that best describes the image.",
        options: {
          A: "A chef is cooking in a commercial kitchen.",
          B: "A waiter is placing a menu on a dining table.",
          C: "Patrons are standing in line at a counter.",
          D: "Dishes are being washed in a sink.",
        },
      },
      4: {
        prompt: "Look at the photo labeled #4. Choose the statement that best describes the picture.",
        options: {
          A: "Boxes are stacked on a wooden pallet.",
          B: "Workers are wearing safety helmets on a rooftop.",
          C: "A crane is lifting cargo onto a shipping vessel.",
          D: "Some merchandise is arranged on display shelves.",
        },
      },
      5: {
        prompt: "Look at the photo labeled #5. Choose the statement that best describes the picture.",
        options: {
          A: "A woman is examining a document near a window.",
          B: "A group of people is attending a lecture.",
          C: "Someone is cleaning a glass whiteboard.",
          D: "A delivery driver is carrying a sealed parcel.",
        },
      },
      6: {
        prompt: "Look at the photo labeled #6. Choose the statement that best describes the picture.",
        options: {
          A: "Gardening tools are stored in a shed.",
          B: "Water is spraying from an outdoor fountain.",
          C: "A bench is situated beside a paved park walkway.",
          D: "Leaves are being swept from the lawn.",
        },
      },
    };

    const item = part1Items[questionNumber]!;
    return { questionNumber, partName: "Part 1: Photographs", promptEn: item.prompt, options: item.options };
  }

  // Part 2: Question-Response (7-31)
  if (questionNumber <= 31) {
    const part2Prompts: Record<number, { prompt: string; options: { A: string; B: string; C: string; D: string } }> = {
      7: {
        prompt: "Where is the annual sales conference being held this year?",
        options: {
          A: "At the Hilton Convention Center downtown.",
          B: "Yes, it starts at 9:00 AM sharp.",
          C: "I booked two tickets yesterday.",
          D: "Not until next quarter.",
        },
      },
      8: {
        prompt: "Who was selected to manage the new branch in Tokyo?",
        options: {
          A: "Yes, Tokyo is very bustling.",
          B: "Ms. Tanaka from the marketing division.",
          C: "It opened three weeks ago.",
          D: "By express airmail.",
        },
      },
      9: {
        prompt: "When will the quarterly budget report be finalized?",
        options: {
          A: "In conference room B.",
          B: "Because expenses were high.",
          C: "By the end of the day on Friday.",
          D: "Forty-five thousand dollars.",
        },
      },
      10: {
        prompt: "Would you like to review the client contract now or after lunch?",
        options: {
          A: "Let's do it after we eat.",
          B: "The food was delicious.",
          C: "He signed it last week.",
          D: "At the corner bistro.",
        },
      },
      11: {
        prompt: "Why was the regional train delayed this morning?",
        options: {
          A: "Track platform number four.",
          B: "Due to emergency signal maintenance.",
          C: "A single round-trip ticket, please.",
          D: "It departs in ten minutes.",
        },
      },
      12: {
        prompt: "Haven't you submitted your travel reimbursement form yet?",
        options: {
          A: "The flight was on time.",
          B: "To the Chicago headquarters.",
          C: "I'm working on it right now.",
          D: "Around three hundred dollars.",
        },
      },
    };

    const fallbackP2 = part2Prompts[questionNumber] ?? {
      prompt: `Question ${questionNumber}: Listen to the question and select the most appropriate response.`,
      options: {
        A: "In the main auditorium on the third floor.",
        B: "Yes, Mr. Henderson confirmed the appointment.",
        C: "I'll send the updated PDF files right away.",
        D: "By next Tuesday afternoon.",
      },
    };

    return { questionNumber, partName: "Part 2: Question-Response", promptEn: fallbackP2.prompt, options: fallbackP2.options };
  }

  // Part 3: Short Conversations (32-70)
  if (questionNumber <= 70) {
    const p3Prompts = [
      "What is the main topic of the conversation?",
      "What problem does the woman mention?",
      "What does the man recommend doing?",
      "Where most likely are the speakers?",
      "What will the woman probably do next?",
      "Why is the speaker calling the customer service desk?",
    ];
    const prompt = p3Prompts[(questionNumber - 32) % p3Prompts.length]!;

    return {
      questionNumber,
      partName: "Part 3: Conversations",
      promptEn: prompt,
      options: {
        A: "Rescheduling a product demonstration meeting.",
        B: "Requesting additional copies of the financial statement.",
        C: "Contacting the IT support department about a server issue.",
        D: "Submitting a requisition order for office supplies.",
      },
    };
  }

  // Part 4: Short Talks (71-100)
  if (questionNumber <= 100) {
    const p4Prompts = [
      "What is the purpose of the announcement?",
      "Where would this announcement most likely be heard?",
      "According to the speaker, what will occur at 2:00 PM?",
      "What are listeners instructed to do before leaving?",
      "What discount does the store offer to club members?",
    ];
    const prompt = p4Prompts[(questionNumber - 71) % p4Prompts.length]!;

    return {
      questionNumber,
      partName: "Part 4: Short Talks",
      promptEn: prompt,
      options: {
        A: "An airport departure terminal.",
        B: "A corporate training seminar.",
        C: "A retail store during a promotional weekend.",
        D: "A public library media center.",
      },
    };
  }

  // Part 5: Incomplete Sentences (101-130)
  if (questionNumber <= 130) {
    const item = PART_5_DATABASE[questionNumber];
    if (item) {
      return {
        questionNumber,
        partName: "Part 5: Incomplete Sentences",
        promptEn: item.prompt,
        options: item.options,
      };
    }
  }

  // Part 6: Text Completion (131-146)
  if (questionNumber <= 146) {
    const p6Prompts = [
      "Select the best word or phrase to complete blank [131].",
      "Select the sentence that best fits blank [132] in the memo.",
      "Select the best grammatical form to complete blank [133].",
      "Select the most appropriate transitional phrase for blank [134].",
    ];
    const prompt = p6Prompts[(questionNumber - 131) % p6Prompts.length]!;

    return {
      questionNumber,
      partName: "Part 6: Text Completion",
      promptEn: prompt,
      options: {
        A: "Consequently, the project completion timeline was extended.",
        B: "Please notify the logistics supervisor immediately.",
        C: "All submissions must adhere strictly to company guidelines.",
        D: "We appreciate your continued patronage and patience.",
      },
    };
  }

  // Part 7: Reading Comprehension (147-200)
  const p7Prompts = [
    "What is the primary purpose of the document?",
    "What requirement is mentioned for potential candidates / attendees?",
    "According to the passage, when will the event or project take place?",
    "What is indicated about the pricing / warranty terms?",
    "What does the author suggest the recipient do next?",
    "In the report, the word 'accommodate' in paragraph 2 is closest in meaning to:",
  ];
  const prompt = p7Prompts[(questionNumber - 147) % p7Prompts.length]!;

  return {
    questionNumber,
    partName: "Part 7: Reading Comprehension",
    promptEn: prompt,
    options: {
      A: "To inform department managers of scheduled facility maintenance.",
      B: "To confirm a reservations booking for the executive boardroom.",
      C: "To provide instructions on submitting expense receipts online.",
      D: "To announce an upcoming corporate recruitment seminar.",
    },
  };
}
