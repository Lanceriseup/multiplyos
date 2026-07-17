import type { Metadata } from "next";
import LegalPage, { Section, SubHeading, List } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Multiply OS",
  description: "The terms governing your use of the Multiply OS platform.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Multiply OS Terms of Service" lastUpdated="July 17, 2026">
      <p>
        This Terms of Service (&ldquo;Agreement&rdquo;) governs your access to
        and use of the Multiply OS platform. Please read it carefully.
      </p>

      <Section heading="1. Acceptance of Terms">
        <p>
          By accessing or using the Multiply OS platform via our website, app,
          or any other means (the &ldquo;Service&rdquo;), operated by Multiply OS
          LLC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;), you agree to be bound by these Terms of Service
          (&ldquo;Agreement&rdquo;). By accessing or using the Services, you
          agree to be bound by this Agreement and our Privacy Policy, which is
          incorporated herein by reference. If you do not agree to this
          Agreement, do not use the Service.
        </p>
      </Section>

      <Section heading="2. License Grant">
        <p>
          Subject to the terms of this Agreement, we grant you a limited,
          non-exclusive, non-transferable, revocable license to access and use
          the Service for your internal business purposes. This license does not
          include the right to sublicense, modify, distribute, sell, or create
          derivative works of the Service.
        </p>
      </Section>

      <Section heading="3. Account Registration">
        <p>
          You must provide accurate and complete information when creating an
          account. By submitting any information to us, you warrant that you have
          the right to provide the information, it does not violate the rights of
          any third party, and it does not contain material that is unlawful,
          defamatory, obscene, threatening, or otherwise objectionable. You are
          responsible for maintaining the confidentiality of your account
          credentials and for all activities that occur under your account. You
          agree to notify us immediately of any unauthorized use of your account,
          and of any changes to the information provided to us when creating an
          account.
        </p>
      </Section>

      <Section heading="4. Permitted Use">
        <p>
          You agree to use the Service only for lawful purposes and in accordance
          with this Agreement. You shall not:
        </p>
        <List
          items={[
            "Use the Service in violation of any applicable law or regulation",
            "Attempt to gain unauthorized access to any portion of the Service",
            "Interfere with or disrupt the integrity or performance of the Service",
            "Reverse engineer, decompile, or disassemble any aspect of the Service",
            "Use the Service to transmit malware, spam, or other harmful content",
            "Share your account credentials with unauthorized third parties",
            "Modify copies of any materials from the Service",
            "Use any illustrations, photographs, video or audio sequences, or any graphics separately from the accompanying text",
            "Delete or alter any copyright, trademark, or other proprietary rights notices from copies of materials from the Service",
            "Reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on the Service",
          ]}
        />
      </Section>

      <Section heading="5. Third-Party Integrations">
        <p>
          The Service may integrate with third-party services, including but not
          limited to Intuit QuickBooks Online, Plaid and Documenso. When you
          connect a third-party service, you authorize us to access and retrieve
          data from that service
          on your behalf. Your use of third-party services is governed by their
          respective terms and policies. We are not responsible for the
          availability, accuracy, or practices of third-party services.
        </p>
        <p>
          You may disconnect third-party integrations at any time through the
          Settings page. Upon disconnection, we will cease accessing your
          third-party data, though previously synced data may be retained in
          accordance with our Privacy Policy.
        </p>
      </Section>

      <Section heading="6. Intellectual Property">
        <p>
          The Service and its original content, features, and
          functionality&mdash;including all information, text, graphics, images,
          logos, icons, photographs, audio, video, software, and their selection
          and arrangement&mdash;are and will remain the exclusive property of
          Multiply OS LLC. The Service is protected by United States and
          international copyright, trademark, patent, trade secret, and other
          intellectual property laws, and may not be used in connection with any
          product or service without prior written consent.
        </p>
      </Section>

      <Section heading="7. Your Data">
        <p>
          You retain all rights to the data you enter into or connect through the
          Service (&ldquo;Your Data&rdquo;). You grant us a limited license to use
          Your Data solely for the purpose of providing the Service to you. We
          will not sell, share, or use Your Data for purposes unrelated to the
          Service without your consent.
        </p>
      </Section>

      <Section heading="8. Disclaimer of Warranties">
        <p>
          THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
          AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT
          PERMITTED BY LAW, MULTIPLY OS LLC DISCLAIMS ALL WARRANTIES, EXPRESS OR
          IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR
          ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICE OR
          EQUIPMENT THAT MAKES IT AVAILABLE WILL BE FREE OF VIRUSES OR OTHER
          HARMFUL COMPONENTS.
        </p>
      </Section>

      <Section heading="9. Limitation of Liability and Indemnification">
        <p>
          TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
          MULTIPLY OS LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES,
          OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF
          PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF
          OR RELATING TO YOUR ACCESS TO OR USE OF, OR INABILITY TO ACCESS OR USE,
          THE SERVICE.
        </p>
        <p>
          IN NO EVENT SHALL MULTIPLY OS LLC&rsquo;S TOTAL LIABILITY TO YOU FOR ALL
          CLAIMS ARISING OUT OF OR RELATING TO THE USE OF THE SERVICE EXCEED ONE
          HUNDRED DOLLARS ($100.00).
        </p>
        <p>
          THE LIMITATIONS AND EXCLUSIONS IN THIS SECTION APPLY WHETHER THE ALLEGED
          LIABILITY IS BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR
          ANY OTHER BASIS, EVEN IF MULTIPLY OS LLC HAS BEEN ADVISED OF THE
          POSSIBILITY OF SUCH DAMAGE.
        </p>
        <p>
          Some jurisdictions do not allow the exclusion of certain warranties or
          the limitation of liability for certain damages. In such jurisdictions,
          the above limitations shall apply to the fullest extent permitted by
          law.
        </p>
        <p>
          YOU AGREE TO DEFEND, INDEMNIFY, AND HOLD HARMLESS MULTIPLY OS LLC, ITS
          OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES FROM AND AGAINST
          ANY CLAIMS, LIABILITIES, DAMAGES, JUDGMENTS, AWARDS, LOSSES, COSTS,
          EXPENSES, OR FEES (INCLUDING REASONABLE ATTORNEYS&rsquo; FEES) ARISING
          OUT OF OR RELATING TO YOUR VIOLATION OF THIS AGREEMENT OR YOUR USE OF
          THE SERVICE.
        </p>
      </Section>

      <Section heading="10. Termination">
        <p>
          We may terminate or suspend your access to the Service immediately,
          without prior notice or liability, for any reason, including breach of
          this Agreement. Upon termination, your right to use the Service will
          cease immediately. Provisions of this Agreement that by their nature
          should survive termination shall survive.
        </p>
      </Section>

      <Section heading="11. Modifications">
        <p>
          We reserve the right to modify, update, or discontinue the Service, or
          any part thereof, at any time and without notice. We shall not be liable
          to you or any third party for any modification, suspension, or
          discontinuance of the Service. We reserve the right to modify this
          Agreement at any time. We will provide notice of material changes by
          posting the updated Agreement on this page and updating the &ldquo;Last
          updated&rdquo; date. Your continued use of the Service after changes
          constitutes acceptance of the modified terms.
        </p>
      </Section>

      <Section heading="12. Governing Law">
        <p>
          This Agreement and any dispute or claim arising out of it or the Service
          shall be governed by and construed in accordance with the laws of the
          State of Texas, without regard to its conflict of law provisions. Any
          legal action or proceeding arising under this Agreement shall be brought
          exclusively in the federal or state courts located in Denton County,
          Texas. You irrevocably consent to the personal jurisdiction and venue of
          such courts.
        </p>
      </Section>

      <Section heading="13. General Provisions">
        <SubHeading>Entire Agreement</SubHeading>
        <p>
          This Agreement, together with our Privacy Policy, constitute the entire
          agreement between you and Multiply OS LLC regarding the use of the
          Service. This Agreement does not create any agency, partnership, joint
          venture, or employment relationship between you and Multiply OS LLC.
        </p>
        <SubHeading>Severability</SubHeading>
        <p>
          If any provision of this Agreement is held to be invalid, illegal, or
          unenforceable for any reason, that provision shall be limited or
          eliminated to the minimum extent necessary, and the remaining provisions
          of this Agreement shall continue in full force and effect.
        </p>
        <SubHeading>Waiver</SubHeading>
        <p>
          No waiver by Multiply OS LLC of any term or condition set out in this
          Agreement shall be deemed a further or continuing waiver of such term or
          condition or a waiver of any other term or condition. Our failure to
          exercise or enforce any right or provision of this Agreement shall not
          constitute a waiver of such right or provision.
        </p>
        <SubHeading>Assignment</SubHeading>
        <p>
          You may not assign or transfer this Agreement, by operation of law or
          otherwise, without our prior written consent. Any attempt to assign or
          transfer without consent shall be void. We may freely assign this
          Agreement without restriction.
        </p>
        <SubHeading>Force Majeure</SubHeading>
        <p>
          Multiply OS LLC shall not be liable for any failure or delay in
          performing obligations under this Agreement due to causes beyond its
          reasonable control, including natural disasters, acts of government,
          internet or telecommunications failures, power outages, or other events
          of force majeure.
        </p>
      </Section>

      <Section heading="14. Contact Us">
        <p>
          If you have questions about this Agreement, please contact us at:
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
