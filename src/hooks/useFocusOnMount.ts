import { useEffect, useRef } from "react";

export function useFocusOnMount<T extends HTMLElement>(): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: false });
    }
  }, []);

  return ref;
}
