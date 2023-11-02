import { cn } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Button } from "../button";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import Image from "next/image";

function UserNavigation() {
  const session = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8" user={session?.data?.user} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session?.data?.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.data?.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void signOut({ callbackUrl: "/" })}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Avatar({
  user = {},
  className,
}: {
  user?: {
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
  };
  className?: string;
}) {
  return (
    <span className="relative flex h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-full">
      <Image
        width={8}
        height={8}
        className={cn("aspect-square h-full w-full", className)}
        alt={`${user?.name || user?.email}`}
        src={
          user?.image ||
          `https://api.dicebear.com/7.x/micah/svg?seed=${user?.email}`
        }
      />
    </span>
  );
}

export default UserNavigation;
