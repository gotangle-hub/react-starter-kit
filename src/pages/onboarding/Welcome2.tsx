import { CarouselSlide, NetVisual } from "./CarouselSlide";
import { routes } from "@/lib/routes";

/** 03 · Second welcome slide. */
export default function Welcome2() {
  return (
    <CarouselSlide
      index={1}
      chip="Tangle / 02"
      head="The creative network."
      sub="More than a wall of finished work."
      body="Show the process and the journey behind a project, not only the final image. Give and get valuable feedback from designers who actually look."
      visual={<NetVisual />}
      next={routes.accountType}
    />
  );
}
