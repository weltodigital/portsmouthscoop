"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

const MESSAGE_MAX = 180;

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const emailOk = /.+@.+\..+/.test(email.trim());
  const canSubmit =
    firstName.trim().length > 0 && emailOk && status !== "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setStatus("error");
      setErrorMsg("Pop in your first name and a valid email so we can reply.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg(
        "Something went wrong sending that. Try again, or email us directly.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-grass/30 bg-grass-soft p-8 text-center">
        <div className="text-3xl" aria-hidden="true">
          🎉
        </div>
        <h2 className="mt-3 text-2xl font-extrabold">Got it, thanks!</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          We've got your message and we'll get back to you soon. In the meantime,
          keep an eye on your inbox this {SITE.publishDay}.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-line bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" required htmlFor="firstName">
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="ps-input"
            placeholder="Required"
          />
        </Field>
        <Field label="Email" required htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ps-input"
            placeholder="you@example.co.uk"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Phone" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="ps-input"
            placeholder="Optional"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field
          label="Message"
          htmlFor="message"
          hint={`${message.length}/${MESSAGE_MAX}`}
        >
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={MESSAGE_MAX}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="ps-input resize-y"
            placeholder="How can we help?"
          />
        </Field>
      </div>

      {status === "error" && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-coral/15 px-4 py-3 text-sm font-semibold text-ink"
        >
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-6 w-full rounded-xl bg-coral px-6 py-3.5 text-base font-bold text-ink transition-colors hover:bg-coral-dark disabled:cursor-not-allowed disabled:bg-grey"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>

      <p className="mt-4 text-center text-sm text-muted">
        Prefer email? Reach us at{" "}
        <a
          href={`mailto:${SITE.enquiryEmail}`}
          className="font-semibold text-brand hover:underline"
        >
          {SITE.enquiryEmail}
        </a>
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 flex items-center justify-between text-sm font-semibold"
      >
        <span>
          {label}
          {required && <span className="text-coral-dark"> *</span>}
        </span>
        {hint && <span className="font-medium text-muted">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
