import type { Metadata } from "next";
import { ResultPage } from "@/components/ResultPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Booking confirmed",
  robots: { index: false },
};

export default function SponsorSuccessPage() {
  return (
    <ResultPage
      emoji="🎉"
      title="You're booked in!"
      body={`Thanks for sponsoring the Scoop. Your receipt is on its way from Stripe, and we'll be in touch before your first ${SITE.publishDay} issue. Need anything? Email ${SITE.enquiryEmail}.`}
      primary={{ label: "Back to home", href: "/" }}
    />
  );
}
