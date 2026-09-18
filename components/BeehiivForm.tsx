"use client";

import { useEffect, useRef } from "react";

const LOADER_SRC = "https://subscribe-forms.beehiiv.com/v3/loader.js";

type Props = {
  /** beehiiv form id from the embed code's data-beehiiv-form attribute. */
  formId: string;
  className?: string;
};

/**
 * Inline beehiiv subscribe form. The v3 loader renders the form next to
 * its own <script> tag, so the script has to be inserted at the spot
 * where the form should appear rather than hoisted via next/script.
 */
export function BeehiivForm({ formId, className = "" }: Props) {
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

  return <div ref={ref} className={className} />;
}
