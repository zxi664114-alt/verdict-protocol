import type { WalletClient, PublicClient } from 'viem';
import type { SupportedChain } from './contracts/addresses';

// ── Enums ──────────────────────────────────────────────────────

export enum DuelStatus {
  Open = 0,
  Active = 1,
  Settled = 2,
  Disputed = 3,
  Cancelled = 4,
}

export enum DuelSide {
  None = 0,
  Red = 1,
  Blue = 2,
}

export enum Visibility {
  Public = 0,
  Private = 1,
}

// ── Core types ─────────────────────────────────────────────────

export interface Duel {
  id: bigint;
  red: `0x${string}`;
  blue: `0x${string}`;
  token: `0x${string}`;
  wager: bigint;
  audioBps: bigint;
  deadline: bigint;
  claimHash: `0x${string}`;
  ruleHash: `0x${string}`;
  vis: number;
  status: DuelStatus;
  winner: DuelSide;
  settledAt: bigint;
}

// ── Input params ───────────────────────────────────────────────

export interface CreateDuelParams {
  /** The claim text — e.g. "BTC will hit $150K by EOY" */
  claim: string;
  /** Ruling standard — e.g. "Determined by CoinGecko price on Dec 31" */
  rule?: string;
  /** Stake amount in wei */
  wager: bigint;
  /** Duration in seconds from now */
  duration: number;
  /** Public or private duel */
  visibility?: Visibility;
  /** Audience pool fee in BPS (e.g. 100 = 1%). Default 0 */
  audioBps?: number;
  /** ERC20 token address. Leave empty for native token (MNT/BNB) */
  token?: `0x${string}`;
}

export interface AcceptDuelParams {
  duelId: bigint;
}

export interface CancelDuelParams {
  duelId: bigint;
}

export interface ClaimParams {
  duelId: bigint;
}

// ── SDK config ─────────────────────────────────────────────────

export interface VerdictProtocolConfig {
  /** Target chain */
  chain: SupportedChain;
  /** viem WalletClient — required for write operations */
  walletClient?: WalletClient;
  /** viem PublicClient — required for read operations */
  publicClient?: PublicClient;
}
