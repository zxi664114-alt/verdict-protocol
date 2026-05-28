"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CHAIN_IDS: () => CHAIN_IDS,
  CONTRACT_ADDRESSES: () => CONTRACT_ADDRESSES,
  DuelSide: () => DuelSide,
  DuelStatus: () => DuelStatus,
  NATIVE_TOKEN: () => NATIVE_TOKEN,
  PROTOCOL_BET_ABI: () => PROTOCOL_BET_ABI,
  VerdictProtocol: () => VerdictProtocol,
  Visibility: () => Visibility,
  durationToDeadline: () => durationToDeadline,
  formatSide: () => formatSide,
  formatStatus: () => formatStatus,
  hashClaim: () => hashClaim,
  hashText: () => hashText
});
module.exports = __toCommonJS(index_exports);

// src/contracts/abi.ts
var PROTOCOL_BET_ABI = [
  // ── READ ──
  {
    name: "counter",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "getDuel",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{
      name: "",
      type: "tuple",
      components: [
        { name: "red", type: "address" },
        { name: "blue", type: "address" },
        { name: "token", type: "address" },
        { name: "wager", type: "uint256" },
        { name: "audioBps", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "claimHash", type: "bytes32" },
        { name: "ruleHash", type: "bytes32" },
        { name: "vis", type: "uint8" },
        { name: "status", type: "uint8" },
        { name: "winner", type: "uint8" },
        { name: "settledAt", type: "uint256" }
      ]
    }]
  },
  {
    name: "poolRed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "poolBlue",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "betRed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }, { name: "addr", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "betBlue",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }, { name: "addr", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "claimed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }, { name: "addr", type: "address" }],
    outputs: [{ name: "", type: "bool" }]
  },
  // ── WRITE ──
  {
    name: "create",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "token", type: "address" },
      { name: "wager", type: "uint256" },
      { name: "audioBps", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "claimHash", type: "bytes32" },
      { name: "ruleHash", type: "bytes32" },
      { name: "vis", type: "uint8" }
    ],
    outputs: [{ name: "id", type: "uint256" }]
  },
  {
    name: "accept",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: []
  },
  {
    name: "bet",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "side", type: "uint8" },
      { name: "amt", type: "uint256" }
    ],
    outputs: []
  },
  {
    name: "claim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: []
  },
  {
    name: "cancel",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: []
  },
  {
    name: "dispute",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: []
  },
  {
    name: "settle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "winner", type: "uint8" }
    ],
    outputs: []
  },
  // ── EVENTS ──
  {
    name: "Created",
    type: "event",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "red", type: "address", indexed: true },
      { name: "token", type: "address", indexed: false },
      { name: "wager", type: "uint256", indexed: false }
    ]
  },
  {
    name: "Accepted",
    type: "event",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "blue", type: "address", indexed: true }
    ]
  },
  {
    name: "Settled",
    type: "event",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "winner", type: "uint8", indexed: false }
    ]
  },
  {
    name: "Claimed",
    type: "event",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "bettor", type: "address", indexed: true },
      { name: "amt", type: "uint256", indexed: false }
    ]
  }
];

// src/contracts/addresses.ts
var CONTRACT_ADDRESSES = {
  bscTestnet: "0xa0A997cF05F7Baf21becEA4130209fD7C7D1A994",
  mantleSepolia: "0xE731a80668Ad0439a6B55e57f65C1D7885827566"
};
var CHAIN_IDS = {
  bscTestnet: 97,
  mantleSepolia: 5003
};
var NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";

// src/types.ts
var DuelStatus = /* @__PURE__ */ ((DuelStatus2) => {
  DuelStatus2[DuelStatus2["Open"] = 0] = "Open";
  DuelStatus2[DuelStatus2["Active"] = 1] = "Active";
  DuelStatus2[DuelStatus2["Settled"] = 2] = "Settled";
  DuelStatus2[DuelStatus2["Disputed"] = 3] = "Disputed";
  DuelStatus2[DuelStatus2["Cancelled"] = 4] = "Cancelled";
  return DuelStatus2;
})(DuelStatus || {});
var DuelSide = /* @__PURE__ */ ((DuelSide2) => {
  DuelSide2[DuelSide2["None"] = 0] = "None";
  DuelSide2[DuelSide2["Red"] = 1] = "Red";
  DuelSide2[DuelSide2["Blue"] = 2] = "Blue";
  return DuelSide2;
})(DuelSide || {});
var Visibility = /* @__PURE__ */ ((Visibility2) => {
  Visibility2[Visibility2["Public"] = 0] = "Public";
  Visibility2[Visibility2["Private"] = 1] = "Private";
  return Visibility2;
})(Visibility || {});

// src/utils.ts
var import_viem = require("viem");
function hashText(text) {
  return (0, import_viem.keccak256)((0, import_viem.toBytes)(text));
}
function hashClaim(claim, rule) {
  return (0, import_viem.keccak256)(
    (0, import_viem.encodeAbiParameters)(
      (0, import_viem.parseAbiParameters)("string claim, string rule"),
      [claim, rule]
    )
  );
}
function durationToDeadline(durationSeconds) {
  return BigInt(Math.floor(Date.now() / 1e3) + durationSeconds);
}
function formatStatus(status) {
  const map = {
    0: "Open",
    1: "Active",
    2: "Settled",
    3: "Disputed",
    4: "Cancelled"
  };
  return map[status] ?? "Unknown";
}
function formatSide(side) {
  const map = { 0: "None", 1: "Red", 2: "Blue" };
  return map[side] ?? "Unknown";
}

// src/VerdictProtocol.ts
var VerdictProtocol = class {
  constructor(config) {
    this.chain = config.chain;
    this.contractAddress = CONTRACT_ADDRESSES[config.chain];
    this.walletClient = config.walletClient;
    this.publicClient = config.publicClient;
  }
  getPublicClient() {
    if (!this.publicClient) {
      throw new Error("[VerdictProtocol] publicClient is required for read operations");
    }
    return this.publicClient;
  }
  getWalletClient() {
    if (!this.walletClient) {
      throw new Error("[VerdictProtocol] walletClient is required for write operations");
    }
    return this.walletClient;
  }
  // ── READ ────────────────────────────────────────────────────
  async getDuel(duelId) {
    const client = this.getPublicClient();
    const raw = await client.readContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: "getDuel",
      args: [duelId]
    });
    return { id: duelId, ...raw };
  }
  async getDuelCount() {
    const client = this.getPublicClient();
    return client.readContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: "counter"
    });
  }
  async getPools(duelId) {
    const client = this.getPublicClient();
    const [red, blue] = await Promise.all([
      client.readContract({
        address: this.contractAddress,
        abi: PROTOCOL_BET_ABI,
        functionName: "poolRed",
        args: [duelId]
      }),
      client.readContract({
        address: this.contractAddress,
        abi: PROTOCOL_BET_ABI,
        functionName: "poolBlue",
        args: [duelId]
      })
    ]);
    return { red, blue };
  }
  async hasClaimed(duelId, address) {
    const client = this.getPublicClient();
    return client.readContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: "claimed",
      args: [duelId, address]
    });
  }
  // ── WRITE ────────────────────────────────────────────────────
  async createDuel(params) {
    const wallet = this.getWalletClient();
    const [address] = await wallet.getAddresses();
    const token = params.token ?? NATIVE_TOKEN;
    const isNative = token === NATIVE_TOKEN;
    return wallet.writeContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: "create",
      args: [
        token,
        params.wager,
        BigInt(params.audioBps ?? 0),
        durationToDeadline(params.duration),
        hashText(params.claim),
        hashText(params.rule ?? params.claim),
        params.visibility ?? 0 /* Public */
      ],
      account: address,
      chain: wallet.chain ?? null,
      value: isNative ? params.wager : 0n
    });
  }
  async acceptDuel(params) {
    const wallet = this.getWalletClient();
    const [address] = await wallet.getAddresses();
    const duel = await this.getDuel(params.duelId);
    const isNative = duel.token === NATIVE_TOKEN;
    return wallet.writeContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: "accept",
      args: [params.duelId],
      account: address,
      chain: wallet.chain ?? null,
      value: isNative ? duel.wager : 0n
    });
  }
  async cancelDuel(params) {
    const wallet = this.getWalletClient();
    const [address] = await wallet.getAddresses();
    return wallet.writeContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: "cancel",
      args: [params.duelId],
      account: address,
      chain: wallet.chain ?? null
    });
  }
  async claimWinnings(params) {
    const wallet = this.getWalletClient();
    const [address] = await wallet.getAddresses();
    return wallet.writeContract({
      address: this.contractAddress,
      abi: PROTOCOL_BET_ABI,
      functionName: "claim",
      args: [params.duelId],
      account: address,
      chain: wallet.chain ?? null
    });
  }
  getContractAddress() {
    return this.contractAddress;
  }
  getChain() {
    return this.chain;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CHAIN_IDS,
  CONTRACT_ADDRESSES,
  DuelSide,
  DuelStatus,
  NATIVE_TOKEN,
  PROTOCOL_BET_ABI,
  VerdictProtocol,
  Visibility,
  durationToDeadline,
  formatSide,
  formatStatus,
  hashClaim,
  hashText
});
//# sourceMappingURL=index.js.map