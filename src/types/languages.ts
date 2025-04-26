/**
 * @link https://ai.google.dev/gemini-api/docs/models#supported-languages
 */
export const geminiApiSupportedLanguages = {
  ar: "ar", // Arabic
  bn: "bn", // Bengali
  bg: "bg", // Bulgarian
  "zh-CN": "zh-CN", // Chinese (Simplified)
  "zh-TW": "zh-TW", // Chinese (Traditional)
  hr: "hr", // Croatian
  cs: "cs", // Czech
  da: "da", // Danish
  nl: "nl", // Dutch
  en: "en", // English
  et: "et", // Estonian
  fi: "fi", // Finnish
  fr: "fr", // French
  de: "de", // German
  el: "el", // Greek
  iw: "iw", // Hebrew
  hi: "hi", // Hindi
  hu: "hu", // Hungarian
  id: "id", // Indonesian
  it: "it", // Italian
  ja: "ja", // Japanese
  ko: "ko", // Korean
  lv: "lv", // Latvian
  lt: "lt", // Lithuanian
  no: "no", // Norwegian
  pl: "pl", // Polish
  pt: "pt", // Portuguese
  ro: "ro", // Romanian
  ru: "ru", // Russian
  sr: "sr", // Serbian
  sk: "sk", // Slovak
  sl: "sl", // Slovenian
  es: "es", // Spanish
  sw: "sw", // Swahili
  sv: "sv", // Swedish
  th: "th", // Thai
  tr: "tr", // Turkish
  uk: "uk", // Ukrainian
  vi: "vi", // Vietnamese
};

export function isValidAiLanguage(language: string) {
  return Reflect.has(geminiApiSupportedLanguages, language);
}
