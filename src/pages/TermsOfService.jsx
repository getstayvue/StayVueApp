import { ArrowLeft } from 'lucide-react';
import StayVueLogo from '../components/StayVueLogo';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' };

export default function TermsOfService({ onBack }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          {onBack ? (
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
          ) : <div />}
          <StayVueLogo size={28} />
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-10" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.75, color: '#2C2C2A' }}>
        <h1 className="text-3xl font-extrabold mb-1" style={headingFont}>Terms of Service</h1>
        <p className="text-stone-400 text-sm mb-10">Effective Date: June 1, 2026 · Last Updated: June 1, 2026</p>

        <p className="mb-6">
          Welcome to StayVue ("we," "us," or "our"). These Terms of Service ("Terms") govern your access to and use of the StayVue application, 
          website, cloud services, and all related services (collectively, the "Service"). By creating an account, purchasing a license, or using 
          the Service in any way, you agree to be bound by these Terms. If you do not agree, do not use the Service.
        </p>

        <Section n="1" title="Acceptance of Terms">
          <p>
            By accessing or using the Service, you confirm that you have read, understood, and agree to these Terms and our Privacy Policy. 
            We reserve the right to modify these Terms at any time. We will notify registered users of material changes via email or in-app 
            notification at least thirty (30) days before changes take effect. Continued use after the effective date constitutes acceptance 
            of the revised Terms.
          </p>
        </Section>

        <Section n="2" title="Description of Service">
          <p>
            StayVue is a property management software application designed for short-term rental hosts managing properties listed on platforms 
            such as Airbnb, VRBO, and Booking.com. The Service provides tools for booking management, expense and receipt tracking, guest CRM 
            and email campaigns, maintenance and cleaning task management, tax reporting, vendor coordination, team access controls, calendar 
            synchronization via iCal feeds, and cloud-based data backup and synchronization.
          </p>
          <p>
            The Service is offered on a one-time license purchase model. Optional cloud storage, backup, and synchronization services 
            ("Cloud Services") are available either included with your license tier or as paid monthly add-ons.
          </p>
        </Section>

        <Section n="3" title="Eligibility and Account Registration">
          <p>
            You must be at least 18 years of age to use the Service. By registering, you represent and warrant that you meet this requirement 
            and that all information you provide is accurate, complete, and current. You are responsible for maintaining the confidentiality 
            of your login credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorized 
            access or security breach.
          </p>
        </Section>

        <Section n="4" title="License, Pricing, and Tiers">
          <p>
            StayVue offers one-time license purchases across three tiers (Starter, Professional, and Portfolio), each providing perpetual 
            access to the core application features included in that tier. Your license is non-transferable and granted solely to the 
            registered account holder for personal or commercial property management use.
          </p>
          <p>
            Each tier includes limits on the number of properties, team members, and cloud storage capacity. Additional properties and 
            team member seats may be purchased as one-time add-ons. License pricing at the time of your purchase is final and will not 
            retroactively change for your account. However, we reserve the right to adjust pricing for new purchases, upgrades, and 
            add-ons at any time without prior notice.
          </p>
        </Section>

        <Section n="5" title="Cloud Services, Storage Fees, and Service Discontinuation">
          <Sub title="5.1 Cloud Services Overview">
            <p>
              StayVue offers optional Cloud Services including cloud backup, data synchronization across devices, and file storage 
              (for receipts, property photos, documents, and other uploads). Cloud Services may be included in your license tier 
              or available as a paid monthly subscription add-on based on storage usage.
            </p>
          </Sub>

          <Sub title="5.2 Right to Adjust Cloud Storage Pricing">
            <p>
              <strong>StayVue reserves the right to adjust the pricing of monthly Cloud Services, including per-gigabyte storage fees, 
              at any time and at its sole discretion.</strong> We will provide affected users with at least thirty (30) days' written 
              notice via email before any pricing change takes effect. Your continued use of Cloud Services after the effective date 
              of a price change constitutes acceptance of the new pricing. If you do not agree to a price change, you may cancel your 
              Cloud Services subscription before the new pricing takes effect without penalty.
            </p>
          </Sub>

          <Sub title="5.3 Right to Discontinue Cloud Services (Sunsetting)">
            <p>
              <strong>StayVue reserves the right to discontinue, suspend, or permanently shut down ("sunset") any or all Cloud Services 
              at its sole discretion, for any reason, including but not limited to changes in business operations, infrastructure costs, 
              or strategic direction.</strong>
            </p>
            <p>In the event that Cloud Services are discontinued:</p>
            <ul className="list-disc pl-6 my-3 space-y-2 text-[15px]">
              <li>
                StayVue will provide all affected users with at least <strong>thirty (30) days' prior written notice</strong> via email 
                and in-app notification before Cloud Services are terminated.
              </li>
              <li>
                During the 30-day notice period, users will retain full access to all of their cloud-stored data and will be able to 
                <strong> export and download all data locally</strong> using the built-in export and backup tools provided within the application.
              </li>
              <li>
                StayVue will make commercially reasonable efforts to assist users in migrating their data during the notice period, 
                including providing export documentation, step-by-step instructions, and responsive customer support.
              </li>
              <li>
                Upon expiration of the 30-day notice period, <strong>StayVue will permanently and irreversibly delete all user data 
                stored on its cloud infrastructure.</strong> StayVue shall have no obligation to retain, recover, or provide access 
                to any data after this date.
              </li>
              <li>
                Any prepaid Cloud Services fees for the period following the discontinuation date will be refunded on a pro-rata basis.
              </li>
              <li>
                The core StayVue application (installed locally or self-hosted) will continue to function independently of Cloud Services. 
                Your one-time license to use the application software remains valid and unaffected by any Cloud Service discontinuation.
              </li>
            </ul>
          </Sub>

          <Sub title="5.4 User Responsibility for Data Backups">
            <p>
              While StayVue takes reasonable measures to protect data stored via Cloud Services, <strong>users are solely responsible 
              for maintaining their own local backups of all data.</strong> StayVue is not liable for any data loss, corruption, or 
              unavailability arising from service interruptions, infrastructure failures, security incidents, or service discontinuation, 
              provided that StayVue has complied with the notice requirements outlined in Section 5.3. We strongly recommend maintaining 
              regular local backups of all critical business data using the application's built-in export tools.
            </p>
          </Sub>
        </Section>

        <Section n="6" title="Free Trial">
          <p>
            StayVue offers a three (3) day free trial providing full access to all application features without requiring payment 
            information. At the end of the trial period, continued access requires the purchase of a license. We reserve the right 
            to modify the duration, availability, or scope of the free trial at any time. Trial accounts that do not convert to paid 
            licenses may have their data deleted after ninety (90) days of inactivity.
          </p>
        </Section>

        <Section n="7" title="Acceptable Use">
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-6 my-3 space-y-1.5 text-[15px]">
            <li>Violate any applicable local, national, or international law or regulation.</li>
            <li>Upload, transmit, or store any content that is unlawful, harmful, threatening, abusive, defamatory, or otherwise objectionable.</li>
            <li>Attempt to gain unauthorized access to any part of the Service, other user accounts, or connected systems and networks.</li>
            <li>Reverse engineer, decompile, disassemble, or attempt to extract the source code of the Service.</li>
            <li>Use the Service to send unsolicited marketing communications ("spam") to guests or contacts who have not opted in.</li>
            <li>Use the Service in any manner that could disable, overburden, damage, or impair the Service or interfere with others' use.</li>
            <li>Use automated scripts, bots, or scrapers to access the Service without written permission.</li>
            <li>Resell, sublicense, redistribute, or commercially exploit the Service without our prior written consent.</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate these provisions, with or without notice, depending 
            on the severity of the violation.
          </p>
        </Section>

        <Section n="8" title="Intellectual Property">
          <p>
            All intellectual property rights in the Service — including the software, source code, design, user interface, logos, 
            trademarks, documentation, and all related content — are owned by StayVue or its licensors. Your license grants you 
            no ownership of or rights in StayVue's intellectual property beyond the limited usage license described in these Terms.
          </p>
          <p>
            You retain full ownership of all data, content, files, and materials you upload, enter, or create within the Service 
            ("User Content"). By using the Service, you grant StayVue a limited, non-exclusive, royalty-free license to process, 
            store, display, and transmit your User Content solely for the purpose of providing, maintaining, and improving the Service. 
            This license terminates when your User Content is deleted from the Service.
          </p>
        </Section>

        <Section n="9" title="Privacy and Data Protection">
          <p>
            Your use of the Service is governed by our Privacy Policy, which describes how we collect, use, store, and protect your 
            personal information and User Content. By using the Service, you consent to the practices described therein.
          </p>
          <p>
            StayVue will not sell, rent, or share your personal data or User Content with third parties for their marketing purposes. 
            We may share limited data with service providers (such as payment processors and hosting providers) solely to operate and 
            deliver the Service, subject to appropriate data protection agreements.
          </p>
          <p>
            If you use the Service to manage guest data, you are responsible for complying with all applicable data protection laws 
            (including GDPR, CCPA, and similar regulations) with respect to the personal data of your guests and contacts.
          </p>
        </Section>

        <Section n="10" title="Payments, Refunds, and Billing">
          <p>
            All payments are processed securely through Stripe, Inc. By making a purchase, you agree to Stripe's terms of service 
            in addition to these Terms. StayVue does not store your payment card information.
          </p>
          <p>
            <strong>One-time license purchases:</strong> License fees are final. Refund requests may be considered on a case-by-case 
            basis within fourteen (14) days of purchase, provided you have not substantially used the Service. "Substantial use" 
            includes, but is not limited to, creating more than one property, entering booking or expense data, or inviting team members.
          </p>
          <p>
            <strong>Cloud Services subscriptions:</strong> Monthly subscription payments are non-refundable for the current billing 
            period. You may cancel at any time to prevent future charges. Cancellation takes effect at the end of the current billing cycle.
          </p>
          <p>
            <strong>Add-on purchases:</strong> One-time add-on purchases (additional properties, team seats) are non-refundable.
          </p>
        </Section>

        <Section n="11" title="Service Availability and Modifications">
          <p>
            We strive to maintain high availability of the Service but do not guarantee uninterrupted or error-free operation. 
            The Service may be temporarily unavailable due to scheduled maintenance, updates, or circumstances beyond our control.
          </p>
          <p>
            We reserve the right to modify, update, or discontinue features of the Service at any time. We will make reasonable 
            efforts to notify users of significant changes that affect core functionality.
          </p>
        </Section>

        <Section n="12" title="Disclaimers">
          <p className="uppercase text-sm tracking-wide">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING 
            BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY.
          </p>
          <p>
            StayVue does not warrant that the Service will meet your specific requirements, that results obtained will be accurate 
            or reliable, or that the Service will be free of viruses, errors, or harmful components. StayVue is not a financial, 
            tax, or legal advisor. Any tax calculations, reports, or summaries generated by the Service are for informational 
            purposes only and should not be relied upon as professional tax, accounting, or legal advice. You are solely responsible 
            for verifying all financial data and consulting qualified professionals.
          </p>
        </Section>

        <Section n="13" title="Limitation of Liability">
          <p className="uppercase text-sm tracking-wide">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, STAYVUE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
            CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUE, DATA, BUSINESS OPPORTUNITIES, 
            GOODWILL, OR ANTICIPATED SAVINGS, WHETHER DIRECT OR INDIRECT, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO 
            USE THE SERVICE, EVEN IF STAYVUE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p className="uppercase text-sm tracking-wide">
            STAYVUE'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER 
            OF (A) THE TOTAL AMOUNT YOU PAID TO STAYVUE IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR 
            (B) ONE HUNDRED DOLLARS ($100 USD).
          </p>
        </Section>

        <Section n="14" title="Indemnification">
          <p>
            You agree to indemnify, defend, and hold harmless StayVue and its officers, directors, employees, contractors, and agents 
            from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) 
            arising out of or in any way connected with: (a) your access to or use of the Service; (b) your violation of these Terms; 
            (c) your violation of any applicable law or regulation; (d) your infringement of any third-party rights; or (e) any User 
            Content you submit to the Service.
          </p>
        </Section>

        <Section n="15" title="Termination">
          <p>
            <strong>By you:</strong> You may stop using the Service and delete your account at any time. Upon deletion, your locally 
            stored data remains on your device; cloud-stored data will be deleted within thirty (30) days.
          </p>
          <p>
            <strong>By us:</strong> We may suspend or terminate your access if you violate these Terms, engage in fraudulent activity, 
            or engage in conduct that we determine, in our sole discretion, to be harmful to the Service, other users, or our business. 
            We will make reasonable efforts to provide notice before termination unless the violation requires immediate action.
          </p>
          <p>
            <strong>Effect of termination:</strong> Upon termination, your right to use the Service ceases immediately. You will have 
            thirty (30) days from the date of termination notice to export your data using the built-in tools. After this period, we 
            may permanently delete all of your data. Sections of these Terms that by their nature should survive termination — including 
            intellectual property, disclaimers, limitation of liability, indemnification, and governing law — shall survive.
          </p>
        </Section>

        <Section n="16" title="Governing Law and Dispute Resolution">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Province of Quebec, Canada, without regard 
            to its conflict of law provisions.
          </p>
          <p>
            Any dispute arising out of or relating to these Terms or the Service shall first be attempted to be resolved through 
            good-faith negotiation. If the dispute cannot be resolved within thirty (30) days, either party may pursue binding 
            arbitration or file a claim in the courts of competent jurisdiction in Quebec, Canada.
          </p>
        </Section>

        <Section n="17" title="General Provisions">
          <p>
            <strong>Entire Agreement.</strong> These Terms, together with the Privacy Policy, constitute the entire agreement between 
            you and StayVue regarding the Service and supersede all prior agreements and understandings.
          </p>
          <p>
            <strong>Severability.</strong> If any provision of these Terms is found to be unenforceable or invalid, that provision 
            shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force.
          </p>
          <p>
            <strong>No Waiver.</strong> Our failure to enforce any right or provision of these Terms shall not constitute a waiver 
            of such right or provision.
          </p>
          <p>
            <strong>Assignment.</strong> You may not assign or transfer your rights under these Terms without our prior written 
            consent. We may assign our rights and obligations without restriction.
          </p>
          <p>
            <strong>Force Majeure.</strong> StayVue shall not be liable for any delay or failure to perform resulting from causes 
            beyond our reasonable control, including natural disasters, war, terrorism, pandemics, labor disputes, government actions, 
            internet disruptions, or infrastructure failures.
          </p>
        </Section>

        <Section n="18" title="Contact Information">
          <p>If you have questions about these Terms, please contact us:</p>
          <div className="bg-stone-50 rounded-xl p-4 mt-3 text-sm">
            <p className="font-semibold" style={headingFont}>StayVue</p>
            <p className="text-stone-500">Email: support@stayvue.app</p>
            <p className="text-stone-500">Website: stayvue.app</p>
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-stone-100 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} StayVue Inc. All rights reserved.</p>
        </div>
      </article>
    </div>
  );
}

function Section({ n, title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>
        {n}. {title}
      </h2>
      <div className="space-y-3 text-[15px] text-stone-700">{children}</div>
    </section>
  );
}

function Sub({ title, children }) {
  return (
    <div className="mt-4 mb-4 pl-1">
      <h3 className="text-base font-semibold mb-2 text-stone-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
