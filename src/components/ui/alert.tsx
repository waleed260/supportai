import * as React from "react"

import { cn } from "@/lib/utils"

function Alert({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: "default" | "destructive" }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 text-sm",
        variant === "destructive" && "border-destructive/50 text-destructive bg-destructive/10 [&>svg]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("flex-1 [&_a]:underline [&_a]:underline-offset-4", className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-medium leading-none", className)}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }
