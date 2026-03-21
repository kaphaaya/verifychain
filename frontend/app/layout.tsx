"use client";
import "./globals.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { config } from "../lib/web3";
import "@rainbow-me/rainbowkit/styles.css";
import DemoBanner from "../components/DemoBanner";

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <DemoBanner/>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "#1a2236",
                    color: "#e2e8f0",
                    border: "1px solid #1e2d45",
                  },
                }}
              />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
