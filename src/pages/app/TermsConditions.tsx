import { LegalDoc } from "@/components/app/legal-doc";

export default function TermsConditions() {
  return (
    <LegalDoc
      kicker="Legal"
      title="Terms & Conditions"
      updated="14 Jun 2026"
      intro="These Terms govern your access to and use of Tangle, the design collaboration platform operated by Tangle FZ LLC (“Tangle”, “we”, “us”). By creating an account or using the app, you agree to these Terms. If you do not agree, do not use Tangle."
      sections={[
        {
          h: "Eligibility & accounts",
          p: [
            "You must be at least 16 years old, or the age of digital consent in your country, to use Tangle. Institutional accounts are provisioned for enrolled students and staff of a subscribing institution.",
            "You are responsible for the activity on your account and for keeping your credentials secure. You must give accurate information and keep it current.",
          ],
        },
        {
          h: "Account types & roles",
          p: [
            "Tangle offers Designer, Studio, Client, Institution and Collector accounts. Features, limits and pricing differ by type and plan. When a student account loses its institutional link (for example, on graduation), it automatically converts to a free Designer account and retains the user's work and connections.",
          ],
        },
        {
          h: "Subscriptions, billing & cancellation",
          p: [
            "Paid plans are billed in advance on a recurring basis through our payment processor until cancelled. Prices are shown in AED and exclude applicable taxes unless stated.",
            "You may cancel at any time; access continues until the end of the current billing period. Except where required by law, payments are non refundable. We may change prices on reasonable notice.",
          ],
        },
        {
          h: "Your content & the licence you grant",
          p: [
            "You retain ownership of the work, posts, messages and other content you submit (“User Content”). You grant Tangle a worldwide, non exclusive, royalty free licence to host, store, reproduce, adapt (for example, resize and compress) and display your User Content solely to operate, promote and improve the platform.",
            "You represent that you own or have the rights to your User Content and that it does not infringe anyone's rights. You agree to credit collaborators and rights holders where appropriate.",
          ],
        },
        {
          h: "Automated features",
          p: [
            "Tangle uses automated tools to compress media, extract projects from uploaded PDFs, power search and matching, and assist verification. These tools may produce imperfect results; you are responsible for reviewing what you publish. We do not retain the oversized original of a file you ask us to compress.",
          ],
        },
        {
          h: "Acceptable use",
          p: [
            "Do not post unlawful, infringing, harassing, deceptive or harmful content; do not misrepresent authorship; do not scrape, data mine, reverse engineer, decompile or abuse the platform; do not circumvent plan limits or security. We may remove content and suspend accounts that breach these Terms.",
          ],
        },
        {
          h: "Verification & badges",
          p: [
            "Verification badges indicate that we performed a check at a point in time; they are not a guarantee of identity, skill or conduct. We may grant, withhold or revoke a badge at our discretion.",
          ],
        },
        {
          h: "Payments to third parties",
          p: [
            "Tangle is a discovery and collaboration platform, not a party to any engagement, hire or transaction between members. Any contract, payment or deliverable agreed between members is solely between them.",
          ],
        },
        {
          h: "Intellectual property of Tangle",
          p: [
            "The Tangle name, logo, wordmark, verified mark, software, source code, design system, user interface, and the original content we provide are owned by Tangle and protected by law. These Terms grant you no rights in them except the limited, revocable right to use the app as intended.",
          ],
        },
        {
          h: "No copying our concept or building a competitor",
          p: [
            "Tangle's product concept, idea, structure, feature set, flows, look and feel, and the way our features fit together are our confidential and proprietary work. You may not copy, clone, reproduce, imitate, adapt or reverse engineer Tangle, in whole or in part, and you may not use Tangle, any access we give you, or any knowledge gained from it, to design, build, fund or operate a product or service that competes with or replicates Tangle. This applies whether or not specific elements are separately protected by copyright, trademark or patent, and survives the closing of your account.",
            "Nothing here prevents you from running your own design business or using generally available tools and ideas independently of Tangle; what is prohibited is copying or imitating Tangle itself.",
          ],
        },
        {
          h: "Disclaimers",
          p: [
            "Tangle is provided “as is” and “as available”. To the fullest extent permitted by law, we disclaim all warranties, including fitness for a particular purpose, accuracy of matches, and uninterrupted availability.",
          ],
        },
        {
          h: "Limitation of liability",
          p: [
            "To the fullest extent permitted by law, Tangle and its officers and staff will not be liable for indirect, incidental, special or consequential damages, or loss of profits, data, goodwill or opportunities. Our total aggregate liability is limited to the greater of the amount you paid us in the 12 months before the claim, or AED 500.",
          ],
        },
        {
          h: "Indemnity",
          p: [
            "You agree to indemnify and hold Tangle harmless from claims, losses and costs arising out of your User Content, your use of the platform, or your breach of these Terms or of any third party right.",
          ],
        },
        {
          h: "Termination",
          p: [
            "You may close your account at any time. We may suspend or terminate access if you breach these Terms or to protect the platform or other members. Sections that by their nature should survive termination will survive.",
          ],
        },
        {
          h: "Governing law & disputes",
          p: [
            "These Terms are governed by the laws of the Emirate of Dubai and the applicable federal laws of the United Arab Emirates. The courts of the DIFC have exclusive jurisdiction, without prejudice to mandatory consumer rights in your country of residence.",
          ],
        },
        {
          h: "Changes",
          p: [
            "We may update these Terms. We will notify you of material changes in the app. Continued use after changes take effect means you accept the updated Terms.",
          ],
        },
      ]}
    />
  );
}
