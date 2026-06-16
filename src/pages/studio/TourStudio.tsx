import { CoachmarkTour, type TourStep } from "@/components/app/coachmark-tour";
import { routes } from "@/lib/routes";

/** 08–12 · Studio coachmark tour (G12). */
const STEPS: TourStep[] = [
  { title: "Welcome to Tangle", body: "A quick tour of the studio account. Thirty seconds — then it's yours.", spotlight: null },
  { title: "Your studio page", body: "A public home for the studio — work, the team, and any open roles, all in one place.", spotlight: 4 },
  { title: "Find talent", body: "Search designers by discipline, city and availability, and shortlist them into talent pools.", spotlight: 3 },
  { title: "Post & publish", body: "Publish projects on behalf of the studio and credit every member who worked on them.", spotlight: 2 },
  { title: "Messages", body: "Connections, collaborations and competition threads, all in one colour-coded inbox.", spotlight: 4 },
];

export default function TourStudio() {
  return <CoachmarkTour steps={STEPS} landTo={routes.studioPage} accountType="studio" />;
}
