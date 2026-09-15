import { useEffect } from "react";

export function CodeCopyEnhancer() {
  useEffect(() => {
    const cleanups = Array.from(
      document.querySelectorAll<HTMLButtonElement>("[data-copy-code]"),
    ).map((button) => {
      const copy = async () => {
        const code = button.closest("[data-code-block]")?.querySelector("code")?.textContent;
        if (!code) return;
        await navigator.clipboard.writeText(code);
        const label = button.querySelector("span");
        if (label) label.textContent = "Copié";
        window.setTimeout(() => {
          if (label) label.textContent = "Copier";
        }, 2000);
      };
      button.addEventListener("click", copy);
      return () => button.removeEventListener("click", copy);
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
