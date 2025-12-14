import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useEffect, useState } from 'react';
import Head from 'next/head';

// --- CONFIGURATION ---
// PASTE YOUR CONTRACT ADDRESS HERE
const CONTRACT_ADDRESS = '0x5ce71b5118885166a25130b57e97835d2c7D3597'; 

const ABI = [
  {
    inputs: [],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending: isMinting, isSuccess: isMinted } = useWriteContract();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Read Balance
  const { data: balance, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Refresh if minted
  useEffect(() => {
    if (isMinted) {
      refetch();
    }
  }, [isMinted, refetch]);

  if (!mounted) return null;

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#0a0a0a', 
      color: '#ededed',
      fontFamily: 'sans-serif'
    }}>
      <Head>
        <title>GhostKey MVP</title>
      </Head>

      {/* HEADER */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>GhostKey™ MVP</h1>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ConnectButton />
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
        
        {/* SECTION 1: THE STORE */}
        <div style={{ 
          background: '#1a1a1a', 
          borderRadius: '16px', 
          padding: '24px', 
          marginBottom: '24px',
          border: '1px solid #333'
        }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#888' }}>1. Acquire Asset</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Genesis Key</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Lifetime Access</p>
            </div>
            <div style={{ background: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
              #1776
            </div>
          </div>
          
          <button 
            disabled={!isConnected || isMinting}
            onClick={() => writeContract({ 
              address: CONTRACT_ADDRESS, 
              abi: ABI, 
              functionName: 'mint' 
            })}
            style={{ 
              width: '100%',
              background: isMinting ? '#666' : '#fff', 
              color: '#000', 
              border: 'none', 
              padding: '14px', 
              borderRadius: '8px', 
              cursor: isMinting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            {isMinting ? 'Minting...' : '💎 Mint on Polygon'}
          </button>
        </div>

        {/* SECTION 2: THE APP GATE */}
        <div style={{ 
          background: Number(balance) > 0 ? '#102e1b' : '#2e1010', 
          borderRadius: '16px', 
          padding: '24px', 
          border: Number(balance) > 0 ? '1px solid #1f5e32' : '1px solid #5e1f1f',
          textAlign: 'center',
          transition: 'all 0.3s ease'
        }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: Number(balance) > 0 ? '#4ade80' : '#f87171' }}>
            2. App Access
          </h2>
          
          {!isConnected ? (
             <p style={{ color: '#888' }}>Connect Wallet to Check Access</p>
          ) : Number(balance) > 0 ? (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔓</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>UNLOCKED</h3>
              <p style={{ fontSize: '0.9rem', color: '#4ade80', marginTop: '8px' }}>Sovereign Status Verified</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔒</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>LOCKED</h3>
              <p style={{ fontSize: '0.9rem', color: '#f87171', marginTop: '8px' }}>No License Found</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}