"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NotificationProvider } from "@/contexts/NotificationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NotificationProvider>{children}</NotificationProvider>
    </NextThemesProvider>
  );
}
