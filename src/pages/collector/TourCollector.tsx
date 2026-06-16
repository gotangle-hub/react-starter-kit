import { CoachmarkTour, type TourStep } from "@/components/app/coachmark-tour";
import { routes } from "@/lib/routes";

/** 07–10 · Collector coachmark tour (G12). */
const STEPS: TourStep[] = [
  { title: "Welcome to Tangle", body: "A quick tour of collecting on Tangle. Thirty seconds — then it's yours.", spotlight: null },
  { title: "Discover", body: "A personal feed of work, tuned to what you save and follow. It gets sharper over time.", spotlight: 0 },
  { title: "Explore", body: "An edge-to-edge wall of work. Tap any piece to save it, follow the maker, or open it.", spotlight: 1 },
  { title: "Save", body: "Keep the work you love in collections — your own quiet library of design.", spotlight: 2 },
];

export default function TourCollector() {
  return <CoachmarkTour steps={STEPS} landTo={routes.collectorHome} accountType="collector" />;
}
