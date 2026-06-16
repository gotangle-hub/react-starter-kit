import { CoachmarkTour, type TourStep } from "@/components/app/coachmark-tour";
import { routes } from "@/lib/routes";

/** 11–15 · Designer coachmark tour (G12). */
const STEPS: TourStep[] = [
  { title: "Welcome to Tangle", body: "A quick tour of where things live. Thirty seconds — then the space is yours.", spotlight: null },
  { title: "Find people", body: "Swipe to connect with designers and studios over their work. Match, and a chat opens.", spotlight: 0 },
  { title: "Explore", body: "An edge-to-edge feed of work, tuned to what you care about. Tap any piece to reveal its controls.", spotlight: 1 },
  { title: "Add your work", body: "Publish from the centre button — photos, video or a PDF the app turns into projects.", spotlight: 2 },
  { title: "Messages", body: "Connections, collaborations and competition threads, all in one colour-coded inbox.", spotlight: 4 },
];

export default function Tour() {
  return <CoachmarkTour steps={STEPS} landTo={routes.home} accountType="designer" />;
}
