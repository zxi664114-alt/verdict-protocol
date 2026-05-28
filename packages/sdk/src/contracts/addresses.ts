export const CONTRACT_ADDRESSES = {
  bscTestnet: '0xa0A997cF05F7Baf21becEA4130209fD7C7D1A994' as `0x${string}`,
  mantleSepolia: '0xE731a80668Ad0439a6B55e57f65C1D7885827566' as `0x${string}`,
} as const;

export type SupportedChain = keyof typeof CONTRACT_ADDRESSES;

export const CHAIN_IDS: Record<SupportedChain, number> = {
  bscTestnet: 97,
  mantleSepolia: 5003,
};

export const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000' as `0x${string}`;
