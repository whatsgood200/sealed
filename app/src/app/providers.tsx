"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";
import { wagmiConfig } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 10_000 } },
  }));

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#F59E0B",
            accentColorForeground: "#0A0A0F",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0F0F1A",
                color: "#F0EEF8",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#10B981", secondary: "#0F0F1A" } },
              error:   { iconTheme: { primary: "#EF4444", secondary: "#0F0F1A" } },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
