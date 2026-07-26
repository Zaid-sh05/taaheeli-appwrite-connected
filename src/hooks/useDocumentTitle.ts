import { useEffect } from "react";

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | تأهيلي` : "تأهيلي";
    return () => {
      document.title = prev;
    };
  }, [title]);
}
