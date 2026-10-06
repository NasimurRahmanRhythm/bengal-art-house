import type { Metadata } from "next";
import Link from "next/link";

import LegalPage, { LEGAL_EMAIL } from "@/components/sections/LegalPage";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: `The terms that govern use of the ${SITE.name} website and the purchase of artworks through it.`,
};

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Legal"
      title={
        <>
          Terms and <span className="em">Conditions.</span>
        </>
      }
      lede="The terms that govern your use of this website and any purchase of artworks made through it."
      updated="October 2026"
    >
      <h2>Overview</h2>
      <p>
        This website is operated by Gallery Hamiduzzaman. Throughout the site, the terms
        &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; refer to Gallery Hamiduzzaman.
        Gallery Hamiduzzaman offers this website, including all information, tools and services
        available from this site, to you, the user, conditioned upon your acceptance of all terms,
        conditions, policies and notices stated here.
      </p>
      <p>
        By visiting our site and/or purchasing something from us, you engage in our &ldquo;Terms and
        Conditions&rdquo; and agree to be bound by the following terms and conditions (&ldquo;Terms
        of Service&rdquo;, &ldquo;Terms&rdquo;), including any additional terms, conditions and
        policies referenced herein or available by hyperlink. These Terms apply to all users of the
        site, including without limitation browsers, vendors, customers, merchants and contributors
        of content.
      </p>
      <p>
        Please read these Terms carefully before accessing or using our website. By accessing or
        using any part of the site, you agree to be bound by these Terms. If you do not agree to all
        the terms and conditions of this agreement, you may not access the website or use any
        services. If these Terms are considered an offer, acceptance is expressly limited to these
        Terms.
      </p>
      <p>
        Any new features or tools added to the current store are also subject to these Terms. You
        can review the most current version at any time on this page. We reserve the right to
        update, change or replace any part of these Terms by posting updates or changes to our
        website. It is your responsibility to check this page periodically for changes. Your
        continued use of or access to the website after any changes are posted constitutes
        acceptance of those changes.
      </p>
      <p>
        Our store is hosted on a third-party e-commerce platform, which provides the online platform
        that allows us to sell our artworks and services to you.
      </p>

      <h2>Section 1 – Online Store Terms</h2>
      <p>
        By agreeing to these Terms, you represent that you are at least the age of majority in your
        state or province of residence, or that you are the age of majority there and have given us
        your consent to allow any of your minor dependents to use this site.
      </p>
      <p>
        You may not use our products (&ldquo;Artworks&rdquo;) for any illegal or unauthorized
        purpose, nor may you, in using the Service, violate any laws in your jurisdiction (including
        but not limited to copyright laws).
      </p>
      <p>You must not transmit any worms, viruses or code of a destructive nature.</p>
      <p>A breach or violation of any of the Terms will result in immediate termination of your Services.</p>

      <h2>Section 2 – General Conditions</h2>
      <p>We reserve the right to refuse service to anyone for any reason at any time.</p>
      <p>
        You understand that your content (not including credit card information) may be transferred
        unencrypted and involve (a) transmissions over various networks, and (b) changes to conform
        and adapt to the technical requirements of connecting networks or devices. Credit card
        information is always encrypted during transfer over networks.
      </p>
      <p>
        You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the
        Artworks, the use of the Service, or access to the Service or any contact on the website
        through which the Service is provided, without our express written permission.
      </p>
      <p>
        The headings used in this agreement are included for convenience only and will not limit or
        otherwise affect these Terms.
      </p>

      <h2>Section 3 – Accuracy, Completeness and Timeliness of Information</h2>
      <p>
        The material on this site is provided for general information only and should not be relied
        upon or used as the sole basis for making decisions without consulting primary, more
        accurate, more complete or more timely sources of information.
      </p>
      <p>
        This site may contain certain historical information, which is necessarily not current and
        is provided for your reference only. We reserve the right to modify the contents of this
        site at any time, but we have no obligation to update any information on it. You agree that
        it is your responsibility to monitor changes to our site.
      </p>

      <h2>Section 4 – Modifications to the Service and Prices</h2>
      <p>Prices for our Artworks are subject to change without notice.</p>
      <p>
        We reserve the right at any time to modify or discontinue any Artworks and Services (or any
        part or content thereof) without notice.
      </p>
      <p>
        We shall not be liable to you or to any third party for any modification, price change,
        suspension or discontinuance of the Artworks and Services.
      </p>

      <h2>Section 5 – Artworks or Services (if applicable)</h2>
      <p>
        Certain artworks or services may be available exclusively online through the website. These
        may have limited quantities and are subject to return or exchange only according to our{" "}
        <Link href="/refund-policy">Return Policy</Link>.
      </p>
      <p>
        We have made every effort to display the colors and images of our products as accurately as
        possible. We cannot guarantee that your computer or mobile screen will display any color
        accurately.
      </p>
      <p>
        We reserve the right, but are not obligated, to limit the sale of our artworks or Services
        to any person, geographic region or jurisdiction, on a case-by-case basis. We also reserve
        the right to limit the quantities of any artworks or services we offer. All descriptions and
        pricing of artworks are subject to change at any time without notice, at our sole
        discretion, and we may discontinue any artworks and services at any time. Any offer for any
        artworks or services made on this site is void where prohibited.
      </p>
      <p>
        We do not warrant that the quality of any artworks, services, information or other material
        purchased or obtained by you will meet your expectations, or that any errors in the Services
        will be corrected.
      </p>

      <h2>Section 6 – Accuracy of Billing and Account Information</h2>
      <p>
        We reserve the right to refuse any order you place with us. We may, in our sole discretion,
        limit or cancel quantities purchased per person, per household or per order. These
        restrictions may include orders placed by or under the same customer account, the same
        credit card, and/or orders that use the same billing and/or shipping address. If we change
        or cancel an order, we may attempt to notify you using the email, billing address or phone
        number provided when the order was made. We reserve the right to limit or prohibit orders
        that, in our sole judgment, appear to be placed by dealers, resellers or distributors.
      </p>
      <p>
        You agree to provide current, complete and accurate purchase and account information for all
        purchases made at our store. You agree to promptly update your account and other
        information, including your email address and credit card numbers and expiration dates, so
        that we can complete your transactions and contact you as needed.
      </p>
      <p>
        For more detail, please review our <Link href="/refund-policy">Returns Policy</Link>.
      </p>

      <h2>Section 7 – Optional Tools</h2>
      <p>
        We may provide you with access to third-party tools which we neither monitor nor control and
        over which we have no input.
      </p>
      <p>
        You acknowledge and agree that we provide access to such tools &ldquo;as is&rdquo; and
        &ldquo;as available&rdquo;, without any warranties, representations or conditions of any
        kind and without any endorsement. We shall have no liability whatsoever arising from or
        relating to your use of optional third-party tools.
      </p>
      <p>
        Any use by you of optional tools offered through the site is entirely at your own risk and
        discretion, and you should ensure that you are familiar with and approve of the terms on
        which the relevant third-party provider(s) supply them.
      </p>
      <p>
        We may also, in the future, offer new services and/or features through the website
        (including the release of new tools and resources). Such new features and services shall
        also be subject to these Terms.
      </p>

      <h2>Section 8 – Third-Party Links</h2>
      <p>
        Certain content, products and services available via our Service may include materials from
        third parties.
      </p>
      <p>
        Third-party links on this site may direct you to third-party websites that are not
        affiliated with us. We are not responsible for examining or evaluating their content or
        accuracy, and we do not warrant and will not have any liability or responsibility for any
        third-party materials or websites, or for any other materials, products or services of third
        parties.
      </p>
      <p>
        We are not liable for any harm or damages related to the purchase or use of goods, services,
        resources, content or any other transactions made in connection with any third-party
        websites. Please review the third party&apos;s policies and practices carefully and make
        sure you understand them before you engage in any transaction. Complaints, claims, concerns
        or questions regarding third-party products should be directed to the third party.
      </p>

      <h2>Section 9 – User Queries, Feedback and Other Submissions</h2>
      <p>
        If, at our request, you send certain specific submissions (for example service queries), or
        if without a request from us you send ideas, suggestions, proposals, plans or other
        materials, whether online, by email, by postal mail or otherwise (collectively,
        &ldquo;comments&rdquo;), you agree that we may, at any time and without restriction, edit,
        copy, publish, distribute, translate and otherwise use in any medium any comments that you
        forward to us. We are and shall be under no obligation (1) to maintain any comments in
        confidence, (2) to pay compensation for any comments, or (3) to respond to any comments.
      </p>
      <p>
        We may, but have no obligation to, monitor, edit or remove content that we determine in our
        sole discretion to be unlawful, offensive, threatening, libelous, defamatory, pornographic,
        obscene or otherwise objectionable, or that violates any party&apos;s intellectual property
        or these Terms.
      </p>
      <p>
        You agree that your queries will not violate any right of any third party, including
        copyright, trademark, privacy, personality or other personal or proprietary rights. You
        further agree that your queries will not contain libelous or otherwise unlawful, abusive or
        obscene material, or any computer virus or other malware that could affect the operation of
        the Service or any related website. You may not use a false email address, pretend to be
        someone other than yourself, or otherwise mislead us as to the origin of any queries. You
        are solely responsible for any queries you make and their accuracy. We take no
        responsibility and assume no liability for any queries posted by you or any third party.
      </p>

      <h2>Section 10 – Personal Information</h2>
      <p>
        Your submission of personal information through the store is governed by our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>

      <h2>Section 11 – Errors, Inaccuracies and Omissions</h2>
      <p>
        Occasionally there may be information on our site or in the Service that contains
        typographical errors, inaccuracies or omissions relating to product descriptions, pricing,
        promotions, offers, shipping charges, transit times and availability. We reserve the right
        to correct any errors, inaccuracies or omissions, and to change or update information or
        cancel orders if any information in the Service or on any related website is inaccurate, at
        any time and without prior notice (including after you have submitted your order).
      </p>
      <p>
        We undertake no obligation to update, amend or clarify information in the Service or on any
        related website, including without limitation pricing information, except as required by
        law. No specified update or refresh date applied in the Service or on any related website
        should be taken to indicate that all information has been modified or updated.
      </p>

      <h2>Section 12 – Prohibited Uses</h2>
      <p>
        In addition to other prohibitions set forth in these Terms, you are prohibited from using
        the site or its content:
      </p>
      <ol type="a">
        <li>for any unlawful purpose;</li>
        <li>to solicit others to perform or participate in any unlawful acts;</li>
        <li>
          to violate any international, national, provincial or state regulations, rules, laws or
          local ordinances;
        </li>
        <li>to infringe upon or violate our intellectual property rights or the intellectual property rights of others;</li>
        <li>
          to harass, abuse, insult, harm, defame, slander, disparage, intimidate or discriminate
          based on gender, sexual orientation, religion, ethnicity, race, age, national origin or
          disability;
        </li>
        <li>to submit false or misleading information;</li>
        <li>
          to upload or transmit viruses or any other type of malicious code that will or may be used
          in any way that will affect the functionality or operation of the Service or of any
          related website, other websites or the Internet;
        </li>
        <li>to collect or track the personal information of others;</li>
        <li>to spam, phish, pharm, pretext, spider, crawl or scrape;</li>
        <li>for any obscene or immoral purpose; or</li>
        <li>
          to interfere with or circumvent the security features of the Service or any related
          website, other websites or the Internet.
        </li>
      </ol>
      <p>
        We reserve the right to terminate your use of the Service or any related website for
        violating any of the prohibited uses.
      </p>

      <h2>Section 13 – Disclaimer of Warranties; Limitation of Liability</h2>
      <p>
        We do not guarantee, represent or warrant that your use of our service will be
        uninterrupted, timely, secure or error-free.
      </p>
      <p>
        We do not warrant that the results that may be obtained from the use of the service will be
        accurate or reliable.
      </p>
      <p>
        You agree that from time to time we may remove the service for indefinite periods of time or
        cancel the service at any time, without notice to you.
      </p>
      <p>
        You expressly agree that your use of, or inability to use, the service is at your sole risk.
        The service and all artworks and services delivered to you through the service are (except
        as expressly stated by us) provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; for
        your use, without any representation, warranties or conditions of any kind, either express
        or implied, including all implied warranties or conditions of merchantability, merchantable
        quality, fitness for a particular purpose, durability, title and non-infringement.
      </p>
      <p>
        In no case shall Gallery Hamiduzzaman, our directors, officers, employees, affiliates,
        agents, contractors, interns, suppliers (Artists), service providers or licensors be liable
        for any injury, loss, claim, or any direct, indirect, incidental, punitive, special or
        consequential damages of any kind, including, without limitation, lost profits, lost
        revenue, lost savings, loss of data, replacement costs or any similar damages, whether based
        in contract, tort (including negligence), strict liability or otherwise, arising from your
        use of the service or any artworks procured using the service, or for any other claim
        related in any way to your use of the service or any artworks, including, but not limited
        to, any errors or omissions in any content, or any loss or damage of any kind incurred as a
        result of the use of the service or any content (or artworks) posted, transmitted or
        otherwise made available via the service, even if advised of their possibility.
      </p>
      <p>
        Because some states or jurisdictions do not allow the exclusion or limitation of liability
        for consequential or incidental damages, in such states or jurisdictions our liability shall
        be limited to the maximum extent permitted by law.
      </p>

      <h2>Section 14 – Indemnification</h2>
      <p>
        You agree to indemnify, defend and hold harmless Gallery Hamiduzzaman and our parent,
        subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors,
        service providers, subcontractors, suppliers, interns and employees from any claim or
        demand, including reasonable attorneys&apos; fees, made by any third party due to or arising
        out of your breach of these Terms or the documents they incorporate by reference, or your
        violation of any law or the rights of a third party.
      </p>

      <h2>Section 15 – Severability</h2>
      <p>
        If any provision of these Terms is determined to be unlawful, void or unenforceable, that
        provision shall nonetheless be enforceable to the fullest extent permitted by applicable
        law, and the unenforceable portion shall be deemed severed from these Terms. Such
        determination shall not affect the validity and enforceability of any other remaining
        provisions.
      </p>

      <h2>Section 16 – Termination</h2>
      <p>
        The obligations and liabilities of the parties incurred prior to the termination date shall
        survive the termination of this agreement for all purposes.
      </p>
      <p>
        These Terms are effective unless and until terminated by either you or us. You may terminate
        these Terms at any time by notifying us that you no longer wish to use our Services, or when
        you cease using our site.
      </p>
      <p>
        If in our sole judgment you fail, or we suspect that you have failed, to comply with any
        term or provision of these Terms, we may also terminate this agreement at any time without
        notice, and you will remain liable for all amounts due up to and including the date of
        termination; and/or we may deny you access to our Services (or any part thereof).
      </p>

      <h2>Section 17 – Entire Agreement</h2>
      <p>
        Our failure to exercise or enforce any right or provision of these Terms shall not
        constitute a waiver of that right or provision.
      </p>
      <p>
        These Terms and any policies or operating rules posted by us on this site or in respect to
        the Service constitute the entire agreement and understanding between you and us and govern
        your use of the Service, superseding any prior or contemporaneous agreements, communications
        and proposals, whether oral or written, between you and us (including, but not limited to,
        any prior versions of the Terms).
      </p>
      <p>
        Any ambiguities in the interpretation of these Terms shall not be construed against the
        drafting party.
      </p>

      <h2>Section 18 – Governing Law</h2>
      <p>
        These Terms and any separate agreements whereby we provide you Services shall be governed by
        and construed in accordance with the laws of Bangladesh.
      </p>

      <h2>Section 19 – Changes to Terms of Service</h2>
      <p>You can review the most current version of the Terms at any time on this page.</p>
      <p>
        We reserve the right, at our sole discretion, to update, change or replace any part of these
        Terms by posting updates and changes to our website. It is your responsibility to check our
        website periodically for changes. Your continued use of or access to our website or the
        Service following the posting of any changes constitutes acceptance of those changes.
      </p>

      <h2>Section 20 – Purchase of Artworks</h2>
      <p>
        Your order represents an offer to us to purchase a Product, which is accepted by us once we
        have sent you an email order confirmation. Any Products on the same order that we have not
        confirmed in an order confirmation email do not form part of that contract.
      </p>
      <p>
        Gallery Hamiduzzaman shall under no circumstances be held liable for any special losses due
        to the specific circumstances of the User, Member and/or Customer, or for indirect or
        consequential losses or wasted expenditure.
      </p>
      <p>
        Orders are placed and received exclusively via the Site. Before ordering from us, it is the
        User&apos;s responsibility to check and determine their full ability to receive the
        Artworks. A correct delivery address and post code/zip code and an up-to-date email address
        are absolutely necessary to ensure successful delivery of Products. All information
        requested on the checkout page must be filled in precisely and accurately.
      </p>
      <p>
        Gallery Hamiduzzaman will not be responsible for missed delivery caused by a wrong delivery
        address. Should you wish to change the delivery address, or have any other special
        requirements, please contact Gallery Hamiduzzaman.
      </p>

      <h2>Section 21 – Delivery</h2>
      <p>
        We deliver to Customers in most places in the world. The User is responsible for delivery
        prices. Delivery prices are additional to the Product&apos;s price and may vary depending on
        delivery location and/or the type of Artworks, and additional charges may be added to the
        order for remote or difficult-to-access locations that require special attention. Standard
        delivery charges may be shown on our checkout page; however, we reserve the right to advise
        you of any additional delivery charges that apply to your specific delivery address.
      </p>
      <p>
        Some types of Artworks are packaged and shipped separately. We cannot guarantee delivery
        dates and accept no responsibility, apart from advising you of any known delay, for Products
        that are delivered after the estimated delivery date. Standard delivery times are shown on
        the Site. They are only an average estimate, and some deliveries can take longer or arrive
        much faster.
      </p>
      <p>
        All delivery estimates given at the time of placing and confirming an order are subject to
        change. In any case, we will do our best to contact you and advise you of all changes. We
        try our best to make delivery of Products as simple as possible.
      </p>
      <p>
        Ownership of the Products will pass to you/the Customer only when we receive full payment of
        all sums due in respect of the Artworks, including delivery charges.
      </p>

      <h2>Section 22 – Shipping and Returns</h2>
      <p>
        Once you have clicked the &ldquo;confirm&rdquo; button, it is not possible to edit or cancel
        your order. If you want to change any details, such as the Customer&apos;s address, please
        contact us as soon as possible. We are not bound to make such modifications to your order,
        but we will do our best on a case-by-case basis.
      </p>
      <p>
        Replacement of Artworks claimed as damaged or not received is subject to Gallery
        Hamiduzzaman&apos;s investigation and discretion. The risk of loss and title for such items
        pass to the User upon our delivery to the carrier. It is the Customer&apos;s responsibility
        to file any claim with a carrier for a lost shipment if carrier tracking indicates that the
        Product was delivered. In such a case, Gallery Hamiduzzaman will not make any refunds and
        will not resend the Product.
      </p>
      <p>
        Gallery Hamiduzzaman will review replacement/return requests only if (a) there is a missing
        or broken Artwork, or a print error for which Gallery Hamiduzzaman is at fault, and (b)
        Gallery Hamiduzzaman receives a complaint within 7 days of the day the Artwork was
        delivered, or within 7 days after the estimated delivery date if the Artwork is missing.
      </p>
      <p>
        Gallery Hamiduzzaman is not responsible for incorrectly provided Customer names, addresses
        and similar details; therefore, extra payment will be applied.
      </p>

      <h2>Section 23 – Contact Information</h2>
      <p>
        Questions about the Terms and Conditions should be sent to us at{" "}
        <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
