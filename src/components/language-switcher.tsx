"use client";

import type { Lang } from "@/lib/i18n";

export function LanguageSwitcher({ current }: { current: Lang }) {
  function switchTo(lang: Lang) {
    document.cookie = `lang=${lang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-0.5 text-xs font-medium">
      <button
        onClick={() => switchTo("fr")}
        className={`px-2 py-1 transition-colors ${
          current === "fr"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Français"
      >
        FR
      </button>
      <span className="text-muted-foreground/50">|</span>
      <button
        onClick={() => switchTo("en")}
        className={`px-2 py-1 transition-colors ${
          current === "en"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
