import { Fragment } from "react";
import Link from "next/link";

import { ChevronRight } from "@votewise/ui/icons/chevron-right";
import { Label } from "@votewise/ui/label";
import { Separator } from "@votewise/ui/separator";
import { Skeleton } from "@votewise/ui/skeleton";

import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

const fields: { name: string; type: "input" | "textarea" }[] = [
  { name: "email", type: "input" },
  { name: "username", type: "input" },
  { name: "first_name", type: "input" },
  { name: "last_name", type: "input" },
  { name: "about", type: "textarea" },
  { name: "location", type: "input" },
  { name: "facebook", type: "input" },
  { name: "instagram", type: "input" },
  { name: "twitter", type: "input" }
];

export default function Loading() {
  return (
    <Fragment>
      <Link href={routes.settings.root()} className="flex items-center gap-1 text-gray-400 text-sm">
        <ChevronRight className="rotate-180 size-4" />
        <span>Back to Settings</span>
      </Link>
      <h1 className="text-xl text-gray-300">Account</h1>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex flex-col">
            <span className="text-gray-300 font-medium">
              <Skeleton>Full Name</Skeleton>
            </span>
            <span className="text-gray-400 text-sm">
              <Skeleton>Username</Skeleton>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <Label className="text-sm text-gray-400">
                <Skeleton>Email</Skeleton>
              </Label>
              <Skeleton className={cn(field.type === "textarea" ? "min-h-32 w-full" : "min-h-10 w-full")} />
            </div>
          ))}
          <Skeleton className="min-h-10 bg-blue-800 opacity-50">Submit</Skeleton>
        </div>
      </div>
      <Separator className="w-full h-px" />
      <h1 className="text-xl text-gray-300">Security</h1>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Two-Factor Authentication</span>
          <Skeleton className="h-11">Enable 2FA</Skeleton>
        </div>
      </div>
      <Separator className="w-full h-px" />
      <h1 className="text-xl text-gray-300">Danger Zone</h1>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Delete Account</span>
          <Skeleton className="h-11">Delete</Skeleton>
        </div>
      </div>
    </Fragment>
  );
}
