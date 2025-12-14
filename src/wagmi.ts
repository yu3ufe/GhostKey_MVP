import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'GhostKey MVP',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? 'YOUR_PROJECT_ID', // Safe fallback
  chains: [polygon],
  ssr: true,
});