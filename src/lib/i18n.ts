// Central translation system for Aurat Sahara.
// Selected language is stored in localStorage under the "language" key.

export type Lang = "en" | "ur" | "roman";

export function getLang(): Lang {
  if (typeof window === "undefined") return "en";
  const v = localStorage.getItem("language");
  if (v === "en" || v === "ur" || v === "roman") return v;
  // Backwards compatibility with the old key.
  const legacy = localStorage.getItem("selectedLang");
  if (legacy === "en" || legacy === "ur" || legacy === "roman") return legacy;
  return "en";
}

export function setLang(lang: Lang) {
  try {
    localStorage.setItem("language", lang);
  } catch {
    /* ignore storage errors */
  }
}

export function isRtl(lang: Lang): boolean {
  return lang === "ur";
}

type Dict = {
  // auth
  signUp: string;
  signIn: string;
  email: string;
  password: string;
  confirmPassword: string;
  forgotPassword: string;
  pleaseWait: string;
  changeLanguage: string;
  passwordsNoMatch: string;
  enterEmailFirst: string;
  resetLinkSent: string;
  accountCreated: string;
  // home
  homeIntro: string;
  startBtn: string;
  adminAccess: string;
  adminEnterPassword: string;
  unlock: string;
  wrongPassword: string;
  // apply
  myApplications: string;
  noApplications: string;
  submittedSuccess: string;
  typing: string;
  uploading: string;
  uploadedSuffix: string;
  typeMessage: string;
  applicationSubmitted: string;
  backToHome: string;
  somethingWrong: string;
  signInAgain: string;
  uploadFailed: string;
  voiceUnsupported: string;
  voiceFailed: string;
  // notifications
  home: string;
  markAllRead: string;
  notifications: string;
  loading: string;
  noNotifications: string;
  viewCertificate: string;
  notifUpdateFailed: string;
  allMarkedRead: string;
  // certificate
  certNotFound: string;
  certSubtitle: string;
  certBodyPrefix: string;
  certBodyMiddle: string;
  issuedOn: string;
  verifyAt: string;
  downloadCertificate: string;
  // verify
  verifying: string;
  verifiedMsg: string;
  invalidCert: string;
  couldNotVerify: string;
  nameLabel: string;
  skillLabel: string;
};

const en: Dict = {
  signUp: "Sign Up",
  signIn: "Sign In",
  email: "Email",
  password: "Password",
  confirmPassword: "Confirm Password",
  forgotPassword: "Forgot Password?",
  pleaseWait: "Please wait…",
  changeLanguage: "← Change language",
  passwordsNoMatch: "Passwords do not match.",
  enterEmailFirst: "Enter your email above first.",
  resetLinkSent: "Password reset link sent to your email.",
  accountCreated: "Account created! Check your email to confirm your address.",
  homeIntro:
    "Apply for a certificate of your skill through AI. We will review your application and send you a notification with approval or comments.",
  startBtn: "Get Started",
  adminAccess: "Admin Access",
  adminEnterPassword: "Enter the password to continue.",
  unlock: "Unlock",
  wrongPassword: "Wrong password.",
  myApplications: "My Applications",
  noApplications: "No applications yet. Start with the chat below.",
  submittedSuccess: "Your application has been submitted! You'll get an update in notifications.",
  typing: "typing…",
  uploading: "uploading…",
  uploadedSuffix: "uploaded",
  typeMessage: "Type your message…",
  applicationSubmitted: "Application submitted",
  backToHome: "← Back to Home",
  somethingWrong: "Sorry, something went wrong. Please try again.",
  signInAgain: "Please sign in again.",
  uploadFailed: "Could not upload an image. Please try again.",
  voiceUnsupported: "Voice input is not supported in this browser.",
  voiceFailed: "Could not capture voice. Please try again.",
  home: "Home",
  markAllRead: "Mark all as read",
  notifications: "Notifications",
  loading: "Loading…",
  noNotifications: "No notifications yet.",
  viewCertificate: "View Certificate",
  notifUpdateFailed: "Could not update notifications.",
  allMarkedRead: "All notifications marked as read.",
  certNotFound: "Certificate not found.",
  certSubtitle: "Certificate of Skill Verification",
  certBodyPrefix: "This certifies that",
  certBodyMiddle: "has demonstrated verified proficiency in",
  issuedOn: "Issued on",
  verifyAt: "Verify this certificate at:",
  downloadCertificate: "Download Certificate",
  verifying: "Verifying…",
  verifiedMsg: "✓ Verified — This is a legitimate Aurat Sahara certificate",
  invalidCert: "✗ Invalid Certificate",
  couldNotVerify: "We could not verify this certificate.",
  nameLabel: "Name:",
  skillLabel: "Skill:",
};

const ur: Dict = {
  signUp: "اکاؤنٹ بنائیں",
  signIn: "سائن اِن",
  email: "ای میل",
  password: "پاس ورڈ",
  confirmPassword: "پاس ورڈ کی تصدیق",
  forgotPassword: "پاس ورڈ بھول گئے؟",
  pleaseWait: "براہِ کرم انتظار کریں…",
  changeLanguage: "← زبان تبدیل کریں",
  passwordsNoMatch: "پاس ورڈ آپس میں مطابقت نہیں رکھتے۔",
  enterEmailFirst: "پہلے اوپر اپنی ای میل درج کریں۔",
  resetLinkSent: "پاس ورڈ ری سیٹ لنک آپ کی ای میل پر بھیج دیا گیا ہے۔",
  accountCreated: "اکاؤنٹ بن گیا! اپنی ای میل کی تصدیق کے لیے ای میل چیک کریں۔",
  homeIntro:
    "AI کے ذریعے اپنی مہارت کا سرٹیفکیٹ حاصل کریں۔ ہم آپ کی درخواست کا جائزہ لیں گے اور منظوری یا تبصرے کے ساتھ نوٹیفیکیشن بھیج دیں گے۔",
  startBtn: "شروع کریں",
  adminAccess: "ایڈمن رسائی",
  adminEnterPassword: "جاری رکھنے کے لیے پاس ورڈ درج کریں۔",
  unlock: "کھولیں",
  wrongPassword: "غلط پاس ورڈ۔",
  myApplications: "میری درخواستیں",
  noApplications: "ابھی کوئی درخواست نہیں۔ نیچے چیٹ سے شروع کریں۔",
  submittedSuccess: "آپ کی درخواست جمع ہو گئی! نوٹیفیکیشن میں اپڈیٹ ملے گی۔",
  typing: "لکھ رہا ہے…",
  uploading: "اپلوڈ ہو رہا ہے…",
  uploadedSuffix: "اپلوڈ ہوئیں",
  typeMessage: "اپنا پیغام لکھیں…",
  applicationSubmitted: "درخواست جمع ہو گئی",
  backToHome: "← ہوم پر واپس",
  somethingWrong: "معذرت، کچھ غلط ہو گیا۔ براہِ کرم دوبارہ کوشش کریں۔",
  signInAgain: "براہِ کرم دوبارہ سائن اِن کریں۔",
  uploadFailed: "تصویر اپلوڈ نہیں ہو سکی۔ براہِ کرم دوبارہ کوشش کریں۔",
  voiceUnsupported: "اس براؤزر میں وائس ان پٹ دستیاب نہیں ہے۔",
  voiceFailed: "آواز ریکارڈ نہیں ہو سکی۔ براہِ کرم دوبارہ کوشش کریں۔",
  home: "ہوم",
  markAllRead: "سب کو پڑھا ہوا نشان زد کریں",
  notifications: "نوٹیفیکیشنز",
  loading: "لوڈ ہو رہا ہے…",
  noNotifications: "ابھی کوئی نوٹیفیکیشن نہیں۔",
  viewCertificate: "سرٹیفکیٹ دیکھیں",
  notifUpdateFailed: "نوٹیفیکیشنز اپڈیٹ نہیں ہو سکیں۔",
  allMarkedRead: "تمام نوٹیفیکیشنز پڑھی ہوئی نشان زد کر دی گئیں۔",
  certNotFound: "سرٹیفکیٹ نہیں ملا۔",
  certSubtitle: "مہارت کی تصدیق کا سرٹیفکیٹ",
  certBodyPrefix: "اس سے تصدیق ہوتی ہے کہ",
  certBodyMiddle: "نے اس مہارت میں تصدیق شدہ مہارت کا مظاہرہ کیا ہے:",
  issuedOn: "جاری کیا گیا",
  verifyAt: "اس سرٹیفکیٹ کی تصدیق یہاں کریں:",
  downloadCertificate: "سرٹیفکیٹ ڈاؤن لوڈ کریں",
  verifying: "تصدیق ہو رہی ہے…",
  verifiedMsg: "✓ تصدیق شدہ — یہ ایک مستند عورت سہارا سرٹیفکیٹ ہے",
  invalidCert: "✗ غلط سرٹیفکیٹ",
  couldNotVerify: "ہم اس سرٹیفکیٹ کی تصدیق نہیں کر سکے۔",
  nameLabel: "نام:",
  skillLabel: "مہارت:",
};

const roman: Dict = {
  signUp: "Sign Up",
  signIn: "Sign In",
  email: "Email",
  password: "Password",
  confirmPassword: "Password dobara likhein",
  forgotPassword: "Password bhool gaye?",
  pleaseWait: "Intezaar karein…",
  changeLanguage: "← Zabaan tabdeel karein",
  passwordsNoMatch: "Dono password aik jaise nahi hain.",
  enterEmailFirst: "Pehle upar apni email likhein.",
  resetLinkSent: "Password reset link aapki email par bhej diya gaya hai.",
  accountCreated: "Account ban gaya! Email check karke apna pata confirm karein.",
  homeIntro:
    "AI ke zariye apni skill ka certificate apply karein. Hum aapki application review karenge aur approve ya comment ke saath notification bhej denge.",
  startBtn: "Shuru Karein",
  adminAccess: "Admin Access",
  adminEnterPassword: "Aage barhne ke liye password likhein.",
  unlock: "Unlock",
  wrongPassword: "Ghalat password.",
  myApplications: "Meri Applications",
  noApplications: "Abhi koi application nahi. Niche chat se shuru karein.",
  submittedSuccess: "Aapki application submit ho gayi! Notification mein update milegi.",
  typing: "likh raha hai…",
  uploading: "upload ho raha hai…",
  uploadedSuffix: "uploaded",
  typeMessage: "Apna message likhein…",
  applicationSubmitted: "Application submit ho gayi",
  backToHome: "← Home par wapas",
  somethingWrong: "Maaf kijiye, kuch ghalat ho gaya. Dobara koshish karein.",
  signInAgain: "Baraye meharbani dobara sign in karein.",
  uploadFailed: "Image upload nahi ho saki. Dobara koshish karein.",
  voiceUnsupported: "Is browser mein voice input available nahi hai.",
  voiceFailed: "Awaz record nahi ho saki. Dobara koshish karein.",
  home: "Home",
  markAllRead: "Sab ko read mark karein",
  notifications: "Notifications",
  loading: "Load ho raha hai…",
  noNotifications: "Abhi koi notification nahi.",
  viewCertificate: "Certificate dekhein",
  notifUpdateFailed: "Notifications update nahi ho saken.",
  allMarkedRead: "Tamam notifications read mark kar di gayin.",
  certNotFound: "Certificate nahi mila.",
  certSubtitle: "Certificate of Skill Verification",
  certBodyPrefix: "Is se tasdeeq hoti hai ke",
  certBodyMiddle: "ne is skill mein verified mahaarat ka muzahira kiya hai:",
  issuedOn: "Jaari kiya gaya",
  verifyAt: "Is certificate ki tasdeeq yahan karein:",
  downloadCertificate: "Certificate Download Karein",
  verifying: "Tasdeeq ho rahi hai…",
  verifiedMsg: "✓ Verified — Yeh aik asli Aurat Sahara certificate hai",
  invalidCert: "✗ Ghalat Certificate",
  couldNotVerify: "Hum is certificate ki tasdeeq nahi kar sake.",
  nameLabel: "Naam:",
  skillLabel: "Skill:",
};

const DICTS: Record<Lang, Dict> = { en, ur, roman };

export function t(lang: Lang): Dict {
  return DICTS[lang] ?? en;
}

// ---- Localized notification text ----
// Notifications are stored in a fixed language in the database, so we rebuild
// the title/body on the client in the user's selected language using the
// notification type plus the related skill / decline reason.

export type NotifType = "approved" | "declined" | "info" | string;

type NotifOpts = { skill?: string | null; reason?: string | null };

export function notifTitle(lang: Lang, type: NotifType): string {
  const map: Record<Lang, Record<string, string>> = {
    en: {
      approved: "Application approved ✓",
      declined: "Application declined",
      info: "Application received",
    },
    ur: {
      approved: "درخواست منظور ہو گئی ✓",
      declined: "درخواست مسترد کر دی گئی",
      info: "درخواست موصول ہو گئی",
    },
    roman: {
      approved: "Application approve ho gayi ✓",
      declined: "Application decline ho gayi",
      info: "Application mosool ho gayi",
    },
  };
  return map[lang]?.[type] ?? map.en[type] ?? "";
}

export function notifBody(lang: Lang, type: NotifType, opts: NotifOpts = {}): string {
  const skill = opts.skill?.trim() || "";
  const reason = opts.reason?.trim() || "";
  if (type === "approved") {
    if (lang === "ur")
      return `مبارک ہو! "${skill}" کے لیے آپ کے سرٹیفکیٹ کی درخواست منظور ہو گئی ہے۔`;
    if (lang === "roman")
      return `Mubarak ho! "${skill}" ke liye aapke certificate ki request approve ho gayi hai.`;
    return `Congratulations! Your certificate request for "${skill}" was approved.`;
  }
  if (type === "declined") {
    if (lang === "ur")
      return `"${skill}" کے لیے آپ کے سرٹیفکیٹ کی درخواست مسترد کر دی گئی۔${reason ? ` وجہ: ${reason}` : ""}`;
    if (lang === "roman")
      return `"${skill}" ke liye aapke certificate ki request decline ho gayi.${reason ? ` Wajah: ${reason}` : ""}`;
    return `Your certificate request for "${skill}" was declined.${reason ? ` Reason: ${reason}` : ""}`;
  }
  // info / received
  if (lang === "ur")
    return `"${skill}" کے لیے آپ کے سرٹیفکیٹ کی درخواست زیرِ جائزہ ہے۔`;
  if (lang === "roman")
    return `"${skill}" ke liye aapke certificate ki request review mein hai.`;
  return `Your certificate request for "${skill}" is under review.`;
}

export type { Dict };
