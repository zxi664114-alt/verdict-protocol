import { WalletClient, PublicClient, Hash } from 'viem';

declare const CONTRACT_ADDRESSES: {
    readonly bscTestnet: `0x${string}`;
    readonly mantleSepolia: `0x${string}`;
};
type SupportedChain = keyof typeof CONTRACT_ADDRESSES;
declare const CHAIN_IDS: Record<SupportedChain, number>;
declare const NATIVE_TOKEN: `0x${string}`;

declare enum DuelStatus {
    Open = 0,
    Active = 1,
    Settled = 2,
    Disputed = 3,
    Cancelled = 4
}
declare enum DuelSide {
    None = 0,
    Red = 1,
    Blue = 2
}
declare enum Visibility {
    Public = 0,
    Private = 1
}
interface Duel {
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
interface CreateDuelParams {
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
interface AcceptDuelParams {
    duelId: bigint;
}
interface CancelDuelParams {
    duelId: bigint;
}
interface ClaimParams {
    duelId: bigint;
}
interface VerdictProtocolConfig {
    /** Target chain */
    chain: SupportedChain;
    /** viem WalletClient — required for write operations */
    walletClient?: WalletClient;
    /** viem PublicClient — required for read operations */
    publicClient?: PublicClient;
}

declare class VerdictProtocol {
    private chain;
    private contractAddress;
    private walletClient?;
    private publicClient?;
    constructor(config: VerdictProtocolConfig);
    private getPublicClient;
    private getWalletClient;
    getDuel(duelId: bigint): Promise<Duel>;
    getDuelCount(): Promise<bigint>;
    getPools(duelId: bigint): Promise<{
        red: bigint;
        blue: bigint;
    }>;
    hasClaimed(duelId: bigint, address: `0x${string}`): Promise<boolean>;
    createDuel(params: CreateDuelParams): Promise<Hash>;
    acceptDuel(params: AcceptDuelParams): Promise<Hash>;
    cancelDuel(params: CancelDuelParams): Promise<Hash>;
    claimWinnings(params: ClaimParams): Promise<Hash>;
    getContractAddress(): `0x${string}`;
    getChain(): SupportedChain;
}

declare const PROTOCOL_BET_ABI: readonly [{
    readonly name: "counter";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "getDuel";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "red";
            readonly type: "address";
        }, {
            readonly name: "blue";
            readonly type: "address";
        }, {
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly name: "wager";
            readonly type: "uint256";
        }, {
            readonly name: "audioBps";
            readonly type: "uint256";
        }, {
            readonly name: "deadline";
            readonly type: "uint256";
        }, {
            readonly name: "claimHash";
            readonly type: "bytes32";
        }, {
            readonly name: "ruleHash";
            readonly type: "bytes32";
        }, {
            readonly name: "vis";
            readonly type: "uint8";
        }, {
            readonly name: "status";
            readonly type: "uint8";
        }, {
            readonly name: "winner";
            readonly type: "uint8";
        }, {
            readonly name: "settledAt";
            readonly type: "uint256";
        }];
    }];
}, {
    readonly name: "poolRed";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "poolBlue";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "betRed";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }, {
        readonly name: "addr";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "betBlue";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }, {
        readonly name: "addr";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "claimed";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }, {
        readonly name: "addr";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
}, {
    readonly name: "create";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly name: "wager";
        readonly type: "uint256";
    }, {
        readonly name: "audioBps";
        readonly type: "uint256";
    }, {
        readonly name: "duration";
        readonly type: "uint256";
    }, {
        readonly name: "claimHash";
        readonly type: "bytes32";
    }, {
        readonly name: "ruleHash";
        readonly type: "bytes32";
    }, {
        readonly name: "vis";
        readonly type: "uint8";
    }];
    readonly outputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }];
}, {
    readonly name: "accept";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "bet";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }, {
        readonly name: "side";
        readonly type: "uint8";
    }, {
        readonly name: "amt";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "claim";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "cancel";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "dispute";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "settle";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }, {
        readonly name: "winner";
        readonly type: "uint8";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "Created";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "red";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "token";
        readonly type: "address";
        readonly indexed: false;
    }, {
        readonly name: "wager";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}, {
    readonly name: "Accepted";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "blue";
        readonly type: "address";
        readonly indexed: true;
    }];
}, {
    readonly name: "Settled";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "winner";
        readonly type: "uint8";
        readonly indexed: false;
    }];
}, {
    readonly name: "Claimed";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "bettor";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "amt";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}];

/**
 * Hash a plain text string to bytes32 for on-chain storage
 */
declare function hashText(text: string): `0x${string}`;
/**
 * Hash claim + rule together for a duel
 */
declare function hashClaim(claim: string, rule: string): `0x${string}`;
/**
 * Convert seconds duration to deadline timestamp
 */
declare function durationToDeadline(durationSeconds: number): bigint;
/**
 * Format a duel status to human-readable string
 */
declare function formatStatus(status: number): string;
/**
 * Format a duel side to human-readable string
 */
declare function formatSide(side: number): string;

export { type AcceptDuelParams, CHAIN_IDS, CONTRACT_ADDRESSES, type CancelDuelParams, type ClaimParams, type CreateDuelParams, type Duel, DuelSide, DuelStatus, NATIVE_TOKEN, PROTOCOL_BET_ABI, VerdictProtocol, type VerdictProtocolConfig, Visibility, durationToDeadline, formatSide, formatStatus, hashClaim, hashText };
