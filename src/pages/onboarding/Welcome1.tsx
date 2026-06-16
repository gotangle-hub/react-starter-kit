import { CarouselSlide, ThreadVisual } from "./CarouselSlide";
import { routes } from "@/lib/routes";

/** 02 · First welcome slide. */
export default function Welcome1() {
  return (
    <CarouselSlide
      index={0}
      chip="Tangle / 01"
      head="See something you love?"
      sub="Find who made it."
      body="Discover architects, designers, artists and creative minds through the work they create. Every project leads back to its maker."
      visual={<ThreadVisual />}
      next={routes.welcome2}
    />
  );
}
