"use client";

import { useEffect, useSyncExternalStore } from "react";
import { cx } from "@/components/ui/primitives";

/**
 * Language toggle (English / తెలుగు) — header, right corner.
 * Engine: Google's free page-translation element (no API key, no cost). The choice is stored in the
 * `googtrans` cookie that the element reads; selecting Telugu lazily loads the element and it translates
 * every page client-side, so all 270 pages (including data tables) are covered without maintaining
 * a Telugu copy of the content. English is the source language — nothing is loaded for EN.
 *
 * Numbers, evidence badges and code are marked `translate="no"` upstream where it matters (`.notranslate`).
 */
type Lang = "en" | "te";
const COOKIE = "googtrans";

function readLang(): Lang {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  return m && decodeURIComponent(m[1]).endsWith("/te") ? "te" : "en";
}

function writeLang(lang: Lang) {
  const host = location.hostname;
  const expire = lang === "en" ? "Thu, 01 Jan 1970 00:00:00 GMT" : new Date(Date.now() + 365 * 864e5).toUTCString();
  const val = lang === "en" ? "" : `/en/${lang}`;
  // Google reads the cookie on the exact host and on the parent domain; write both so it sticks on vercel.app and custom domains.
  document.cookie = `${COOKIE}=${val}; expires=${expire}; path=/`;
  document.cookie = `${COOKIE}=${val}; expires=${expire}; path=/; domain=${host}`;
  const parent = host.split(".").slice(-2).join(".");
  if (parent !== host) document.cookie = `${COOKIE}=${val}; expires=${expire}; path=/; domain=.${parent}`;
}

/** React + Google Translate DOM guard: Google wraps translated text in <font>, which can make React's
 *  removeChild/insertBefore throw during re-renders. Standard mitigation — make those calls tolerant. */
function installDomGuard() {
  const w = window as unknown as { __coconutDomGuard?: boolean };
  if (w.__coconutDomGuard) return;
  w.__coconutDomGuard = true;
  const rc = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return rc.call(this, child) as T;
  };
  const ib = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return node;
    return ib.call(this, node, ref) as T;
  };
}

declare global {
  interface Window { googleTranslateElementInit?: () => void; google?: { translate?: { TranslateElement?: new (opts: object, id: string) => unknown } } }
}

function loadGoogle() {
  if (document.getElementById("gt-script")) return;
  if (!document.getElementById("google_translate_element")) {
    const host = document.createElement("div");
    host.id = "google_translate_element";
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden";
    document.body.appendChild(host);
  }
  window.googleTranslateElementInit = () => {
    const TE = window.google?.translate?.TranslateElement;
    if (TE) new TE({ pageLanguage: "en", includedLanguages: "te,en", autoDisplay: false }, "google_translate_element");
  };
  const s = document.createElement("script");
  s.id = "gt-script";
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.body.appendChild(s);
}

export function LanguageToggle({ dark, className }: { dark?: boolean; className?: string }) {
  // Cookie is the store; it only changes via choose() which reloads, so no subscription is needed.
  const lang = useSyncExternalStore(() => () => {}, readLang, () => "en" as Lang);

  useEffect(() => {
    if (lang === "te") { installDomGuard(); loadGoogle(); }
  }, [lang]);

  const choose = (next: Lang) => {
    if (next === lang) return;
    writeLang(next);
    // A reload gives Google a clean DOM to translate (and restores the English DOM when switching back).
    location.reload();
  };

  return (
    <div role="radiogroup" aria-label="Language / భాష" className={cx("notranslate inline-flex rounded-full border p-0.5", dark ? "border-ivory-100/25" : "border-neutral-300 bg-cocos", className)} translate="no">
      {([["en", "EN"], ["te", "తెలుగు"]] as [Lang, string][]).map(([l, label]) => (
        <button key={l} role="radio" aria-checked={lang === l} lang={l} onClick={() => choose(l)}
          className={cx("rounded-full px-3 py-1.5 text-[0.75rem] font-semibold tracking-wide transition-colors tap min-h-[32px]", lang === l ? (dark ? "bg-accent text-coconut-950" : "bg-coconut-950 text-ivory-50") : dark ? "text-ivory-100/80 hover:text-ivory-50" : "text-neutral-600 hover:text-neutral-900")}>
          {label}
        </button>
      ))}
    </div>
  );
}
