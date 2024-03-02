import { useSession } from "next-auth/react";
import Link from "next/link";
import { cn } from "~/lib/utils";

function MainNavigation({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const session = useSession();

  return (
    <nav
      className={cn("flex h-10 items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="text-sm font-semibold transition-colors hover:text-primary"
      >
        vsrun
      </Link>

      {session.status === "authenticated" && (
        <Link
          href="/settings"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Settings
        </Link>
      )}
    </nav>
  );
}

export default MainNavigation;
