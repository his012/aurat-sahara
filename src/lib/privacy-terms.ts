import type { Lang } from "./i18n";

export type PrivacyTermsContent = {
  title: string;
  intro: string;
  privacyLabel: string;
  termsLabel: string;
  privacyPoints: string[];
  termsPoints: string[];
  declineBtn: string;
  agreeContinueBtn: string;
};

const en: PrivacyTermsContent = {
  title: "Privacy Policy & Terms of Use",
  intro: "Before continuing, please read and agree to our terms.",
  privacyLabel: "PRIVACY POLICY:",
  termsLabel: "TERMS OF USE:",
  privacyPoints: [
    "We collect your name, age, city, CNIC number, and skill information solely for the purpose of issuing your Hunar Sanad certificate.",
    "Your CNIC and personal information is kept strictly confidential and is only accessible to Aurat Sahara administrators.",
    "We do not share, sell, or distribute your personal information to any third party.",
    "Your uploaded photos are stored securely and used only for certificate verification.",
    "You may request deletion of your data at any time by contacting us.",
  ],
  termsPoints: [
    "You confirm that all information provided is accurate and truthful.",
    "You confirm that uploaded photos represent your own work.",
    "False information may result in certificate cancellation.",
    "Aurat Sahara certificates are for skill recognition purposes and do not replace official government documents.",
    "By continuing, you agree to these terms and our privacy policy.",
  ],
  declineBtn: "Decline",
  agreeContinueBtn: "Agree & Continue",
};

const ur: PrivacyTermsContent = {
  title: "رازداری کی پالیسی اور استعمال کی شرائط",
  intro: "آگے بڑھنے سے پہلے براہ کرم ہماری شرائط پڑھیں اور اتفاق کریں۔",
  privacyLabel: "رازداری کی پالیسی:",
  termsLabel: "استعمال کی شرائط:",
  privacyPoints: [
    "ہم آپ کا نام، عمر، شہر، شناختی کارڈ نمبر اور مہارت کی معلومات صرف سرٹیفکیٹ جاری کرنے کے لیے جمع کرتے ہیں۔",
    "آپ کی ذاتی معلومات محفوظ ہیں اور صرف عورت سہارا کے منتظمین کو دستیاب ہیں۔",
    "ہم آپ کی معلومات کسی تیسرے فریق کو نہیں دیتے۔",
    "آپ کی تصاویر محفوظ طریقے سے ذخیرہ کی جاتی ہیں۔",
    "آپ کسی بھی وقت ہم سے رابطہ کر کے اپنے ڈیٹے کی حذف کاری کی درخواست کر سکتے ہیں۔",
  ],
  termsPoints: [
    "آپ تصدیق کرتے ہیں کہ تمام معلومات درست ہیں۔",
    "آپ تصدیق کرتے ہیں کہ اپلوڈ کردہ تصاویر آپ کا اپنا کام ہیں۔",
    "غلط معلومات سے سرٹیفکیٹ منسوخ ہو سکتا ہے۔",
    "عورت سہارا سرٹیفکیٹ سرکاری دستاویز کا متبادل نہیں ہے۔",
    "آگے بڑھنے سے، آپ ان شرائط اور ہماری رازداری کی پالیسی سے اتفاق کرتے ہیں۔",
  ],
  declineBtn: "انکار کریں",
  agreeContinueBtn: "اتفاق کریں اور جاری رکھیں",
};

const roman: PrivacyTermsContent = {
  title: "Privacy Policy aur Terms of Use",
  intro: "Aagay barhnay se pehle hamari terms parhein aur agree karein.",
  privacyLabel: "Privacy Policy:",
  termsLabel: "Terms of Use:",
  privacyPoints: [
    "Hum aapka naam, umar, sheher, CNIC number aur skill sirf certificate jari karne ke liye collect karte hain.",
    "Aapki personal information sirf Aurat Sahara admins dekh sakte hain.",
    "Hum aapki information kisi ko share nahi karte.",
    "Aapki photos secure storage mein hain.",
    "Aap kabhi bhi hum se contact kar ke apne data ki deletion request kar sakte hain.",
  ],
  termsPoints: [
    "Aap confirm karte hain ke sari information sach hai.",
    "Aap confirm karte hain ke upload ki hui photos aapka apna kaam hain.",
    "Galat information se certificate cancel ho sakta hai.",
    "Aurat Sahara certificate sarkari document ka badal nahi hai.",
    "Aagay barhnay se, aap in terms aur hamari privacy policy se agree karte hain.",
  ],
  declineBtn: "Decline",
  agreeContinueBtn: "Agree & Continue",
};

const CONTENT: Record<Lang, PrivacyTermsContent> = { en, ur, roman };

export function getPrivacyTerms(lang: Lang): PrivacyTermsContent {
  return CONTENT[lang] ?? en;
}
