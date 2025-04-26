export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}

export function isValidLanguage(language: string): boolean {
  try {
    new Intl.Locale(language);
    return true;
  } catch (error) {
    return false;
  }
}
