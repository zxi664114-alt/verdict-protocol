<div align="center">

# ⚖️ Verdict Protocol

**The On-Chain Wager Protocol with AI Judge**
*链上对赌协议，AI 法官裁定*

[![Live](https://img.shields.io/badge/🌐_Live-verdictprotocol.online-7C3AED?style=for-the-badge)](https://www.verdictprotocol.online)
[![Mantle](https://img.shields.io/badge/Mantle_Sepolia-Deployed-00D395?style=for-the-badge&logo=ethereum)](https://sepolia.mantlescan.xyz/address/0xE731a80668Ad0439a6B55e57f65C1D7885827566)
[![BNB](https://img.shields.io/badge/BNB_Testnet-Deployed-F0B90B?style=for-the-badge&logo=binance)](https://testnet.bscscan.com/address/0xa0A997cF05F7Baf21becEA4130209fD7C7D1A994)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.23-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org)
[![DeepSeek](https://img.shields.io/badge/AI-DeepSeek-4A90E2?style=for-the-badge)](https://deepseek.com)
[![Telegram](https://img.shields.io/badge/Bot-@VerdictProtocol__Bot-26A5E4?style=for-the-badge&logo=telegram)](https://t.me/VerdictProtocol_Bot)

---

> *"Any two parties. Any verifiable outcome. AI decides."*
> *任意两方，任意可验证结果，AI 裁定。*

</div>

---

## 🎯 What Is Verdict Protocol? | 这是什么？

Verdict Protocol is an **AI-powered on-chain intelligence layer** built for real users — three products sharing one AI Judge core.

Verdict Protocol 是一套 **AI 驱动的链上智能基础层**，三个产品共享同一套 AI 法官内核。

| Product | Description |
|---------|-------------|
| 🔌 **Chrome Extension** | Plug-in AI risk analysis on DexScreener, GMGN, four.meme, Ave.ai — any token, instantly |
| 🤖 **Telegram Bot** [@VerdictProtocol_Bot](https://t.me/VerdictProtocol_Bot) | Wallet intelligence across ETH, BNB Chain, Mantle — /scan /compare /whale /price /mantle /watch |
| ⚡ **Protocol Bet** | Decentralized 1v1 on-chain wager protocol — any two parties, any verifiable outcome, settled by AI Judge |

**Without a trusted third party. Without counterparty risk. Settled automatically by an AI Judge.**
*无需可信第三方，无对手方风险，由 AI 法官自动结算。*

---

## 🏗️ Architecture Overview | 架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                       VERDICT PROTOCOL                          │
├──────────────┬──────────────┬────────────┬──────────────────────┤
│  Protocol    │  AI Judge    │  TG Bot    │  Chrome Extension    │
│  Bet dApp    │  Agent       │  @VPBot    │  (DexScreener/GMGN   │
│  (Next.js)   │  (4-Step)    │  (Python)  │   four.meme/Ave.ai)  │
├──────────────┴──────────────┴────────────┴──────────────────────┤
│              Upstash KV  |  Vercel  |  DeepSeek API             │
├─────────────────────────────────────────────────────────────────┤
│         Mantle Sepolia  ←→  BNB Testnet  (Multi-Chain)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚖️ Three-Layer Dispute Resolution | 三层争议解决机制

| Layer | Method | Description | 描述 |
|-------|--------|-------------|------|
| **Layer 1** | 🤝 Mutual Settlement | Both parties agree → instant payout | 双方共识 → 直接打款 |
| **Layer 2** | 🤖 AI Judge | Submit evidence → 4-step AI analysis → auto-settle | 提交证据 → AI 4步分析 → 自动结算 |
| **Layer 3** | ⏰ Auto-Ruling *(Phase 2)* | Cron job rules expired duels automatically | 定时任务自动裁定过期对决 |

---

## 🤖 AI Judge Agent | AI 法官 Agent

The AI Judge is a **4-step Chain-of-Thought agent** powered by DeepSeek LLM, designed to rule on any type of dispute.

```
Step 1: Case Analysis      → Dispute type + verifiable conditions
        案件解析            → 争议类型 + 可验证条件

Step 2: Evidence Review    → Fetch links + credibility scoring (0-5)
        证据审查            → 抓取链接内容 + 可信度评分（0-5）

Step 3: Condition Analysis → Cross-reference evidence vs ruling standard
        条件分析            → 证据与裁定标准交叉对比

Step 4: Final Ruling       → Weighted score + confidence + auto-settle
        最终裁定            → 加权得分 + 置信度 + 自动结算
```

**Evidence Credibility Hierarchy | 证据可信度分级:**
```
Level 5 ██████  On-chain transaction data | 链上交易数据
Level 4 █████░  Official announcements    | 官方公告
Level 3 ████░░  3rd-party data (CoinGecko, DeFiLlama) | 第三方数据
Level 2 ███░░░  Social media links        | 社交媒体链接
Level 1 ██░░░░  Text description only     | 纯文字描述
Level 0 ░░░░░░  Subjective claims → IGNORED | 主观声明 → 忽略
```

> Auto-settles on-chain when confidence ≥ 50%. Returns `Insufficient` when evidence is too weak.
> 置信度 ≥ 50% 时自动链上结算，证据不足时返回「证据不足」。

---

## 🔗 Smart Contract | 智能合约

### Deployments | 部署信息

| Network | Address | Explorer |
|---------|---------|----------|
| Mantle Sepolia | `0xE731a80668Ad0439a6B55e57f65C1D7885827566` | [View ↗](https://sepolia.mantlescan.xyz/address/0xE731a80668Ad0439a6B55e57f65C1D7885827566) |
| BNB Testnet | `0xa0A997cF05F7Baf21becEA4130209fD7C7D1A994` | [View ↗](https://testnet.bscscan.com/address/0xa0A997cF05F7Baf21becEA4130209fD7C7D1A994) |

### Core Functions | 核心函数

```solidity
// Create a new duel | 发起对决
function createDuel(bytes32 claimHash, bytes32 ruleHash, address token,
                    uint256 wager, uint64 deadline, Vis vis, uint16 audioBps) external payable

// Accept a challenge | 接受挑战
function accept(uint256 id) external payable

// Layer 1: Mutual settlement | 第一层：共识结算
function mutualSettle(uint256 id, Side claimedWinner) external

// Layer 2/3: Judge settles | 第二/三层：法官结算
function settle(uint256 id, Side winner) external  // onlyJudge

// Cancel unmatched duel (refund) | 取消未匹配对决（退款）
function cancel(uint256 id) external
```

### Economics | 经济模型

```
Protocol Fee:   2% (200 BPS)     协议手续费：2%
Winner Payout:  wager × 2 × 98%  胜方获得：押注 × 2 × 98%
Dispute Window: 48 hours          争议窗口：48 小时
```

---

## 🛠️ Tech Stack | 技术栈

<table>
<tr>
<td>

**Frontend | 前端**
- Next.js 16 (Turbopack)
- React 19 + TypeScript
- wagmi + RainbowKit + viem
- Tailwind CSS

</td>
<td>

**Backend | 后端**
- Vercel (API Routes)
- Upstash KV (Redis)
- DeepSeek API (AI Judge)
- Moralis API (Wallet data)

</td>
<td>

**Contract | 合约**
- Solidity 0.8.23
- Mantle Sepolia
- BNB Testnet

</td>
<td>

**Bot | 机器人**
- Python 3.x
- python-telegram-bot 20.7
- aiohttp
- Railway (hosting)

</td>
</tr>
</table>

---

## 📁 Repository Structure | 仓库结构

```
verdict-protocol/
├── protocol-bet/                      # Main Next.js dApp | 主应用
│   ├── src/app/
│   │   ├── page_client.tsx            # Main UI | 主界面
│   │   ├── verdict/[chainId]/[duelId] # AI Ruling detail page | 裁定详情页
│   │   └── api/
│   │       ├── duels/route.ts         # Multi-chain duel fetcher | 多链对决拉取
│   │       ├── evidence/route.ts      # Evidence storage | 证据存储
│   │       ├── judge/route.ts         # AI 4-step agent | AI 4步 Agent
│   │       └── notify/route.ts        # TG notifications | TG 通知
│   └── src/lib/
│       ├── contract.ts                # Contract addresses + ABI
│       └── hooks.ts                   # wagmi hooks
├── bot/                               # Telegram Bot | TG 机器人
│   ├── bot.py
│   └── requirements.txt
├── extension/                         # Chrome Extension | 浏览器插件
├── packages/
│   └── sdk/                           # @verdict-protocol/sdk (WIP)
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Quick Start | 快速开始

### Run dApp locally | 本地运行

```bash
git clone https://github.com/lant1ng-1216/verdict-protocol
cd verdict-protocol/protocol-bet
npm install
cp .env.example .env.local  # Add your env vars
npm run dev
```

### Environment Variables | 环境变量

```env
KV_REST_API_URL=        # Upstash Redis URL
KV_REST_API_TOKEN=      # Upstash token
DEEPSEEK_API_KEY=       # DeepSeek API key
JUDGE_PRIVATE_KEY=      # Judge wallet private key (for auto-settle)
TELEGRAM_BOT_TOKEN=     # Telegram bot token
```

### Run Telegram Bot | 运行 TG Bot

```bash
cd bot
pip install -r requirements.txt
python bot.py
```

---

## 🤖 Telegram Bot Commands | TG 机器人指令

**[@VerdictProtocol_Bot](https://t.me/VerdictProtocol_Bot)**

| Command | Description | 功能 |
|---------|-------------|------|
| `/scan <address>` | AI wallet analysis | AI 钱包分析 |
| `/compare <addr1> <addr2>` | Head-to-head comparison | 双钱包对比 |
| `/whale [bnb\|mantle]` | Whale activity tracker | 巨鲸追踪 |
| `/price <token>` | Token price + 24h change | 代币价格 |
| `/mantle` | Mantle ecosystem live data | Mantle 生态数据 |
| `/watch <address>` | Watch wallet + duel alerts | 监控钱包 + 对决通知 |

---

## 🗺️ Roadmap | 路线图

### ✅ Phase 1 — Testnet (Current | 当前)
- [x] Smart contract deployed (Mantle Sepolia + BNB Testnet)
- [x] Full dApp UI with bilingual support
- [x] Chrome Extension (DexScreener / GMGN / four.meme / Ave.ai)
- [x] Layer 1: Mutual settlement
- [x] Layer 2: Evidence + AI 4-step judge agent
- [x] AI verdict detail page
- [x] Telegram Bot (6 core commands, multi-chain)
- [x] Share cards, BeamAvatar, Prize Pool USD display

### 🔨 Phase 1.5 — Verdict Score (Next | 下一版本)
- [ ] KOL on-chain credit scoring system
- [ ] Anyone can submit a KOL prediction as on-chain evidence (timestamped)
- [ ] AI Judge auto-rules on expiry — result permanently on-chain
- [ ] Public score page per KOL / address: accuracy rate, confidence calibration, time dimension
- [ ] Bot command: `/score @KOL` or `/score <address>`

### 📋 Phase 2 — Mainnet
- [ ] Mainnet deployment (Mantle + BNB Chain)
- [ ] Layer 3: Cron-based auto-ruling
- [ ] Audience pool (spectator betting)
- [ ] TG account binding
- [ ] Image / PDF evidence upload
- [ ] ERC20 token support as wager currency

### 📋 Phase 3 — Expansion
- [ ] `@verdict-protocol/sdk` — npm SDK for third-party dApp integration
- [ ] REST API — open AI Judge as callable infrastructure
- [ ] Multi-chain expansion (Arbitrum, Base, Optimism)
- [ ] VERDICT governance token
- [ ] Mobile app

---

## 💡 Use Cases | 使用场景

```
🪙 Crypto       "BTC will hit $150K by EOY"
🥊 KOL vs KOL   "My market call will outperform yours in 30 days"
🏘️ Community    "Mantle TVL will surpass Arbitrum by Q3"
🏢 Business     "Our product will ship before yours"
👫 Personal     "I'll lose 20 lbs before you finish your book"
```

---

## ⚡ Competitive Advantage | 竞争优势

| | Verdict Protocol | Polymarket | Augur |
|--|:--:|:--:|:--:|
| Any topic (not just markets) | ✅ | ❌ | ❌ |
| Peer-to-peer 1v1 | ✅ | ❌ | ❌ |
| AI Judge | ✅ | ❌ | ❌ |
| No centralized arbitrator | ✅ | ❌ | ✅ |
| Social / personal bets | ✅ | ❌ | ❌ |
| TG Bot integration | ✅ | ❌ | ❌ |
| Chrome Extension | ✅ | ❌ | ❌ |
| Trustless settlement | ✅ | ✅ | ✅ |

---

## 🏆 Milestones | 里程碑

- 🥇 **four.meme AI Sprint** — Top 10 finalist out of 196 projects, Community Award
- 🔨 **Mantle Hackathon 2026** — Protocol Bet deployed on Mantle Sepolia

---

## 📄 License

MIT License — see [LICENSE](./LICENSE)

---

<div align="center">

**Built for Mantle Hackathon 2026**

[![Website](https://img.shields.io/badge/🌐_Website-verdictprotocol.online-7C3AED?style=for-the-badge)](https://www.verdictprotocol.online)
[![Telegram](https://img.shields.io/badge/💬_Bot-@VerdictProtocol__Bot-26A5E4?style=for-the-badge)](https://t.me/VerdictProtocol_Bot)
[![Twitter](https://img.shields.io/badge/🐦_Twitter-@yundan1216-1DA1F2?style=for-the-badge)](https://x.com/yundan1216)
[![DoraHacks](https://img.shields.io/badge/🏆_DoraHacks-Submission-FF6B35?style=for-the-badge)](https://dorahacks.io/buidl/29128)

*⚖️ Any two parties. Any verifiable outcome. AI decides.*

</div>
