import type { ReactNode } from "react";

interface MainLandmarkProps {
  children: ReactNode;
}

export function MainLandmark({ children }: MainLandmarkProps) {
  return (
    <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
      {children}
    </main>
  );
}
