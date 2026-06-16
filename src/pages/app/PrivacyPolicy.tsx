import { LegalDoc } from "@/components/app/legal-doc";

export default function PrivacyPolicy() {
  return (
    <LegalDoc
      kicker="Legal"
      title="Privacy Policy"
      updated="14 Jun 2026"
      intro="This Policy explains what personal data Tangle FZ LLC collects, why, and the choices you have. We aim to collect only what we need to run a designer first platform."
      sections={[
        {
          h: "Data we collect",
          p: [
            "Account data: name, email, password (hashed), account type and plan. Profile data: location, disciplines, skills, links and the work you publish.",
            "Usage data: interactions such as views, likes, saves, matches, applications and messages. Device & technical data: IP address, device and app version, and diagnostics.",
            "Verification data: where you choose to verify, a government ID and a selfie check, processed by our verification provider and stored privately.",
          ],
        },
        {
          h: "How we use your data",
          p: [
            "To operate accounts and provide features; to power search, matching and recommendations from your interaction signals, discipline and city; to process payments; to keep the platform safe; to communicate with you; and to improve our services.",
          ],
        },
        {
          h: "Legal bases",
          p: [
            "We process data to perform our contract with you, with your consent (for example, optional verification), to meet legal obligations, and for our legitimate interests in running and securing the platform.",
          ],
        },
        {
          h: "When we share data",
          p: [
            "With service providers that host, process payments, verify identity and provide analytics, under contract. With other members, only the profile and content you choose to make visible. With authorities where legally required. We never sell your personal data.",
          ],
        },
        {
          h: "Institutional accounts",
          p: [
            "If you join through an institution, your verified status and limited profile details may be shared with that institution's administrators for the duration of your enrolment. Class pages are visible only to the enrolled students and staff of that class.",
          ],
        },
        {
          h: "Automated processing",
          p: [
            "Media you upload may be processed by automated tools to compress files or extract projects from PDFs. We process the minimum needed and do not retain the oversized original of a compressed file.",
          ],
        },
        {
          h: "Retention",
          p: [
            "We keep personal data for as long as your account is active and as needed for the purposes above, then delete or anonymise it, subject to legal retention requirements.",
          ],
        },
        {
          h: "Security",
          p: [
            "We use technical and organisational measures including encryption in transit, access controls and private storage for sensitive documents. No system is perfectly secure, so we cannot guarantee absolute security.",
          ],
        },
        {
          h: "Your rights",
          p: [
            "Subject to applicable law, you may access, correct, export or delete your data, object to or restrict certain processing, and withdraw consent. Contact privacy@gotangle.app to exercise these rights.",
          ],
        },
        {
          h: "International transfers",
          p: [
            "We may process data in countries other than yours, including where our providers operate. Where required, we use appropriate safeguards for such transfers.",
          ],
        },
        {
          h: "Cookies & similar tech",
          p: [
            "We use cookies and local storage to keep you signed in, remember preferences and measure performance. You can control these through your device settings.",
          ],
        },
        {
          h: "Children",
          p: [
            "Tangle is not intended for anyone under 16. We do not knowingly collect data from children; if you believe we have, contact us and we will delete it.",
          ],
        },
        {
          h: "Changes & contact",
          p: [
            "We will post updates to this Policy in the app and update the date above. For any privacy question, write to privacy@gotangle.app.",
          ],
        },
      ]}
    />
  );
}
