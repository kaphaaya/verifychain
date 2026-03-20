"use client";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrumSepolia, arbitrum } from "wagmi/chains";

export const config = getDefaultConfig({
  appName:   "VerifyChain",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains:    [arbitrumSepolia, arbitrum],
  ssr:       true,
});

// Contract ABI — just the functions the frontend calls
export const CONTRACT_ABI = [
  {
    inputs: [{ name: "_supplier", type: "address" }],
    name:   "verifySupplier",
    outputs: [
      { name: "isValid", type: "bool" },
      {
        components: [
          { name: "supplier",     type: "address" },
          { name: "companyName",  type: "string"  },
          { name: "taxId",        type: "string"  },
          { name: "country",      type: "string"  },
          { name: "docsIPFSHash", type: "string"  },
          { name: "issuedAt",     type: "uint256" },
          { name: "expiresAt",    type: "uint256" },
          { name: "isActive",     type: "bool"    },
          { name: "tier",         type: "uint8"   },
        ],
        name: "cred",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_taxId", type: "string" }],
    name:   "verifyByTaxId",
    outputs: [
      { name: "isValid",        type: "bool"    },
      {
        components: [
          { name: "supplier",     type: "address" },
          { name: "companyName",  type: "string"  },
          { name: "taxId",        type: "string"  },
          { name: "country",      type: "string"  },
          { name: "docsIPFSHash", type: "string"  },
          { name: "issuedAt",     type: "uint256" },
          { name: "expiresAt",    type: "uint256" },
          { name: "isActive",     type: "bool"    },
          { name: "tier",         type: "uint8"   },
        ],
        name: "cred",
        type: "tuple",
      },
      { name: "supplierWallet", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name:    "totalSuppliers",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const TIER_NAMES: Record<number, string> = {
  1: "Basic",
  2: "Standard",
  3: "Premium",
};

export const TIER_COLORS: Record<number, string> = {
  1: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  2: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  3: "text-amber-400 bg-amber-400/10 border-amber-400/30",
};
