import * as React from "react";

import { cn } from "@/lib/utils";

export function Calendar({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="date"
      className={cn("h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-accent", className)}
      {...props}
    />
  );
}
