'use client';

import { useState, useEffect } from 'react';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, bsc, polygon, arbitrum, optimism, base, avalanche } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

const bscTestnet = {
  id: 97, name: 'BNB Testnet',
  nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
  rpcUrls: { default: { http: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'] } },
  blockExplorers: { default: { name: 'BscScan Testnet', url: 'https://testnet.bscscan.com' } },
  testnet: true,
} as const;

const mantleSepolia = {
  id: 5003, name: 'Mantle Sepolia',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.sepolia.mantle.xyz'] } },
  blockExplorers: { default: { name: 'MantleScan Sepolia', url: 'https://sepolia.mantlescan.xyz' } },
} as const;

const queryClient = new QueryClient();

// config 在组件外创建，但只在浏览器环境
const config = typeof window !== 'undefined' ? getDefaultConfig({
  appName: 'Protocol Bet',
  projectId: 'b5b0c1b1b1b1b1b1b1b1b1b1b1b1b1b1',
  chains: [bscTestnet, mantleSepolia, bsc, mainnet, polygon, arbitrum, optimism, base, avalanche],
  ssr: false,
}) : null;

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  if (!ready || !config) {
    // SSR 阶段或未挂载：返回空白，阻止任何内容渲染到 HTML
    return <div id="app-loading" />;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: '#ff6b6b', accentColorForeground: '#080812', borderRadius: 'medium' })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
