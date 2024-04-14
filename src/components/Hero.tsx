import React from "react";
import { Separator } from "./ui/separator";
type HeroProps = {
  name: string;
  showHighlightRun: boolean;
  showWeekStats: boolean;
  showShoes: boolean;
  showShoeRotations: boolean;
  showEvents: boolean;
  showRaces: boolean;
  heroRef: React.RefObject<HTMLHeadingElement>;
};

function Hero({
  name,
  showHighlightRun,
  showWeekStats,
  showShoes,
  showShoeRotations,
  showEvents,
  showRaces,
  heroRef,
}: HeroProps) {
  return (
    <div className="flex flex-col justify-center py-10  sm:py-20">
      <h1
        ref={heroRef}
        className="mt-40 flex-wrap text-5xl sm:mt-40 sm:text-9xl"
      >
        {name}
      </h1>
      <Separator className="my-2 h-1 bg-black md:my-4 md:h-2" />
      <div className="flex flex-col pb-32 text-4xl opacity-50 sm:text-6xl">
        {showHighlightRun && (
          <a
            href="#run"
            className="uppercase text-yellow-400 hover:bg-yellow-400 hover:text-white md:hover:py-2"
          >
            RUN
          </a>
        )}
        {showWeekStats && (
          <a
            href="#week"
            className=" text-blue-400 hover:bg-blue-400 hover:text-white md:hover:py-2"
          >
            WEEK
          </a>
        )}
        {showShoes && (
          <a
            href="#shoes"
            className=" text-green-400 hover:bg-green-400 hover:text-white md:hover:py-2"
          >
            SHOES
          </a>
        )}
        {showShoeRotations && (
          <a
            href="#shoe-rotations"
            className="text-orange-400 hover:bg-orange-400 hover:text-white md:hover:py-2"
          >
            SHOE ROTATIONS
          </a>
        )}
        {showRaces && (
          <a
            href="#races"
            className="text-red-400 hover:bg-red-400 hover:text-white md:hover:py-2"
          >
            RACES
          </a>
        )}
      </div>
    </div>
  );
}

export default Hero;
