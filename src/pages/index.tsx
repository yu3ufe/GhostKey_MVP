import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = '0x5397352F1085b8ea2a1Ddfc8CF3b4dBa978c26F8'; // 0x5f06BAeEbB433b1ce4B0143c88AD6F4a0E83a48e old contract address
const TREASURY_ADDRESS = '0x081ded677e03c5070d75f681e82a9ab0dfcf78c3'; // Must match connected wallet for Admin View
const GENESIS_URI = 'ipfs://bafkreigab7aey2nddpt7zw4zyvtqc2tyhg6rdw2yabd42hwn5c2v5mkz4q'; 

// CROSSMINT CONFIG
const CROSSMINT_COLLECTION_ID = "8dc0127c-7ce2-4d34-9485-9b3be58e6442"; // Ensure this is correct!
const CROSSMINT_PROJECT_ID = "d945c06d-bd3c-4c81-b527-506ca635d747";   

// Dynamic Import with forced "any" type
const CrossmintPayButton = dynamic(
  () => import('@crossmint/client-sdk-react-ui').then((mod: any) => mod.CrossmintPayButton),
  { ssr: false }
) as any;

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

  // Track if we already redirected to YouTube so we don't loop forever
  const hasRedirected = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  // ADMIN CHECK (Safe Case-Insensitive)
  const isAdmin = address && TREASURY_ADDRESS && (address.toLowerCase() === TREASURY_ADDRESS.toLowerCase());

  const { data: balance, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'balanceOf', args: address ? [address] : undefined,
  });

  useEffect(() => { if (isSuccess) refetch(); }, [isSuccess, refetch]);

  const isUnlocked = (Number(balance) > 0) || isAdmin;

  // --- YOUTUBE PROOF OF CONCEPT ---
  useEffect(() => {
    // If user is unlocked AND we haven't redirected yet...
    if (isUnlocked && !hasRedirected.current) {
        console.log("User verified! Opening App...");

        // Mark as done so it doesn't happen again
        hasRedirected.current = true;

        // 1. Wait 1.5 seconds so they see the Green Text first
        setTimeout(() => {
            // 2. Redirect to YouTube App (Proof of Deep Link)
            window.location.href = "youtube://";
        }, 1500);
    }
  }, [isUnlocked]);
  // -------------------------------

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#ededed', fontFamily: 'sans-serif', padding: '20px' }}>
      <Head><title>GhostKey Owner Demo</title></Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>GhostKey™ Demo</h1>
        <ConnectButton />
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>

        {/* SCENARIO: PUBLIC PURCHASE */}
        <section style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <h2 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '10px' }}>PUBLIC: PURCHASE LICENSE</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* OPTION 1: CREDIT CARD */}
            <div style={{ padding: '15px', background: '#222', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>💳 Pay with Card</span>
                    <span style={{ color: '#666' }}>~$5.00</span>
                </div>
                {/* FORCE VISIBILITY WRAPPER */}
                <div style={{ position: 'relative', minHeight: '50px', background: '#333', borderRadius: '6px' }}>
                    <CrossmintPayButton
                        collectionId={CROSSMINT_COLLECTION_ID}
                        projectId={CROSSMINT_PROJECT_ID}
                        mintConfig={{ "type": "erc-721", "totalPrice": "5.00", "quantity": "1" }}
                        environment="production"
                        style={{ width: '100%', padding: '12px', background: '#fff', color: '#000', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', textAlign: 'center' }}
                    />
                </div>
                <p style={{fontSize: '11px', color: '#666', marginTop: '5px', textAlign: 'center'}}>
                    *Verification required for production cards
                </p>
            </div>

            <div style={{ textAlign: 'center', color: '#444' }}>— OR —</div>

            {/* OPTION 2: CRYPTO (RESTORED!) */}
            <div style={{ padding: '15px', background: '#222', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>💎 Pay with Crypto</span>
                    <span style={{ color: '#666' }}>25 MATIC</span>
                </div>
                <button 
                    onClick={() => writeContract({ 
                        address: CONTRACT_ADDRESS, abi: ABI, functionName: 'mintGenesis', 
                        args: [address || '0x0000000000000000000000000000000000000000'],
                        value: BigInt("25000000000000000000") // 25 MATIC (in Wei)
                    })}
                    disabled={!isConnected || isPending}
                    style={{ width: '100%', background: '#8b5cf6', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {isPending ? 'Processing...' : (Number(balance) > 0 ? 'Mint Another (Gift/Invest)' : 'Mint with Wallet')}
                </button>
            </div>

          </div>
        </section>

        {/* ADMIN ONLY: CUSTOM MINT */}
        {isAdmin && (
            <div style={{ border: '1px dashed #666', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ marginTop: 0, color: '#fbbf24', textAlign: 'center' }}>👑 ADMIN</h3>
                
                <section style={{ marginTop: '20px', background: '#1a1a1a', padding: '15px', borderRadius: '8px' }}>
                    <h2 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '10px' }}>SCENARIO 1: CUSTOM NFT TOOL</h2>
                    <input 
                        type="text" placeholder="IPFS Hash..." value={customImage} onChange={(e) => setCustomImage(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', background: '#333', color: 'white', marginBottom: '10px' }}
                    />
                    <button 
                        onClick={() => writeContract({ 
                        address: CONTRACT_ADDRESS, abi: ABI, functionName: 'mintCustom', 
                        args: [customImage || GENESIS_URI], 
                        value: BigInt("25000000000000000000") // 25 MATIC (in Wei)
                        })}
                        disabled={!isConnected || isPending}
                        style={{ width: '100%', background: '#fff', color: 'black', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                    Mint Special Key
                    </button>
                </section>

                <section style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button 
                    onClick={() => {
                        const id = prompt("Token ID to Revoke:");
                        if(id) writeContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'revokeLicense', args: [BigInt(id)] });
                    }}
                    style={{ background: '#dc2626', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', flex: 1 }}
                    >
                    ⚠️ Revoke
                    </button>
                    <button 
                    onClick={() => writeContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'withdraw' })}
                    style={{ background: '#16a34a', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', flex: 1 }}
                    >
                    💰 Withdraw
                    </button>
                </section>
            </div>
        )}

        {/* APP STATUS */}
        <div style={{ textAlign: 'center', padding: '30px', background: isUnlocked ? '#102e1b' : '#333', borderRadius: '12px', border: isUnlocked ? '1px solid #4ade80' : 'none' }}>
          <h2 style={{ margin: 0, color: isUnlocked ? '#4ade80' : '#f87171' }}>
            {isUnlocked ? '🔓 APP UNLOCKED' : '🔒 APP LOCKED'}
          </h2>
          {isAdmin && <p style={{ fontSize: '12px', color: '#fbbf24', marginTop: '5px' }}>(Admin Override Active)</p>}
        </div>

      </div>
    </div>
  );
}