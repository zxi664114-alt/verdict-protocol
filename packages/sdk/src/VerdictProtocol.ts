import { type Hash, type WalletClient, type PublicClient } from 'viem';
import { PROTOCOL_BET_ABI } from './contracts/abi';
import { CONTRACT_ADDRESSES, NATIVE_TOKEN, type SupportedChain } from './contracts/addresses';
import {
  type VerdictProtocolConfig,
  type CreateDuelParams,
  type AcceptDuelParams,
  type CancelDuelParams,
  type ClaimParams,
  type Duel,
  Visibility,
} from './types';
import { hashText, durationToDeadline } from './utils';

export class VerdictProtocol {
  private chain: SupportedChain;
  private contractAddress: `0x${string}`;
  private walletClient?: WalletClient;
  private publicClient?: PublicClient;

  constructor(config: VerdictProtocolConfig) {
    this.chain = config.chain;
    this.contractAddress = CONTRACT_ADDRESSES[config.chain];
    this.walletClient = config.walletClient;
    this.publicClient = config.publicClient;
  }

  private getPublicClient(): PublicClient {
    if (!this.publicClient) {
      throw new Error('[VerdictProtocol] publicClient is required for read operations');
    }
    return this.publicClient;
  }

  private getWalletClient(): WalletClient {
    if (!this.walletClient) {
      throw new Error('[VerdictProtocol] walletClient is required for write operations');
    }
    return this.walletClient;
  }

  // ── READ ────────────────────────────────────────────────────

  async getDuel(duelId: bigint): Promise<Duel> {
    const client = this.getPublicClient();
    const raw = await client.readContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: 'getDuel',
      args: [duelId],
    }) as Omit<Duel, 'id'>;
    return { id: duelId, ...raw };
  }

  async getDuelCount(): Promise<bigint> {
    const client = this.getPublicClient();
    return client.readContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: 'counter',
    }) as Promise<bigint>;
  }

  async getPools(duelId: bigint): Promise<{ red: bigint; blue: bigint }> {
    const client = this.getPublicClient();
    const [red, blue] = await Promise.all([
      client.readContract({
        address: this.contractAddress,
        abi: PROTOCOL_BET_ABI,
        functionName: 'poolRed',
        args: [duelId],
      }) as Promise<bigint>,
      client.readContract({
        address: this.contractAddress,
        abi: PROTOCOL_BET_ABI,
        functionName: 'poolBlue',
        args: [duelId],
      }) as Promise<bigint>,
    ]);
    return { red, blue };
  }

  async hasClaimed(duelId: bigint, address: `0x${string}`): Promise<boolean> {
    const client = this.getPublicClient();
    return client.readContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: 'claimed',
      args: [duelId, address],
    }) as Promise<boolean>;
  }

  // ── WRITE ────────────────────────────────────────────────────

  async createDuel(params: CreateDuelParams): Promise<Hash> {
    const wallet = this.getWalletClient();
    const [address] = await wallet.getAddresses();
    const token = params.token ?? NATIVE_TOKEN;
    const isNative = token === NATIVE_TOKEN;

    return wallet.writeContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: 'create',
      args: [
        token,
        params.wager,
        BigInt(params.audioBps ?? 0),
        durationToDeadline(params.duration),
        hashText(params.claim),
        hashText(params.rule ?? params.claim),
        params.visibility ?? Visibility.Public,
      ],
      account: address,
      chain: wallet.chain ?? null,
      value: isNative ? params.wager : 0n,
    });
  }

  async acceptDuel(params: AcceptDuelParams): Promise<Hash> {
    const wallet = this.getWalletClient();
    const [address] = await wallet.getAddresses();
    const duel = await this.getDuel(params.duelId);
    const isNative = duel.token === NATIVE_TOKEN;

    return wallet.writeContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: 'accept',
      args: [params.duelId],
      account: address,
      chain: wallet.chain ?? null,
      value: isNative ? duel.wager : 0n,
    });
  }

  async cancelDuel(params: CancelDuelParams): Promise<Hash> {
    const wallet = this.getWalletClient();
    const [address] = await wallet.getAddresses();

    return wallet.writeContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: 'cancel',
      args: [params.duelId],
      account: address,
      chain: wallet.chain ?? null,
    });
  }

  async claimWinnings(params: ClaimParams): Promise<Hash> {
    const wallet = this.getWalletClient();
    const [address] = await wallet.getAddresses();

    return wallet.writeContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: 'claim',
      args: [params.duelId],
      account: address,
      chain: wallet.chain ?? null,
    });
  }

  getContractAddress(): `0x${string}` {
    return this.contractAddress;
  }

  getChain(): SupportedChain {
    return this.chain;
  }
}
