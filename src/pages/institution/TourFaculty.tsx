import { CoachmarkTour, type TourStep } from "@/components/app/coachmark-tour";
import { routes } from "@/lib/routes";

/** 16–20 · Faculty coachmark tour (G12). */
const STEPS: TourStep[] = [
  { title: "Welcome to Tangle", body: "A quick tour of the faculty account. Thirty seconds — then it's yours.", spotlight: null },
  { title: "Your classes", body: "Every class you run lives here — create one, add students, and keep briefs, documents and the group chat in one place.", spotlight: 0 },
  { title: "Add anything", body: "Post from the centre button — project briefs, lecture documents, readings and references for your class.", spotlight: 2 },
  { title: "From Explore", body: "Found something worth discussing? Share pins straight from Explore into any of your classes.", spotlight: 1 },
  { title: "Group chat", body: "Every class has a private group chat — keep the conversation with your students in one thread.", spotlight: 4 },
];

export default function TourFaculty() {
  return <CoachmarkTour steps={STEPS} landTo={routes.classList} accountType="institution" />;
}
