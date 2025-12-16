import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
// @ts-ignore

// Load Crossmint only on the client-side to avoid build errors
const CrossmintPayButton = dynamic(
  () => import('@crossmint/client-sdk-react-ui').then((mod: any) => mod.CrossmintPayButton),
  { ssr: false }
) as any;

// --- CONFIGURATION (FILL THESE) ---
const CONTRACT_ADDRESS = '0x5f06BAeEbB433b1ce4B0143c88AD6F4a0E83a48e'; 
const TREASURY_ADDRESS = '0x081ded677e03c5070d75f681e82a9ab0dfcf78c3';
const GENESIS_URI = 'ipfs://bafkreigab7aey2nddpt7zw4zyvtqc2tyhg6rdw2yabd42hwn5c2v5mkz4q'; 

// CROSSMINT CONFIG
const CROSSMINT_COLLECTION_ID = "8dc0127c-7ce2-4d34-9485-9b3be58e6442"; // From Collections tab
const CROSSMINT_PROJECT_ID = "d945c06d-bd3c-4c81-b527-506ca635d747";       // From API Keys tab

const ABI = [
  { inputs: [{internalType: "address", name: "to", type: "address"}], name: "mintGenesis", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{internalType: "string", name: "uri", type: "string"}], name: "mintCustom", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{internalType: "address", name: "owner", type: "address"}], name: "balanceOf", outputs: [{internalType: "uint256", name: "", type: "uint256"}], stateMutability: "view", type: "function" },
  { inputs: [{internalType: "uint256", name: "tokenId", type: "uint256"}], name: "revokeLicense", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" }
] as const;

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending, isSuccess } = useWriteContract();
  const [mounted, setMounted] = useState(false);
  const [customImage, setCustomImage] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const { data: balance, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'balanceOf', args: address ? [address] : undefined,
  });

  useEffect(() => { if (isSuccess) refetch(); }, [isSuccess, refetch]);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#ededed', fontFamily: 'sans-serif', padding: '20px' }}>
      <Head><title>GhostKey Owner Demo</title></Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>GhostKey™ Owner Demo</h1>
        <ConnectButton />
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>

        {/* SCENARIO 2: CARD PAYMENT */}
        <section style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <h2 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '10px' }}>SCENARIO 2: CREDIT CARD</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 'bold' }}>Genesis Key</p>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>$0.50 USD • Visa/Mastercard</p>
            </div>
            
            <CrossmintPayButton
              collectionId={CROSSMINT_COLLECTION_ID}
              projectId={CROSSMINT_PROJECT_ID}
              mintConfig={{ 
                  "type": "erc-721", 
                  "totalPrice": "0.50", 
                  "quantity": "1" 
              }}
              environment="production"
              style={{ padding: '10px 20px', borderRadius: '8px' }} // Basic manual styling since we removed CSS
            />
          </div>
        </section>

        {/* SCENARIO 1: CRYPTO MINT */}
        <section style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <h2 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '10px' }}>SCENARIO 1: LIVE CRYPTO MINT</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
             <input 
                type="text" 
                placeholder="Paste IPFS Hash (ipfs://...)" 
                value={customImage}
                onChange={(e) => setCustomImage(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: 'none', background: '#333', color: 'white' }}
             />
             <button 
                onClick={() => writeContract({ 
                  address: CONTRACT_ADDRESS, abi: ABI, functionName: 'mintCustom', 
                  args: [customImage || GENESIS_URI], 
                  value: BigInt(100000000000000000) // 0.1 MATIC
                })}
                disabled={!isConnected || isPending}
                style={{ background: '#fff', color: 'black', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
             >
               {isPending ? 'Processing...' : 'Mint with Wallet (0.1 MATIC)'}
             </button>
          </div>
        </section>

        {/* ADMIN CONTROLS */}
        <section style={{ background: '#2e1010', padding: '20px', borderRadius: '12px', border: '1px solid #5e1f1f' }}>
          <h2 style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '10px' }}>ADMIN CONTROLS</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
               onClick={() => {
                  const id = prompt("Token ID to Revoke:");
                  if(id) writeContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'revokeLicense', args: [BigInt(id)] });
               }}
               style={{ background: '#dc2626', color: 'white', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', flex: 1 }}
            >
              ⚠️ Revoke Key
            </button>
            <button 
               onClick={() => writeContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'withdraw' })}
               style={{ background: '#16a34a', color: 'white', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', flex: 1 }}
            >
              💰 Withdraw
            </button>
          </div>
        </section>

        {/* STATUS */}
        <div style={{ textAlign: 'center', padding: '30px', background: Number(balance) > 0 ? '#102e1b' : '#333', borderRadius: '12px' }}>
          <h2 style={{ margin: 0, color: Number(balance) > 0 ? '#4ade80' : '#888' }}>
            {Number(balance) > 0 ? '🔓 UNLOCKED' : '🔒 LOCKED'}
          </h2>
        </div>

      </div>
    </div>
  );
}