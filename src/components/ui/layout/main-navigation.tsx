import Link from "next/link";
import { cn } from "~/lib/utils";

function MainNavigation({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
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
    </nav>
  );
}

export default MainNavigation;
