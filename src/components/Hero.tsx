import React from "react";
type HeroProps = {
  name: string;
  showHighlightRun: boolean;
  showWeekStats: boolean;
  showShoes: boolean;
  showShoeRotations: boolean;
  showEvents: boolean;
};

function Hero({
  name,
  showHighlightRun,
  showWeekStats,
  showShoes,
  showShoeRotations,
  showEvents,
}: HeroProps) {
  return (
    <div className="flex flex-col justify-center py-10  sm:py-20">
      <h1 className="mt-40 text-4xl sm:mt-40 sm:text-8xl">{name}</h1>
      <div className="flex flex-col pb-32 text-4xl opacity-50 sm:text-6xl">
        {showHighlightRun && (
          <a href="#run" className="uppercase text-yellow-400 hover:underline">
            RUN
          </a>
        )}
        {showWeekStats && (
          <a href="#week" className="text-blue-400 hover:underline">
            WEEK
          </a>
        )}
        {showShoes && (
          <a href="#shoes" className="text-green-400 hover:underline">
            SHOES
          </a>
        )}
        {showShoeRotations && (
          <a href="#shoe-rotations" className="text-orange-400 hover:underline">
            SHOE ROTATIONS
          </a>
        )}
        {showEvents && (
          <a href="#races" className="text-red-400 hover:underline">
            RACES
          </a>
        )}
      </div>
    </div>
  );
}

export default Hero;
