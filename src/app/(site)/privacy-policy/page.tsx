import type { Metadata } from "next";

import LegalPage, { LEGAL_EMAIL } from "@/components/sections/LegalPage";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} collects, uses and shares your personal information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      kicker="Legal"
      title={
        <>
          Privacy <span className="em">Policy.</span>
        </>
      }
      lede="How your personal information is collected, used and shared when you visit or buy from the gallery's website."
      updated="October 2026"
    >
      <p>
        This Privacy Policy describes how your personal information is collected, used, and shared
        when you visit or make a purchase from{" "}
        <a href="https://www.galleryhamiduzzaman.com/">https://www.galleryhamiduzzaman.com/</a>{" "}
        operated by Gallery Hamiduzzaman.
      </p>

      <h2>Protecting Your Privacy</h2>
      <p>
        At Gallery Hamiduzzaman, we are committed to protecting the privacy and security of our
        customers and site visitors.
      </p>

      <h2>Personal Information We Collect</h2>
      <p>
        When you make or attempt to make a purchase through the Site, we also collect certain
        information from you, including your name, billing address, shipping address, payment
        information (including credit card numbers), email address, and phone number. We refer to
        this as &ldquo;Order Information&rdquo;.
      </p>
      <p>
        When we talk about &ldquo;Personal Information&rdquo; in this Privacy Policy, we mean both
        Device Information and Order Information.
      </p>

      <h2>How We Use Your Personal Information</h2>
      <p>
        We use the Order Information we collect to fulfill orders placed through the Site, including
        processing your payment, arranging shipping, and providing invoices and order
        confirmations. We also use Order Information to:
      </p>
      <ul>
        <li>Communicate with you</li>
        <li>Screen our orders for potential risk or fraud</li>
        <li>
          Provide you with information or advertising about our artworks, products, or services,
          when this is in line with the preferences you have shared with us
        </li>
      </ul>
      <p>
        We use Device Information to help screen for potential risk and fraud (in particular, your
        IP address) and, more generally, to improve and optimize the Site, for example by generating
        analytics about how customers browse and interact with it and by assessing the success of
        our marketing and advertising campaigns.
      </p>

      <h2>About Sharing Your Personal Information</h2>
      <p>
        We share your Personal Information with third parties to help us use it as described above.
        For example, we use SSLCommerz to process payments for our online store; you can read more
        about how they use your Personal Information on the{" "}
        <a href="https://www.sslcommerz.com/" target="_blank" rel="noopener noreferrer">
          SSLCommerz website
        </a>
        . We also use Google Analytics to understand how our customers use the Site.
      </p>
      <p>
        We may also share your Personal Information to comply with applicable laws and regulations,
        to respond to a subpoena, search warrant, or other lawful request for information, or to
        otherwise protect our rights.
      </p>

      <h2>Marketing &amp; Advertisement</h2>
      <p>
        As described above, we use your Personal Information to provide you with targeted
        advertisements or marketing communications we believe may be of interest to you.
      </p>

      <h2>Our Response to &ldquo;Do Not Track&rdquo;</h2>
      <p>
        We do not alter the Site&apos;s data collection and use practices when we see a Do Not Track
        signal from your browser, and we will not disable tracking technology that may be active in
        response to such requests. You can, however, change your privacy preferences regarding
        cookies and similar technologies through your browser.
      </p>

      <h2>Your Rights</h2>
      <p>
        You have the right to access the Personal Information we hold about you and to ask that it
        be corrected, updated, or deleted. To exercise this right, please contact us using the
        details below.
      </p>
      <p>
        Please note that we process your information in order to fulfill contracts we may have with
        you (for example, if you place an order through the Site) or otherwise to pursue our
        legitimate business interests described above.
      </p>

      <h2>Data Retention</h2>
      <p>
        When you place an order through the Site, we will keep your Order Information for our
        records unless and until you ask us to delete it.
      </p>

      <h2>Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect, for example, changes to our
        practices or for operational, legal, or regulatory reasons.
      </p>

      <h2>Contact Us</h2>
      <p>
        For more information about our privacy practices, if you have questions, or if you would
        like to make a complaint, please contact us by email at{" "}
        <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> or at {SITE.name}, {SITE.address}.
      </p>
    </LegalPage>
  );
}
