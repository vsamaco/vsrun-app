import Link from "next/link";
import { cn } from "~/lib/utils";
import { Separator } from "../separator";
import { useProfile } from "~/contexts/useProfile";

type MainNavigationsProps = React.HTMLAttributes<HTMLElement>;

function MainNavigation({ className, ...props }: MainNavigationsProps) {
  const profileContext = useProfile();
  return (
    <nav
      className={cn("flex h-10 items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="text-md font-semibold transition-colors hover:text-primary"
      >
        vsrun
      </Link>
      {profileContext.profile && profileContext.showProfileHeader && (
        <>
          <Separator orientation="vertical" className="mx-1" />
          <Link
            href={`/p/${profileContext.profile.slug}`}
            className="hover:underline"
          >
            {profileContext.profile.name}
          </Link>
        </>
      )}
    </nav>
  );
}

export default MainNavigation;
