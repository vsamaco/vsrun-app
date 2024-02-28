import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "~/lib/utils";

function MainNavigation({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter();
  const { pathname } = router.query;

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        mpdrun
      </Link>
      {pathname && pathname.includes("/settings") && (
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
