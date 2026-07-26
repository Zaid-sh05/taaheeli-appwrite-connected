import { BrowserRouter } from "react-router-dom";
import { SessionProvider } from "@/context/SessionContext";
import { DemoDataProvider } from "@/context/DemoDataContext";
import { TextSizeModeProvider } from "@/context/TextSizeModeContext";
import { ToastProvider } from "@/context/ToastContext";
import { AIProvider } from "@/context/AIContext";
import { AppRouter } from "@/router";

export function App() {
  return (
    <TextSizeModeProvider>
      <SessionProvider>
        <DemoDataProvider>
          <AIProvider>
            <ToastProvider>
              <BrowserRouter>
                <AppRouter />
              </BrowserRouter>
            </ToastProvider>
          </AIProvider>
        </DemoDataProvider>
      </SessionProvider>
    </TextSizeModeProvider>
  );
}
