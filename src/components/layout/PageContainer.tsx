import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}

export function PageContainer({ children, className, maxWidth = "max-w-2xl" }: PageContainerProps) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6", maxWidth, className)}>{children}</div>;
}
