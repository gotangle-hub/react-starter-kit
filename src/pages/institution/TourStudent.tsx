import { CoachmarkTour, type TourStep } from "@/components/app/coachmark-tour";
import { routes } from "@/lib/routes";

/** 11–15 · Student coachmark tour (G12). */
const STEPS: TourStep[] = [
  { title: "Welcome to Tangle", body: "A quick tour of where things live on your campus account. Thirty seconds — then it's yours.", spotlight: null },
  { title: "Your classes", body: "Every class your professors add you to lives here — briefs, documents, shared pins and the group chat.", spotlight: 0 },
  { title: "Community", body: "A thoughts feed for designers and students — share what you're thinking, and follow what the community is making.", spotlight: 1 },
  { title: "Your work", body: "Publish from the centre button — photos, video or a PDF the app turns into projects on your profile.", spotlight: 2 },
  { title: "Connect", body: "Swipe to connect with designers and studios over their work. Match, and a chat opens.", spotlight: 4 },
];

export default function TourStudent() {
  return <CoachmarkTour steps={STEPS} landTo={routes.studentClasses} accountType="student" />;
}
