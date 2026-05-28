export { VerdictProtocol } from './VerdictProtocol';
export { PROTOCOL_BET_ABI } from './contracts/abi';
export { CONTRACT_ADDRESSES, CHAIN_IDS, NATIVE_TOKEN } from './contracts/addresses';
export { DuelStatus, DuelSide, Visibility } from './types';
export type {
  Duel,
  CreateDuelParams,
  AcceptDuelParams,
  CancelDuelParams,
  ClaimParams,
  VerdictProtocolConfig,
} from './types';
export { hashText, hashClaim, durationToDeadline, formatStatus, formatSide } from './utils';
