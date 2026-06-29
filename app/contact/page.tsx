import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Portsmouth Scoop: questions, tips, or sponsor enquiries.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-16 md:py-20">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Say hello
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-ink-soft">
          Got a tip, a question, or want to sponsor an issue? Drop us a line and
          a real human will get back to you.
        </p>
      </div>

      <div className="mt-10">
        <ContactForm />
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Want to advertise to {SITE.publishDay}'s readers? Head to the{" "}
        <a href="/sponsor" className="font-semibold text-brand hover:underline">
          Sponsor page
        </a>{" "}
        to book online.
      </p>
    </section>
  );
}
