import type { Metadata } from "next";

import LegalPage, { LEGAL_EMAIL } from "@/components/sections/LegalPage";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Return Policy",
  description: `How to return an artwork bought from ${SITE.name}, and how refunds are made.`,
};

export default function RefundPolicyPage() {
  const email = <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>;
  const phone = <a href={`tel:${SITE.phoneHref}`}>{SITE.phone}</a>;

  return (
    <LegalPage
      kicker="Legal"
      title={
        <>
          Return <span className="em">Policy.</span>
        </>
      }
      lede="We want you to have a great experience browsing and buying artworks. If something isn't right, here is how to return a work and get your money back."
      updated="October 2026"
    >
      <p>
        We are here to make sure you have a great experience browsing and buying artworks. Your
        feedback and questions are extremely valuable to us and we love to hear from you.
      </p>
      <p>Email: {email}</p>

      <h2>Returns and Refunds</h2>
      <p>
        You may cancel or amend your order within 24 hours of physically receiving the artwork. We
        are committed to you and want you to be happy. Just return the artwork to us undamaged
        within 7 days if you are residing in Bangladesh, or within 20 days if you are an
        international buyer. We will refund you within 10 working days after we receive the
        artwork.
      </p>
      <p>
        You may return the artwork and receive a refund of its price after deduction of customs
        duties (applicable for overseas orders) and other related costs (not more than 5% of the
        total amount). Shipping charges will not be refunded, and return shipping costs are the
        responsibility of the customer.
      </p>

      <h2>How to Return an Artwork</h2>
      <p>If you do decide to return your artwork, please follow these instructions:</p>
      <ol>
        <li>
          Email {email} with a copy of your invoice and money receipt, and the specific reason for
          the return.
        </li>
        <li>
          <p>
            A {SITE.name} representative will get back to you with the reference invoice number
            and brief you on the return procedure.
          </p>
          <p>
            Generally, you will need to pack the artwork back in its original packaging, together
            with the invoice and money receipt, all of the packaging materials and the certificate
            of authenticity that came with it. No return will be accepted without the proper
            paperwork, and works must be returned in perfect condition in their original packaging
            to qualify.
          </p>
          <p>Then ship it back to us at:</p>
          <p>
            {SITE.name}
            <br />
            {SITE.address}, Bangladesh
            <br />
            Phone: {phone}
          </p>
        </li>
        <li>
          No return will be accepted more than 30 days after delivery, or without the proper
          paperwork. Any damage that occurs while the artwork is in the customer&apos;s hands is not
          covered by this return policy.
        </li>
      </ol>

      <h2>Works from Our Partners and Third Parties</h2>
      <p>
        Unless noted otherwise, all partner and third-party works and services are final sale and
        non-refundable. Where such works are refundable, they are subject to the partner&apos;s or
        third party&apos;s own conditions.
      </p>

      <h2>Damaged Artworks</h2>
      <p>
        In the unfortunate event that your order arrives in less than satisfactory condition, simply
        take one photo of the artwork and one of the packaging it arrived in, attach both to an
        email and send it to {email}. A {SITE.name} representative will get back to you within 2
        working days on how to proceed with your order.
      </p>

      <h2>Contact Us</h2>
      <p>
        For any other issues, please contact us at {email} or call {phone}.
      </p>
    </LegalPage>
  );
}
