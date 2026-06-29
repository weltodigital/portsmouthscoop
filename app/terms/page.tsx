import type { Metadata } from "next";
import { LEGAL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms for using Portsmouth Scoop and for booking sponsorships and event listings.",
};

export default function TermsPage() {
  return (
    <article className="legal mx-auto max-w-3xl px-5 py-16 md:py-20">
      <h1 className="text-4xl font-extrabold tracking-tight">
        Terms &amp; Conditions
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated: {LEGAL.lastUpdated}</p>

      <p>
        These terms govern your use of {LEGAL.brand}, operated by{" "}
        {LEGAL.controller} (&ldquo;we&rdquo;, &ldquo;us&rdquo;), and any
        sponsorship or event listing you book through this website. By placing a
        booking you agree to these terms.
      </p>

      <h2>The service</h2>
      <p>
        {LEGAL.brand} is a free weekly email newsletter for Portsmouth. We offer
        paid sponsorship placements and paid event listings within the
        newsletter, which is published each Friday.
      </p>

      <h2>Bookings and payment</h2>
      <ul>
        <li>
          Prices are shown on the relevant page at the time of booking and are in
          pounds sterling (GBP).
        </li>
        <li>
          Payment is taken securely via <strong>Stripe</strong>. Your booking is
          confirmed once payment has completed successfully.
        </li>
        <li>
          A sponsorship slot for a given Friday and placement can only be held by
          one booking. Slots are allocated on a first-paid basis.
        </li>
        <li>
          You are responsible for providing accurate booking details and creative
          content by any deadline we communicate (creative can normally be
          changed up to 48 hours before an issue is sent).
        </li>
      </ul>

      <h2>Your content</h2>
      <ul>
        <li>
          You confirm you own or have the right to use all content you submit
          (text, links, and images), and that it does not infringe anyone
          else&rsquo;s rights.
        </li>
        <li>
          Content must be lawful, accurate, and not offensive, misleading, or
          inappropriate. We may reject or remove any content at our discretion.
        </li>
        <li>
          You grant us the licence needed to display your content within the
          newsletter and related promotion.
        </li>
      </ul>

      <h2>Cancellations and refunds</h2>
      <p>
        If you need to cancel or change a booking, contact us at{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> as soon
        as possible. Where a placement or event listing has not yet been published
        and is cancelled at least 48 hours before the scheduled send, we will
        offer a refund or credit. Once an issue containing your placement has been
        sent, the booking is non-refundable. This does not affect your statutory
        rights.
      </p>
      <p className="text-sm text-muted">
        [Review this refund policy and adjust it to match how you want to run
        cancellations before launch.]
      </p>

      <h2>Results</h2>
      <p>
        We share audience figures in good faith but cannot guarantee any specific
        number of opens, clicks, sales, or other outcomes from a placement or
        listing.
      </p>

      <h2>Liability</h2>
      <p>
        To the fullest extent permitted by law, our total liability arising from a
        booking is limited to the amount you paid for that booking. We are not
        liable for indirect or consequential losses. Nothing in these terms
        excludes liability that cannot be excluded by law.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of {LEGAL.governingLaw}, and any
        disputes are subject to the exclusive jurisdiction of its courts.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </article>
  );
}
