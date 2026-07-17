import type { Metadata } from "next";
import LegalPage, { Section, SubHeading, List } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Multiply OS",
  description:
    "How Multiply OS collects, uses, discloses, and safeguards your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Multiply OS Privacy Policy" lastUpdated="July 17, 2026">
      <Section heading="1. Introduction">
        <p>
          Multiply OS LLC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo;
          &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the Multiply OS
          platform (&ldquo;Service&rdquo;). This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you use our
          Service. Please read this policy carefully. By using the Service, you
          consent to the practices described herein.
        </p>
      </Section>

      <Section heading="2. Information We Collect">
        <SubHeading>2.1 Information You Provide</SubHeading>
        <List
          items={[
            "Account information: Name, email address, password, company name, and profile picture when you register or update your profile.",
            "Business data: Scoreboard metrics, KPI entries, goals, team member information, meeting notes, and other business content you input into the Service.",
            "Communication data: Any messages or feedback you send to us directly.",
          ]}
        />
        <SubHeading>2.2 Information from Third-Party Services</SubHeading>
        <p>
          When you connect third-party services (such as Intuit QuickBooks
          Online, Plaid), we collect financial data from those services on your
          behalf, including but not limited to:
        </p>
        <List
          items={[
            "Chart of accounts and account balances",
            "Profit & Loss reports",
            "Balance Sheet reports",
            "Company financial metadata",
            "Banking transaction metadata",
            "Banking account balance metadata",
          ]}
        />
        <p>
          We access this data only after you explicitly authorize the connection
          through the third-party service&rsquo;s OAuth process. You can revoke
          this access at any time.
        </p>
        <SubHeading>2.3 Automatically Collected Information</SubHeading>
        <List
          items={[
            "Usage data: Login timestamps, pages visited, referring URL, and features used within the Service.",
            "Device data: Browser type, operating system, device type, and IP address for security and analytics purposes, unique identifiers and other identifying information.",
          ]}
        />
        <SubHeading>2.4 Information We Do Not Collect</SubHeading>
        <p>
          We do not knowingly collect sensitive personal data as defined by the
          Texas Data Privacy and Security Act (TDPSA), including (i) data
          revealing racial or ethnic origin, religious beliefs, mental or physical
          health diagnosis, sexuality, or citizenship or immigration status, (ii)
          genetic or biometric data, (iii) data collected from a known child
          (under the age of 13), or (iv) precise geolocation data (within a
          1,750-foot radius) through the Service.
        </p>
      </Section>

      <Section heading="3. How We Use Your Information">
        <p>We use your information to:</p>
        <List
          items={[
            "Provide, maintain, and improve the Service",
            "Authenticate your identity and manage your account",
            "Display your business data, metrics, and financial information within the Service",
            "Generate AI-powered insights and recommendations based on your business data",
            "Communicate with you about the Service, including updates and support",
            "Detect, prevent, and address technical issues and security threats",
            "Comply with legal obligations and enforce our rights",
          ]}
        />
      </Section>

      <Section heading="4. How We Share Your Information">
        <p>
          We do not sell your personal information. We may share your information
          only in the following circumstances:
        </p>
        <List
          items={[
            "Service providers: With trusted third-party vendors who help us operate the Service (e.g., cloud hosting, database services), subject to confidentiality obligations.",
            "AI processing: Your business data may be sent to AI language model providers to generate insights. This data is used solely for processing your request and is not retained by the AI provider for training purposes.",
            "Legal requirements: If required by law, regulation, or legal process, or to protect the rights, property, or safety of our company, users, or others.",
            "Business transfers: In connection with a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.",
          ]}
        />
      </Section>

      <Section heading="5. Third-Party Integrations">
        <p>
          The Service allows you to connect third-party accounts such as Intuit
          QuickBooks Online or your bank utilizing Plaid. When you connect a
          third-party service:
        </p>
        <List
          items={[
            "We access only the data necessary to provide the features you use.",
            "We store OAuth tokens securely (AES-256-GCM at rest) and use them only to fetch data on your behalf.",
            "You can disconnect the integration at any time from the Settings page, which stops further data access.",
            "You can permanently delete every record we hold for an integration via the “Delete all data” control on the Addons page; this revokes our token with the provider and erases synced reports, accounts, and metric mappings for your company.",
          ]}
        />
        <SubHeading>
          5.1 Intuit QuickBooks Online &mdash; specific disclosures
        </SubHeading>
        <p>For QuickBooks Online specifically:</p>
        <List
          items={[
            "Data categories synced: Chart of Accounts (names, types, balances), Profit & Loss reports, and Balance Sheet reports — the most recent six months, at monthly granularity. We do not sync individual customer or transaction records.",
            "Retention: We keep the last six months of monthly reports plus a snapshot of your Chart of Accounts. Older reports are removed automatically on each sync. All QuickBooks data is deleted within 24 hours of disconnecting via “Delete all data,” or within 90 days of account closure.",
            "AI processor: When you use AI financial insights, the synced financial data is sent to Anthropic (model: claude-sonnet-4-6) under a no-training agreement. Anthropic does not retain your data for model training and does not share it with third parties.",
            "Independent controller: For data we collect from QuickBooks on your behalf, Multiply OS is an independent controller, not Intuit’s processor. We determine the purposes and means of processing in accordance with this Privacy Policy.",
            "Not a consumer report: We do not use QuickBooks data as a “consumer report,” and Multiply OS is not a “consumer reporting agency” or “furnisher” under the U.S. Fair Credit Reporting Act (15 U.S.C. § 1681 et seq.).",
          ]}
        />
        <p>
          Third-party services have their own privacy policies. We encourage you
          to review Intuit&rsquo;s privacy policy at{" "}
          <a
            href="https://www.intuit.com/privacy/statement/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-orange hover:underline"
          >
            intuit.com/privacy/statement
          </a>
          .
        </p>
        <SubHeading>5.2 Plaid &mdash; specific disclosures</SubHeading>
        <p>
          For Plaid specifically: The data collected, used, and shared depends on
          the Plaid products and services that you, and/or the app you have
          connected to, use. This information may include, for example, your:
        </p>
        <List
          items={[
            "Account holder information: name, address, phone number, and email address, as held by your bank or other financial institution;",
            "Account transactions: amount, date, type, and a description of the transaction; and",
            "Account details: account name, account type, account and routing numbers, and balance.",
          ]}
        />
        <p>
          By creating a Plaid Portal account, you can see the types of data that
          Plaid has shared with your connected apps.
        </p>
        <p>
          Third-party services have their own privacy policies. We encourage you
          to review how Plaid handles data and Plaid&rsquo;s{" "}
          <a
            href="https://plaid.com/legal/#end-user-privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-orange hover:underline"
          >
            End User Privacy Policy here
          </a>
          .
        </p>
      </Section>

      <Section heading="6. Data Security">
        <p>
          We implement industry-standard security measures to protect your
          information, including encryption of data in transit (TLS/SSL),
          encrypted storage of sensitive credentials (OAuth tokens), secure
          password hashing, and access controls. However, no method of
          transmission or storage is 100% secure, and we cannot guarantee absolute
          security.
        </p>
      </Section>

      <Section heading="7. Data Retention">
        <p>
          We retain your information for as long as your account is active or as
          needed to provide the Service. If you close your account, we will delete
          or anonymize your personal data within 90 days, except where retention
          is required by law or for legitimate business purposes (e.g., resolving
          disputes, enforcing agreements).
        </p>
      </Section>

      <Section heading="8. Your Rights">
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <List
          items={[
            "Access the personal information we hold about you",
            "Request correction of inaccurate data",
            "Request deletion of your personal data",
            "Object to or restrict certain processing of your data",
            "Request a portable copy of your data",
            "Withdraw consent where processing is based on consent",
          ]}
        />
        <p>
          To exercise any of these rights, contact us at the email address below.
        </p>
      </Section>

      <Section heading="9. Children's Privacy">
        <p>
          The Service is not intended for individuals under the age of 18. We do
          not knowingly collect personal information from children. If we become
          aware that we have collected data from a child, we will take steps to
          delete it promptly.
        </p>
      </Section>

      <Section heading="10. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you
          of material changes by posting the updated policy on this page and
          updating the &ldquo;Last updated&rdquo; date. Your continued use of the
          Service after changes constitutes acceptance of the revised policy.
        </p>
      </Section>

      <Section heading="11. Contact Us">
        <p>
          If you have questions about this Privacy Policy or wish to exercise your
          data rights, please contact us at:
        </p>
        <p>
          Multiply OS LLC
          <br />
          Email:{" "}
          <a
            href="mailto:support@multiplyos.com"
            className="font-medium text-brand-orange hover:underline"
          >
            support@multiplyos.com
          </a>
        </p>
      </Section>
    </LegalPage>
  );
}
