export const classicalDocs = [
  {
    id: 'manifesto', title: 'The other side of quantum', label: 'The idea',
    paragraphs: [
      'Classical is the counterpoint to quantum-themed promises: definite bits, inspectable steps, and computation you can run right now. Launch a token, examine its permissions, and use its public identity as the starting point for a working laboratory.',
      '“Opposite of quantum” is our creative positioning, not a claim about physics. Classical and quantum computing are different computational models, not enemies. Quantum computers are real, and classical machines can simulate small quantum systems. Neither model is universally superior.',
    ],
    bullets: ['Our promise: show the input, run the computation, expose the result.', 'Our boundary: no quantum hardware, quantum advantage, or quantum-proof token claims.'],
  },
  {
    id: 'bits-and-qubits', title: 'Bits, qubits, and what actually changes', label: 'The science',
    paragraphs: [
      'Classical computation stores and processes definite binary values: 0 or 1. It supports parallelism, probabilistic algorithms, cryptography, networks, and enormous simulations. “Classical” does not mean slow or primitive.',
      'A qubit has quantum-state amplitudes. Gates transform those amplitudes, and measurement produces a classical result according to their squared magnitudes. Superposition is not a way to read every possible answer at once. Useful quantum algorithms use structure and interference to make particular outcomes more likely.',
      'Entanglement is a property of joint quantum states that cannot be described as independent states of their parts. Our current one-qubit simulator does not demonstrate entanglement. Quantum speedups apply to particular problems and depend on algorithms, hardware, error correction, and comparisons against the best classical methods.',
    ], bullets: [],
  },
  {
    id: 'launch', title: 'What a launch actually creates', label: 'On Solana',
    paragraphs: [
      'The current launcher creates a standalone SPL token on Solana mainnet using the legacy Token Program. Your connected wallet signs and pays the transaction. Every launch has a fixed supply of 1,000,000,000 tokens with 9 decimals; the full supply is minted to your associated token account.',
      'The creation transaction starts without a freeze authority and revokes mint authority after minting. A separate wallet message authorizes the public registry record. The server checks the launch transaction before recording the mint, creator, signature, and display labels.',
      'The name and ticker are registry labels, not on-chain token metadata. Creating a token does not create demand, a market price, a trading pool, or liquidity. This launcher is not currently a pump.fun launch or bonding curve.',
    ], bullets: ['Launching costs real SOL for rent and transaction fees.', 'If confirmation or registration is interrupted, keep the receipt and retry recording—do not blindly launch again.', 'The lab appears after successful registration and is also available on the token workspace. No second paid transaction is needed for experiments.'],
  },
  {
    id: 'token-lab', title: 'Every token gets a laboratory', label: 'The experience',
    paragraphs: [
      'Registered launches use their mint and creation transaction signature as fingerprint inputs. Unregistered token workspaces use the mint with an explicit “unregistered” marker. The docs playground uses a visibly labeled demo input. An external mint appearing in the lab is not proof that it exists on-chain or was launched here.',
      'The browser hashes the exact UTF-8 input with SHA-256. The resulting 256 bits become a 16-by-16 matrix: filled squares are 1 and empty squares are 0. This is a view of real output data, not a randomly assigned rarity trait.',
      'The fingerprint input is versioned and domain-separated. It contains the literal prefix classical:token-lab:v1, a newline, mint: followed by the mint string, another newline, and transaction: followed by the signature or unregistered. There is no trailing newline. Expand “Inspect exact fingerprint input” or download the experiment to reproduce it.',
    ], bullets: ['Same exact input → same fingerprint. A different registered signature changes the input.', 'The experiment is computed in your browser, not written into the token contract.', 'Gate interactions are temporary; the fingerprint can be regenerated after reload.'],
  },
  {
    id: 'avalanche', title: 'One bit in. A different pattern out.', label: 'Experiment / hashing',
    paragraphs: [
      'Press “Flip one input bit” to XOR the first UTF-8 input byte with 0x01, changing exactly one bit. We hash both byte sequences and count how many of the 256 output bits differ. Outlined squares identify those changed positions.',
      'A well-designed cryptographic hash typically changes roughly half its output bits when an input bit changes, across many inputs. A single experiment is not expected to change exactly 128 bits, and its result is not an audit, rarity score, or proof of investment value.',
      '“Download experiment” exports the exact original input, both digests, mutation method, changed-bit count, and provenance label as JSON. It is a locally generated unsigned report, not a signed on-chain certificate. A matching hash checks consistency with the input; it does not prove ownership or authenticity by itself.',
    ], bullets: ['Restoring the original input restores the original digest.', 'The mutated bytes do not replace your actual mint address or transaction.'],
  },
  {
    id: 'quantum-sandbox', title: 'Make quantum behavior visible', label: 'Experiment / simulation',
    paragraphs: [
      'The first fingerprint bit initializes a single simulated qubit to the corresponding basis state. The browser tracks two real amplitudes; this is sufficient for the H, X, and Z gates offered here, but it is not a general-purpose complex-amplitude quantum simulator.',
      'H (Hadamard) mixes amplitudes, X swaps them, and Z changes the sign of the amplitude for outcome 1. A phase change may leave probabilities unchanged until a later gate makes the interference visible.',
      '“Measure” samples the displayed probabilities using browser cryptographic randomness and collapses the simulated state to the result. Repeated measurement then returns that state unless you apply more gates. Browser randomness is not evidence of a physical quantum random-number source.',
    ], bullets: ['Reset → H: equal 50% measurement probabilities.', 'Reset → H → H: restore the starting bit.', 'Reset → H → Z → H: interference flips the starting bit.', 'Measurement changes only the simulator. No token burn, mint, payout, trade, or on-chain randomness is involved.'],
  },
  {
    id: 'security', title: 'Classical does not mean quantum-proof', label: 'Security limits',
    paragraphs: [
      'Solana uses Ed25519 signatures. A sufficiently capable fault-tolerant quantum computer running Shor’s algorithm would threaten elliptic-curve signature systems. Adding a hash image or a simulator does not change the signature scheme or make a token post-quantum secure.',
      'Post-quantum cryptography runs on classical computers and is designed to resist known classical and quantum attacks. NIST’s 2024 standards include ML-KEM for key establishment and ML-DSA and SLH-DSA for signatures. Classical does not integrate these standards into Solana transaction authorization.',
      'The scanner reports supported on-chain facts and permissions, not a comprehensive audit. Revoked mint authority does not imply fair distribution, safe markets, locked liquidity, honest developers, or guaranteed value. Registry verification and experiment reports are different things; neither is financial advice.',
    ], bullets: [],
  },
  {
    id: 'toolkit', title: 'Keep experimenting', label: 'The toolkit',
    paragraphs: [
      'Use the Security Scanner to inspect current mint permissions. Open the Compute terminal for SHA-256, binary encoding, sorting, prime sieves, Merkle trees, and an AES-GCM round trip. The Proof Engine provides cryptographic verification tools. These are demonstrations and checks with explicit inputs and outputs, not autonomous token utilities.',
      'Quantum circuits in this app never execute on quantum hardware. Experiments do not run continuously after you close the page and do not automatically reward holders. Token issuance, on-chain inspection, and educational simulation are separate systems.',
    ], bullets: [],
  },
] as const

export const classicalSources = [
  { title: 'IBM: Quantum computing and classical computing', url: 'https://www.ibm.com/think/topics/quantum-computing' },
  { title: 'NIST: First three finalized post-quantum standards (2024)', url: 'https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards' },
  { title: 'Solana documentation', url: 'https://solana.com/docs' },
]
