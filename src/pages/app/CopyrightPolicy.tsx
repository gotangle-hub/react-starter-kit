import { LegalDoc } from "@/components/app/legal-doc";

export default function CopyrightPolicy() {
  return (
    <LegalDoc
      kicker="Legal"
      title="Copyright Policy"
      updated="14 Jun 2026"
      intro="Tangle is built on respect for creative work. This Policy explains who owns what, how credit works, and how to report infringement."
      sections={[
        {
          h: "You own your work",
          p: [
            "You keep all intellectual property rights in the work you create and publish on Tangle. Posting to Tangle does not transfer ownership to us or to any other member.",
          ],
        },
        {
          h: "The licence you give Tangle",
          p: [
            "So we can run the platform, you grant Tangle a worldwide, non exclusive, royalty free, sub licensable licence to host, store, reproduce, adapt (including resize, crop and compress), publish and display your work within the app and in Tangle's own marketing of the platform, with attribution. This licence ends when you delete the work or your account, except for copies retained in backups or already shared by others.",
          ],
        },
        {
          h: "Credit & attribution",
          p: [
            "Where work involves collaborators, clients or sources, you agree to credit them. Tangle promotes a credit first culture: members are expected to attribute parties involved when necessary and not to pass off others' work as their own.",
          ],
        },
        {
          h: "Respect others' rights",
          p: [
            "Do not upload work you do not own or have permission to share, and do not remove or falsify authorship or watermarks. Repeated or serious infringement will lead to removal and account termination.",
          ],
        },
        {
          h: "Reporting infringement (takedown)",
          p: [
            "If you believe content on Tangle infringes your copyright, send a notice to copyright@gotangle.app including: your contact details; identification of the work infringed; the location (link) of the infringing content; a statement that you have a good faith belief the use is unauthorised; and a statement, under penalty of perjury, that the information is accurate and you are the rights holder or authorised to act.",
          ],
        },
        {
          h: "Counter notice",
          p: [
            "If your content was removed and you believe this was a mistake or that you have the rights, you may submit a counter notice with the same contact and good faith details. We may restore the content unless the original reporter pursues legal action.",
          ],
        },
        {
          h: "Repeat infringer policy",
          p: [
            "We maintain and enforce a policy of terminating, in appropriate circumstances, the accounts of members who are repeat infringers.",
          ],
        },
        {
          h: "Tangle's own marks, concept & IP",
          p: [
            "The Tangle name, the “.t” wordmark, the verified mark, our design system, user interface, software and original content are owned by Tangle FZ LLC. You may not copy, modify, distribute or use them without our prior written permission.",
            "Beyond these specific marks, Tangle's underlying idea, concept, feature set, structure and overall look and feel are proprietary to us. You may not copy, clone, imitate or reproduce the Tangle product, or use it to build or assist a competing platform. This protection is in addition to, and independent of, the copyright you hold in your own work.",
          ],
        },
        {
          h: "Verified mark",
          p: [
            "The yellow verified mark is a trademark of Tangle and may only appear where Tangle has applied it. Imitating or misusing it is prohibited.",
          ],
        },
        {
          h: "Contact",
          p: ["For copyright matters, write to copyright@gotangle.app."],
        },
      ]}
    />
  );
}
