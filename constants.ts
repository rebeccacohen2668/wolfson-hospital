
import { StageId } from './types';

export const APP_CONFIG = {
  "variables": {
    "name": "אורית",
    "phone": "05X-XXXXXXX",
    "preop_date": null,
    "preop_days": "—",
    "preop_days_manual": null,
    "preop_date_exists": false,
    "surgery_date": null,
    "surgery_days_left": null,
    "surgery_days_manual": null,
    "missing_docs_deadline": "_________________"
  },
  "feedbackMessages": {
    "notReady": "רק להזכיר, את לא לבד בתהליך הזה.\nאין לחץ, ואנחנו כאן כדי ללוות אותך.\nכשיהיה לך זמן נשמח להשלמת השלב",
    "reminder": "שלום {name}, תזכורת קטנה\nכשיהיה לך זמן, נשמח להשלמת השלב, אנחנו כאן וממשיכים איתך."
  },
  "question": {
    "botMessage": "תודה שכתבת. העברתי את השאלה לצוות המחלקה.\nאם נדרש מענה — יחזרו אליך.\nבינתיים, אם זה משהו דחוף — חשוב לפנות למוקד הרגיל של בית החולים."
  },
  "adminDemo": {
    "modalTitle": "עדכון מרפאה (דמו)",
    "fields": [
      { "key": "preop_date", "label": "תאריך טרום-ניתוח", "type": "date" },
      { "key": "preop_days_manual", "label": "ימים לטרום (עקיפה ידנית)", "type": "number" },
      { "key": "surgery_date", "label": "תאריך ניתוח", "type": "date" },
      { "key": "surgery_days_manual", "label": "ימים לניתוח (עקיפה ידנית)", "type": "number" }
    ]
  },
  "statusBar": {
    "template": "📅 טרום ניתוח: {preop_date} ({preop_days} ימים) | 🏥 ניתוח: {surgery_date} ({surgery_days_left} ימים)"
  },
  "startState": "STAGE_1" as StageId,
  "states": {
    "STAGE_1": {
      "stageName": "אחרי ביקור ראשון במרפאת חוץ",
      "message": "שלום {name}\nכאן הליווי הדיגיטלי של מחלקת אף אוזן גרון בבית חולים וולפסון. אני שולח לך תזכורות קצרות עד הניתוח, כדי לעזור לך להגיע מוכנה בלי לפספס דברים.\nלאחר הביקור במרפאה קיבלת תיקייה שתלווה אותך עד לניתוח.\nאני כאן כדי לעזור לסדר אותה, שלב־שלב, בלי לחץ.\nתאריך הניתוח עדיין לא נקבע, אנחנו עכשיו בשלב ההכנות",
      "buttons": [
        { "label": "הבנתי, אפשר להתחיל", "next": "STAGE_2" as StageId },
        { "label": "יש לי שאלה", "action": "QUESTION" }
      ]
    },
    "STAGE_2": {
      "stageName": "היכרות עם מפת המסלול",
      "message": "בתיקייה יש מפת מסלול המראה את כל השלבים עד לניתוח.\nכרגע רק חשוב להכיר את התהליך.\nתאריך הניתוח עדיין לא נקבע",
      "buttons": [
        { "label": "הסתכלתי על המפה", "next": "STAGE_3_LABS" as StageId },
        { "label": "יש לי שאלה", "action": "QUESTION" }
      ]
    },
    "STAGE_3_LABS": {
      "stageName": "שלב 3 – בדיקות מעבדה",
      "message": "שלום {name}, עכשיו אנחנו בשלב ההכנות בבית, לקראת פגישת הטרום־ניתוח.\nנלווה אותך בתהליך של הכנסת המסמכים לפי החוצצים בתיקייה (בדיקות מעבדה, הדמיות ודיסקים, בדיקות יעודיות, טופס 17, אישורים מרופאים מומחים).\n\nחוצץ: בדיקות מעבדה\nהאם ביצעת בדיקות דם ותפקודי קרישה? הכנס/י אותן לחוצץ המתאים.",
      "buttons": [
        { "label": "בוצע", "next": "STAGE_3_SPECIALISTS" as StageId },
        { "label": "עדין לא", "next": "STAGE_3_SPECIALISTS" as StageId },
        { "label": "שאלה למרפאה", "action": "QUESTION" }
      ]
    },
    "STAGE_3_SPECIALISTS": {
      "stageName": "שלב 3 – רופאים מומחים",
      "message": "חוצץ: רופאים מומחים\nאם יש לך מכתבים מרופאים מומחים הכנס/י אותן לחוצץ המתאים.",
      "buttons": [
        { "label": "בוצע", "next": "STAGE_3_IMAGING" as StageId },
        { "label": "עדין לא", "next": "STAGE_3_IMAGING" as StageId },
        { "label": "שאלה למרפאה", "action": "QUESTION" }
      ]
    },
    "STAGE_3_IMAGING": {
      "stageName": "שלב 3 – הדמיות + דיסקים",
      "message": "חוצץ: הדמיות + דיסקים\nהאם יש לך בדיקות הדמיה קודמות (למשל CT)? חשוב לשים גם את הדיסק עצמו בתיקייה, לא רק פענוח.",
      "buttons": [
        { "label": "יש פיענוח ודיסק והוכנסו", "next": "STAGE_3_HEARING" as StageId },
        { "label": "יש רק פיענוח", "next": "STAGE_3_HEARING" as StageId },
        { "label": "עדין לא בצעתי", "next": "STAGE_3_HEARING" as StageId },
        { "label": "שאלה למרפאה", "action": "QUESTION" }
      ]
    },
    "STAGE_3_HEARING": {
      "stageName": "שלב 3 – בדיקות שמע",
      "message": "חוצץ: בדיקות שמע (אם נדרשו)\nאם נדרשו בדיקות שמיעה – הכנס/י אותן לחוצץ הייעודי.",
      "buttons": [
        { "label": "בוצע", "next": "STAGE_3_FORM17_PREOP" as StageId },
        { "label": "ממתין לתור", "next": "STAGE_3_FORM17_PREOP" as StageId },
        { "label": "לא נדרש", "next": "STAGE_3_FORM17_PREOP" as StageId },
        { "label": "שאלה למרפאה", "action": "QUESTION" }
      ]
    },
    "STAGE_3_FORM17_PREOP": {
      "stageName": "שלב 3 – טופס 17",
      "message": "חוצץ: טופס 17 לטרום־ניתוח\nלקראת פגישת הטרום־ניתוח יש צורך ב־טופס 17 תקף.",
      "buttons": [
        { "label": "יש טופס 17", "next": "STAGE_4" as StageId },
        { "label": "בטיפול", "next": "STAGE_4" as StageId },
        { "label": "שאלה למרפאה", "action": "QUESTION" }
      ]
    },
    "STAGE_4": {
      "stageName": "תיאום טרום־ניתוח",
      "type": "CONDITION" as const,
      "cases": [
        {
          "when": "preop_date_exists",
          "message": "שלום {name}, פגישת הטרום־ניתוח היא פגישה חיונית לפני הניתוח, המתקיימת בבית החולים וולפסון. חשוב להגיע אליה עם התיקייה מסודרת.\nטרום־ניתוח בעוד {preop_days} ימים (בתאריך {preop_date})",
          "buttons": [
            { "label": "הבנתי", "next": "STAGE_5" as StageId },
            { "label": "שאלה למרפאה", "action": "QUESTION" }
          ]
        },
        {
          "when": "preop_date_missing",
          "message": "נשמח שתצרי קשר עם מרפאות החוץ כדי לקבוע תור לטרום ניתוח.",
          "buttons": [
            { "label": "הבנתי, אעשה זאת", "next": "STAGE_4_APPOINTMENT_CHECK" as StageId },
            { "label": "כבר קבעתי תור", "next": "STAGE_5" as StageId },
            { "label": "שאלה למרפאה", "action": "QUESTION" }
          ]
        }
      ]
    },
    "STAGE_4_APPOINTMENT_CHECK": {
      "stageName": "בדיקת סטטוס תור",
      "message": "האם יש לך כבר תור לטרום ניתוח?",
      "buttons": [
        { "label": "כן", "next": "STAGE_5" as StageId },
        { "label": "עדין לא", "next": "STAGE_4_APPOINTMENT_CHECK" as StageId },
        { "label": "שאלה למרפאה", "action": "QUESTION" }
      ]
    },
    "STAGE_5": {
      "stageName": "יום טרום־ניתוח",
      "message": "היום מתקיים הטרום־ניתוח בבית חולים וולפסון.\nהיום תעבר/י כמה תחנות: פגישה עם רופא אא\"ג, אחות ומרדים – זה תקין, ואנחנו איתך.",
      "buttons": [{ "label": "הבנתי, אני כאן", "next": "STAGE_5_IN_CLINIC_1" as StageId }]
    },
    "STAGE_5_IN_CLINIC_1": {
      "stageName": "טרום־ניתוח – הסכמה",
      "message": "האם חתמת על טופס הסכמה לניתוח?",
      "buttons": [
        { "label": "חתמתי", "next": "STAGE_5_IN_CLINIC_2" as StageId },
        { "label": "עוד לא", "next": "STAGE_5_IN_CLINIC_2" as StageId }
      ]
    },
    "STAGE_5_IN_CLINIC_2": {
      "stageName": "טרום־ניתוח – מרדים",
      "message": "האם נפגשת עם רופא מרדים? זה חלק רגיל מהתהליך.",
      "buttons": [
        { "label": "בוצע", "next": "STAGE_5_IN_CLINIC_3" as StageId },
        { "label": "לא נדרש", "next": "STAGE_5_IN_CLINIC_3" as StageId }
      ]
    },
    "STAGE_5_IN_CLINIC_3": {
      "stageName": "טרום־ניתוח – אחות",
      "message": "האם נפגשת עם אחות לקחת מדדים?",
      "buttons": [
        { "label": "בוצע", "next": "STAGE_5_IN_CLINIC_4" as StageId },
        { "label": "עוד לא", "next": "STAGE_5_IN_CLINIC_4" as StageId }
      ]
    },
    "STAGE_5_IN_CLINIC_4": {
      "stageName": "טרום־ניתוח – רנטגן",
      "message": "אם היה לך דיסק, האם מסרת אותו למחלקת רנטגן?",
      "buttons": [
        { "label": "בוצע", "next": "STAGE_6" as StageId },
        { "label": "לא נדרש", "next": "STAGE_6" as StageId }
      ]
    },
    "STAGE_6": {
      "stageName": "שיבוץ לניתוח",
      "type": "CONDITION" as const,
      "baseMessage": "סיימת את שלב הטרום־ניתוח. הצוות עובר על החומרים, ואנחנו מתקדמים לשלב הבא.",
      "cases": [
        {
          "when": "surgery_date_exists",
          "message": "איזה יופי! נקבע לך ניתוח לתאריך {surgery_date}.",
          "buttons": [
            { "label": "קבלתי", "next": "STAGE_7_READY" as StageId },
            { "label": "שאלה למרפאה", "action": "QUESTION" }
          ]
        },
        { "when": "surgery_date_missing", "message": "בימים הקרובים ייקבע תאריך לניתוח. אנחנו ממתינים לשיבוץ.", "buttons": [{ "label": "הבנתי", "next": "WAIT_SURGERY_DATE" as StageId }] },
        {
          "when": "missing_docs",
          "message": "נמצאו חסרים בתיק הרפואי שחשוב להשלים לפני שנוכל לקבוע לך תור לניתוח.\nנשמח שתצרי קשר עם מזכירות המחלקה עד {missing_docs_deadline}",
          "buttons": [{ "label": "קבלתי", "next": "STAGE_6" as StageId }]
        }
      ]
    },
    "WAIT_SURGERY_DATE": {
      "stageName": "המתנה לשיבוץ",
      "message": "בימים הקרובים ייקבע תאריך לניתוח. אנחנו עדיין בתהליך שיבוץ עבורך.\nהאם נקבע לך תור לניתוח?",
      "buttons": [
        { "label": "כן", "next": "STAGE_6" as StageId },
        { "label": "עדיין לא", "next": "WAIT_SURGERY_DATE" as StageId },
        { "label": "שאלה למרפאה", "action": "QUESTION" }
      ]
    },
    "STAGE_7_READY": {
      "stageName": "מוכנה לניתוח",
      "message": "איזה יופי {name}, נקבע לך תאריך לניתוח ({surgery_date}). נשארו לך {surgery_days_left} ימים לניתוח, אנחנו כמעט שם.\nחשוב עכשיו לוודא שיש לך טופס 17 לניתוח.",
      "buttons": [
        { "label": "יש טופס 17", "next": "STAGE_8_PREP" as StageId },
        { "label": "בטיפול", "next": "STAGE_8_PREP" as StageId },
        { "label": "שאלה למרפאה", "action": "QUESTION" }
      ]
    },
    "STAGE_8_PREP": {
      "stageName": "הכנות אחרונות",
      "message": "נשארו לך {surgery_days_left} ימים לניתוח. עכשיו אנחנו בשלב ההכנות לפני הניתוח.\nבגב התיקייה יש דף הכנות לפני ניתוח. חשוב ומומלץ לעבור עליו בימים הקרובים.",
      "buttons": [
        { "label": "קראתי", "next": "STAGE_8_TWO_DAYS_BEFORE" as StageId },
        { "label": "אקרא בהמשך", "next": "STAGE_8_TWO_DAYS_BEFORE" as StageId }
      ]
    },
    "STAGE_8_TWO_DAYS_BEFORE": {
      "stageName": "יומיים לפני הניתוח",
      "message": "שלום {name}, אם עוד לא יצא לך לעבור על דף ההכנות, זה זמן טוב. נשארו יומיים לניתוח.",
      "buttons": [
        { "label": "קראתי", "next": "STAGE_8_EVE_BEFORE" as StageId },
        { "label": "עוד לא", "next": "STAGE_8_EVE_BEFORE" as StageId }
      ]
    },
    "STAGE_8_EVE_BEFORE": {
      "stageName": "ערב הניתוח",
      "message": "מחר הניתוח! לא לשכוח לעבור שוב על ההנחיות לפני הניתוח (צום וכדומה). ודאי שהכל מסודר בתיקייה ואת מוכנה.",
      "buttons": [
        { "label": "הבנתי", "next": "STAGE_9" as StageId },
        { "label": "שאלה למרפאה", "action": "QUESTION" }
      ]
    },
    "STAGE_9": {
      "stageName": "יום הניתוח",
      "message": "שלום {name}, זהו, היום הניתוח, אנחנו מחכים לך בבית החולים.\nלא לשכוח להביא:\n• תעודה מזהה\n• טופס 17\n• התיקייה המסודרת",
      "buttons": [
        { "label": "אני בדרך", "next": "STAGE_FINISH" as StageId },
        { "label": "הגעתי", "next": "STAGE_FINISH" as StageId }
      ]
    },
    "STAGE_FINISH": {
      "stageName": "סיום",
      "message": "איזה יופי {name}! אנחנו מחכים לך במחלקה. הצוות כבר ערוך לקראתך.\nשיהיה המון בהצלחה ורפואה שלמה.",
      "buttons": []
    }
  }
} as const;
