/**
 * Localisation prep (Phase: later). One default locale today; the mechanism exists so chrome strings,
 * evidence labels and number/currency formatting can be translated without touching page code.
 *
 * Rules:
 *  - Entity content (src/data) stays English until a translation table exists in the DB (planned:
 *    `entity_translations(entity_type, entity_id, locale, field, value)`); never machine-translate
 *    verified regulatory text.
 *  - UI chrome strings live in messages/<locale>.ts keyed by stable ids; `t()` falls back to English.
 *  - Numbers/currency: use `numberFormat(locale)`; INR grouping (lakh/crore) is handled in lib/format.ts.
 *  - Route strategy (decided, not yet built): locale prefix `/hi/...` via proxy.ts, `hreflang` in metadata.
 */
import { en, type MessageKey } from "./messages/en";

export const LOCALES = ["en", "hi", "ta", "te", "ml", "kn"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_LABEL: Record<Locale, string> = { en: "English", hi: "हिन्दी", ta: "தமிழ்", te: "తెలుగు", ml: "മലയാളം", kn: "ಕನ್ನಡ" };

const MESSAGES: Partial<Record<Locale, Partial<Record<MessageKey, string>>>> = { en };

export function t(key: MessageKey, locale: Locale = DEFAULT_LOCALE, vars: Record<string, string | number> = {}): string {
  const raw = MESSAGES[locale]?.[key] ?? en[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

/** Current locale resolver — single source of truth so a future cookie/route reader is a one-line change. */
export function currentLocale(): Locale { return DEFAULT_LOCALE; }

export function numberFormat(locale: Locale = DEFAULT_LOCALE, opts: Intl.NumberFormatOptions = {}) {
  // Always en-IN numerals: lakh/crore grouping is the platform convention and ICU data for some Indian
  // locales (e.g. kn-IN) falls back to Western grouping. Locale-specific digits are a later decision.
  void locale;
  return new Intl.NumberFormat("en-IN", opts);
}
