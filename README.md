# CLASSICAL — The Anti-Quantum Crypto Launchpad

**Quantum promises the future. Classical proves the present.**

Classical is a Solana token launch interface and hands-on computing laboratory built with Next.js, TypeScript, and Neon Postgres. It is a counterpoint to quantum-themed crypto hype: rather than selling the idea that a token magically delivers quantum protection, Classical puts real, inspectable computation and on-chain verification in front of users.

> **Bits over buzzwords. Proof over promises. Launch. Compute. Verify.**

## Why anti-quantum?

The **anti-quantum** label describes our approach to marketing and product design, **not** opposition to scientific progress. Quantum computers are a legitimate research field. But attaching “quantum” to a coin does not make its blockchain quantum-powered, quantum-resistant, or more secure.

Classical computing is what powers cryptocurrency infrastructure today: conventional processors execute wallet software, blockchain nodes validate transactions, and well-understood cryptographic algorithms secure digital signatures and hashes. Classical celebrates that working foundation and makes it visible.

### Classical vs. quantum-themed crypto

| | Quantum-themed crypto narrative | Classical approach |
| --- | --- | --- |
| Core story | Future possibilities of quantum computing | The classical computing that runs networks today |
| Computing model | Qubits and quantum algorithms | Bits, conventional processors, and classical algorithms |
| Product demonstration | Claims may depend on future research | Interactive hashing, encryption, Merkle trees, and blockchain inspection |
| Security messaging | A quantum label alone proves nothing | Inspect transactions, signatures, and token authorities |
| Accountability | Evaluate each project's actual implementation | Show what is implemented and disclose what is not |

**Why this can be a better approach for crypto:** users can examine what software does *now*, verify public chain data, and distinguish technical functionality from speculative branding. That makes for clearer expectations and a more useful learning experience. It does **not** mean Classical tokens are automatically safer investments, that classical algorithms outperform quantum algorithms at every task, or that conventional cryptography is immune to future quantum attacks.

## The Classical philosophy

1. **Real code over invented protection.** Demonstrate working algorithms instead of implying a token name provides security.
2. **Verify instead of trust.** Give users tools to inspect public transaction and mint information.
3. **Teach the foundations.** Explore binary, hashing, encryption, prime numbers, sorting, and Merkle trees.
4. **Launch transparently.** Explain token supply, authority settings, signing, and exactly which launch mechanics exist.
5. **Stay scientifically accurate.** Quantum research is real; post-quantum cryptography is important. “Anti-quantum” is our anti-hype stance, not a security certification.

## What Classical does today

- **Launch:** Create a standalone Solana SPL token through a wallet-signed flow.
- **Proof:** Inspect cryptographic transaction-signature verification.
- **Scanner:** Examine token mint and authority information using Solana RPC.
- **Terminal:** Run interactive classical-computing demonstrations locally in the browser.
- **Explore:** Compare classical and quantum computing concepts.
- **Discover:** Browse public launch records and Solana market information.

**Important:** This project is not quantum-resistant by virtue of its name or these demonstrations. Any future post-quantum security feature would require a specific, independently reviewable cryptographic implementation.

---

## Current launch behavior

**The current implementation creates standalone SPL tokens, not pump.fun coins.** A fixed supply does not make a token a pump.fun launch. Integration with pump.fun's creation program, bonding curve, and graduation is not implemented.

- Supply is set automatically to **1,000,000,000 tokens**. There is no supply input.
- The current SPL implementation uses 9 decimals. This is not a claim about pump.fun's mint configuration.
- The connected wallet pays the network fees and account rent, signs creation, and receives the initial supply.
- Creation revokes mint authority and sets no freeze authority.
- A separate signed message authorizes the public launch record without transferring assets.
- Before storing a record, the server checks the transaction, creator signature, mint initialization, fixed minted amount, decimals, and authority state.
- No liquidity pool or bonding curve is created. A funded launch has not been executed as part of automated testing.

Supply constants live in `lib/launch-record.ts` and are shared by the client transaction builder and server verification. Existing on-chain tokens are not changed by a code update.

## Features

| Route | Purpose |
| --- | --- |
| `/` | Control-center homepage |
| `/launch` | Wallet-signed SPL token creation |
| `/discover` | Public launch records and live Solana market search |
| `/token/[mint]` | Individual launch proof record |
| `/scanner` | RPC-backed mint and authority inspection |
| `/proof` | Cryptographic transaction-signature verification |
| `/terminal` | Browser-worker hashing, encryption, sorting, primes, binary conversion, and Merkle trees |
| `/explore` | Interactive classical-versus-quantum computing exhibit |

## Architecture

- Next.js App Router and React for the site and server API routes.
- Solana wallet adapters for wallet connection and signing. Wallet private keys stay in the wallet.
- Solana public mainnet RPC for chain reads and transaction submission.
- Neon Postgres with Drizzle for public launch records and shared API rate limits.
- SWR for client data fetching and refreshes.
- Web Workers and Web Crypto for local computation.
- DexScreener for external market data.

`app/api/launches/route.ts` verifies and stores public launch records. `lib/db/schema.ts` defines the `launches` and `api_limits` tables. Connecting a different database does not automatically create these tables; provision the matching schema before using the API routes. Database contents and credentials are not included in this repository.

## Configuration and deployment

Use the GitHub repository to import the project into Vercel, or connect it through v0's Git settings. The package manager is pnpm, and the build command is `pnpm build`.

The server requires `DATABASE_URL`, supplied by the Neon integration or configured in project environment variables. Never commit the actual value. No server-side wallet secret is required.

Available scripts:

- `pnpm dev` — local development.
- `pnpm build` — production compilation.
- `pnpm start` — serve the production build.
- `pnpm test` — regression tests.

## Limitations and safety

Public RPC endpoints can rate-limit or block methods. Unsupported scanner checks are displayed as unknown rather than inferred safe. Inspection results are not a security audit or an investment recommendation. Token names and symbols do not establish authenticity; verify mint addresses.

The repository excludes environment files, dependency folders, build output, and private v0 context. A GitHub upload copies application source, not the Neon database or Vercel environment configuration.
