import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/utils";

export default function Footer({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer
      className={cn(
        "my-10 flex flex-col items-center justify-center space-y-2  md:flex-row md:justify-between",
        className
      )}
      {...props}
    >
      <div className="text-md text-muted-foreground">
        vsrun by{" "}
        <a
          href="https://www.strava.com/athletes/45458214"
          target="_blank"
          className="underline"
        >
          vincent
        </a>{" "}
        |{" "}
        <Link href="/contact" className="underline">
          Contact
        </Link>
      </div>
      <Image
        src="/images/api_logo_pwrdBy_strava_light.png"
        width="169"
        height="31"
        alt="powered by Strava"
        className=""
      />
    </footer>
  );
}
