import { keccak256, toBytes, encodeAbiParameters, parseAbiParameters } from 'viem';

/**
 * Hash a plain text string to bytes32 for on-chain storage
 */
export function hashText(text: string): `0x${string}` {
  return keccak256(toBytes(text));
}

/**
 * Hash claim + rule together for a duel
 */
export function hashClaim(claim: string, rule: string): `0x${string}` {
  return keccak256(
    encodeAbiParameters(
      parseAbiParameters('string claim, string rule'),
      [claim, rule]
    )
  );
}

/**
 * Convert seconds duration to deadline timestamp
 */
export function durationToDeadline(durationSeconds: number): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + durationSeconds);
}

/**
 * Format a duel status to human-readable string
 */
export function formatStatus(status: number): string {
  const map: Record<number, string> = {
    0: 'Open',
    1: 'Active',
    2: 'Settled',
    3: 'Disputed',
    4: 'Cancelled',
  };
  return map[status] ?? 'Unknown';
}

/**
 * Format a duel side to human-readable string
 */
export function formatSide(side: number): string {
  const map: Record<number, string> = { 0: 'None', 1: 'Red', 2: 'Blue' };
  return map[side] ?? 'Unknown';
}
