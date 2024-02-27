import Image from "next/image";
import { MaxWidthWrapper } from "./max-width-wrapper";

export default function Footer() {
  return (
    <MaxWidthWrapper>
      <Image
        src="/images/api_logo_pwrdBy_strava_light.png"
        width="169"
        height="31"
        alt="powered by Strava"
        className="float-right my-20"
      />
    </MaxWidthWrapper>
  );
}
