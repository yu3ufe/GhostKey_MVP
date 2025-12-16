import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { CrossmintPayButton } from "@crossmint/client-sdk-react-ui";
import "@crossmint/client-sdk-react-ui/styles.css";

// 1. CONFIGURATION
const CONTRACT_ADDRESS = '0x4fa8389A99aD6c5F162F72850504e777A4a721AF'; // <--- UPDATE THIS
const GENESIS_URI = 'ipfs://bafkreifpnkbj4hz5ez2qomjjrjv2psoujaupakx4ece34j46x4midoxi7u'; // <--- UPDATE THIS (From Pinata Phase 2)

const ABI = [
  { inputs: [{internalType: "address", name: "to", type: "address"}], name: "mintGenesis", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{internalType: "string", name: "uri", type: "string"}], name: "mintCustom", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{internalType: "address", name: "owner", type: "address"}], name: "balanceOf", outputs: [{internalType: "uint256", name: "", type: "uint256"}], stateMutability: "view", type: "function" },
  { inputs: [{internalType: "uint256", name: "tokenId", type: "uint256"}], name: "revokeLicense", outputs: [], stateMutability: "nonpayable", type: "function" }
] as const;

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending, isSuccess } = useWriteContract();
  const [mounted, setMounted] = useState(false);
  const [customImage, setCustomImage] = useState(''); // For Scenario 1

  useEffect(() => { setMounted(true); }, []);

  const { data: balance, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'balanceOf', args: address ? [address] : undefined,
  });

  useEffect(() => { if (isSuccess) refetch(); }, [isSuccess, refetch]);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#ededed', fontFamily: 'sans-serif', padding: '20px' }}>
      <Head><title>GhostKey Sovereign Demo</title></Head>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>GhostKey™ Demo</h1>
        <ConnectButton />
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>

        {/* SCENARIO 2: CREDIT CARD (The "Normie" Path) */}
        <section style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <h2 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '10px' }}>SCENARIO 2: STANDARD USER</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 'bold' }}>Genesis Key</p>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>$0.50 (USD) • Credit Card</p>
            </div>
            {/* CROSSMINT BUTTON */}
            <CrossmintPayButton
              collectionId="<YOUR_CROSSMINT_COLLECTION_ID>"
              projectId="<YOUR_CROSSMINT_PROJECT_ID>"
              mintConfig={{ "type": "erc-721", "totalPrice": "0.50", "quantity": "1" }}
              environment="production" // Use "production" for Mainnet
            />
          </div>
        </section>

        {/* SCENARIO 1: CUSTOM CRYPTO MINT (The "Live Convert" Path) */}
        <section style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <h2 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '10px' }}>SCENARIO 1: LIVE CONVERT</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
             <p style={{ fontSize: '0.9rem' }}>Paste Pinata Hash (IPFS) to mint a custom key:</p>
             <input 
                type="text" 
                placeholder="ipfs://Qm..." 
                value={customImage}
                onChange={(e) => setCustomImage(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: 'none', background: '#333', color: 'white' }}
             />
             <button 
                onClick={() => writeContract({ 
                  address: CONTRACT_ADDRESS, abi: ABI, functionName: 'mintCustom', 
                  args: [customImage || GENESIS_URI], value: BigInt(0) 
                })}
                disabled={!isConnected || isPending}
                style={{ background: '#fff', color: 'black', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
             >
               {isPending ? 'Minting...' : 'Mint Custom Key (Crypto)'}
             </button>
          </div>
        </section>

        {/* SCENARIO 4: REVOCATION (The "Kill Switch") */}
        <section style={{ background: '#2e1010', padding: '20px', borderRadius: '12px', border: '1px solid #5e1f1f' }}>
          <h2 style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '10px' }}>SCENARIO 4: ADMIN ZONE</h2>
          <p style={{ fontSize: '0.8rem', color: '#ccc', marginBottom: '10px' }}>Revoke the last minted token (Demo Purpose Only)</p>
          <button 
             onClick={() => {
                const tokenIdToBurn = prompt("Enter Token ID to Revoke:");
                if(tokenIdToBurn) writeContract({ 
                  address: CONTRACT_ADDRESS, abi: ABI, functionName: 'revokeLicense', args: [BigInt(tokenIdToBurn)] 
                });
             }}
             style={{ background: '#dc2626', color: 'white', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', width: '100%' }}
          >
            ⚠️ Revoke License
          </button>
        </section>

        {/* SCENARIO 3: APP STATE */}
        <div style={{ textAlign: 'center', padding: '30px', background: Number(balance) > 0 ? '#102e1b' : '#333', borderRadius: '12px' }}>
          <h2 style={{ margin: 0, color: Number(balance) > 0 ? '#4ade80' : '#888' }}>
            {Number(balance) > 0 ? '🔓 APP UNLOCKED' : '🔒 APP LOCKED'}
          </h2>
          {Number(balance) > 0 && <p style={{ fontSize: '0.8rem', color: '#fff', marginTop: '10px' }}>License Verified on Polygon</p>}
        </div>

      </div>
    </div>
  );
}