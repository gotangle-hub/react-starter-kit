import { CoachmarkTour, type TourStep } from "@/components/app/coachmark-tour";
import { routes } from "@/lib/routes";

/** 06–10 · Client coachmark tour (G12). */
const STEPS: TourStep[] = [
  { title: "Welcome to Tangle", body: "A quick tour of hiring on Tangle. Thirty seconds — then it's yours.", spotlight: null },
  { title: "Post a brief", body: "Describe the work and we'll shortlist designers and studios that fit — usually within hours.", spotlight: 2 },
  { title: "Browse the work", body: "Explore real projects and search by discipline, city or even by image to find the right maker.", spotlight: 1 },
  { title: "Shortlist talent", body: "Save the people you like into talent pools so the right names are one tap away.", spotlight: 0 },
  { title: "Message directly", body: "Talk to creatives in your inbox — agreements and payment stay between you and them.", spotlight: 4 },
];

export default function TourClient() {
  return <CoachmarkTour steps={STEPS} landTo={routes.clientHome} accountType="client" />;
}
