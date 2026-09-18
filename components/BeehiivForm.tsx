"use client";

import { useEffect, useRef } from "react";

const LOADER_SRC = "https://subscribe-forms.beehiiv.com/v3/loader.js";

type Props = {
  /** beehiiv form id from the embed code's data-beehiiv-form attribute. */
  formId: string;
  /** Small print shown under the form, inside the panel. */
  footnote?: React.ReactNode;
  className?: string;
};

/**
 * Inline beehiiv subscribe form on a white background that matches the
 * form's own, so it blends into the white sections it sits in. The v3 loader renders the form next to its own
 * <script> tag, so the script has to be inserted at the spot where the
 * form should appear rather than hoisted via next/script.
 */
export function BeehiivForm({ formId, footnote, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = LOADER_SRC;
    script.dataset.beehiivForm = formId;
    container.appendChild(script);

    return () => {
      container.replaceChildren();
    };
  }, [formId]);

  return (
    <div className={`rounded-2xl bg-white text-ink ${className}`}>
      <div ref={ref} />
      {footnote && (
        <p className="mt-3 text-center text-sm text-muted">{footnote}</p>
      )}
    </div>
  );
}
