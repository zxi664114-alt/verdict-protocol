// src/lib/hooks.ts
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { parseEther, formatEther, keccak256, toBytes } from 'viem';
import { CONTRACT_ADDRESSES, PROTOCOL_BET_ABI, NATIVE, DuelStatus } from './contract';

export function useContractAddress() {
  const chainId = useChainId();
  if (chainId === 97) return CONTRACT_ADDRESSES.bscTestnet;
  if (chainId === 5003) return CONTRACT_ADDRESSES.mantleSepolia;
  return CONTRACT_ADDRESSES.bscTestnet;
}

export interface OnChainDuel {
  id: number;
  red: `0x${string}`;
  blue: `0x${string}`;
  token: `0x${string}`;
  wager: bigint;
  audioBps: bigint;
  deadline: bigint;
  claimHash: `0x${string}`;
  ruleHash: `0x${string}`;
  vis: number;
  status: number;
  winner: number;
  settledAt: bigint;
  poolRed: bigint;
  poolBlue: bigint;
}

export function useCounter() {
  const address = useContractAddress();
  return useReadContract({ address, abi: PROTOCOL_BET_ABI, functionName: 'counter' });
}

export function useAllDuels(count: number) {
  const address = useContractAddress();
  const ids = Array.from({ length: count }, (_, i) => i + 1);
  const contracts = ids.flatMap(id => [
    { address, abi: PROTOCOL_BET_ABI, functionName: 'getDuel' as const, args: [BigInt(id)] },
    { address, abi: PROTOCOL_BET_ABI, functionName: 'poolRed' as const, args: [BigInt(id)] },
    { address, abi: PROTOCOL_BET_ABI, functionName: 'poolBlue' as const, args: [BigInt(id)] },
  ]);
  const result = useReadContracts({ contracts, query: { enabled: count > 0 } });
  const duels: OnChainDuel[] = [];
  if (result.data) {
    for (let i = 0; i < ids.length; i++) {
      const duelResult = result.data[i * 3];
      const redResult = result.data[i * 3 + 1];
      const blueResult = result.data[i * 3 + 2];
      if (duelResult?.status === 'success' && duelResult.result) {
        const d = duelResult.result as any;
        duels.push({
          id: ids[i], red: d.red, blue: d.blue, token: d.token,
          wager: d.wager, audioBps: d.audioBps, deadline: d.deadline,
          claimHash: d.claimHash, ruleHash: d.ruleHash,
          vis: d.vis, status: d.status, winner: d.winner, settledAt: d.settledAt,
          poolRed: (redResult?.status === 'success' ? redResult.result : 0n) as bigint,
          poolBlue: (blueResult?.status === 'success' ? blueResult.result : 0n) as bigint,
        });
      }
    }
  }
  return { duels, isLoading: result.isLoading, refetch: result.refetch };
}

export function useMyDuels(allDuels: OnChainDuel[]) {
  const { address } = useAccount();
  if (!address) return { active: [], claimable: [], history: [] };
  const active = allDuels.filter(d =>
    (d.status === DuelStatus.Open || d.status === DuelStatus.Active) &&
    (d.red.toLowerCase() === address.toLowerCase() || d.blue.toLowerCase() === address.toLowerCase())
  );
  const claimable = allDuels.filter(d =>
    d.status === DuelStatus.Settled &&
    (d.red.toLowerCase() === address.toLowerCase() || d.blue.toLowerCase() === address.toLowerCase())
  );
  const history = allDuels.filter(d =>
    (d.status === DuelStatus.Settled || d.status === DuelStatus.Cancelled) &&
    (d.red.toLowerCase() === address.toLowerCase() || d.blue.toLowerCase() === address.toLowerCase())
  );
  return { active, claimable, history };
}

export function formatDeadline(deadline: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (deadline <= now) return 'Expired';
  const diff = Number(deadline - now);
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  if (days > 0) return `${days}d · ${String(hours).padStart(2, '0')}h`;
  if (hours > 0) return `${hours}h · ${String(mins).padStart(2, '0')}m`;
  return `${mins}m`;
}

export function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function fmtEther(val: bigint, decimals = 4): string {
  return parseFloat(formatEther(val)).toFixed(decimals).replace(/\.?0+$/, '');
}

export function useCreate() {
  const address = useContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const create = ({ claim, rule, durationSecs, wagerEth, audioBps = 0, vis = 0 }: {
    claim: string; rule: string; durationSecs: number; wagerEth: string; audioBps?: number; vis?: number;
  }) => {
    const claimHash = keccak256(toBytes(claim));
    const ruleHash = keccak256(toBytes(rule));
    const wager = parseEther(wagerEth);
    writeContract({ address, abi: PROTOCOL_BET_ABI, functionName: 'create', args: [NATIVE, wager, BigInt(audioBps), BigInt(durationSecs), claimHash, ruleHash, vis], value: wager });
  };
  return { create, isPending, isConfirming, isSuccess, hash, error };
}

export function useAccept() {
  const address = useContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const accept = (id: number, wagerEth: string) => {
    writeContract({ address, abi: PROTOCOL_BET_ABI, functionName: 'accept', args: [BigInt(id)], value: parseEther(wagerEth) });
  };
  return { accept, isPending, isConfirming, isSuccess, hash, error };
}

export function useBet() {
  const address = useContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const placeBet = (id: number, side: 1 | 2, amtEth: string) => {
    writeContract({ address, abi: PROTOCOL_BET_ABI, functionName: 'bet', args: [BigInt(id), side, parseEther(amtEth)], value: parseEther(amtEth) });
  };
  return { placeBet, isPending, isConfirming, isSuccess, hash, error };
}

export function useClaim() {
  const address = useContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const claim = (id: number) => {
    writeContract({ address, abi: PROTOCOL_BET_ABI, functionName: 'claim', args: [BigInt(id)] });
  };
  return { claim, isPending, isConfirming, isSuccess, hash, error };
}

export function useCancel() {
  const address = useContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const cancel = (id: number) => {
    writeContract({ address, abi: PROTOCOL_BET_ABI, functionName: 'cancel', args: [BigInt(id)] });
  };
  return { cancel, isPending, isConfirming, isSuccess, hash, error };
}

export function useSettle() {
  const address = useContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const settle = (id: number, winner: 1 | 2) => {
    writeContract({ address, abi: PROTOCOL_BET_ABI, functionName: 'settle', args: [BigInt(id), winner] });
  };
  return { settle, isPending, isConfirming, isSuccess, hash, error };
}

export function useDispute() {
  const address = useContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const dispute = (id: number, stakeEth: string) => {
    writeContract({ address, abi: PROTOCOL_BET_ABI, functionName: 'dispute', args: [BigInt(id)], value: parseEther(stakeEth) });
  };
  return { dispute, isPending, isConfirming, isSuccess, hash, error };
}
