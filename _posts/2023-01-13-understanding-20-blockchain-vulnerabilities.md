---
layout: posts/post
title: "Understanding 20 Blockchain Vulnerabilities"
date: 2023-01-13 00:00:00 +0000
categories: ["cybersecurity"]
tags: ["51-attacks", "blockchain"]
post_image: "/assets/images/writing/understanding-20-blockchain-vulnerabilities.webp"
description: "Twenty threat categories across consensus, networks, contracts, wallets, and governance—with concrete distinctions and defensive priorities."
permalink: "/understanding-20-blockchain-vulnerabilities/"
post_image_small: "/assets/images/writing/understanding-20-blockchain-vulnerabilities-640.webp"
post_image_medium: "/assets/images/writing/understanding-20-blockchain-vulnerabilities-960.webp"
image_width: 1600
image_height: 900
image_alt: "A blue inspection light reveals hairline gaps in a ring of connected graphite blocks."
image_caption: "Editorial illustration."
original_post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2023/01/generatedart_blockchain_attack_3ae5c706-8a16-4238-808a-32eef2f3db8b.png"
last_modified_at: 2026-11-22 12:00:00 +0000
---

A blockchain can preserve an agreed transaction history while the application built around it still fails. A stolen signing key, a manipulated price feed, and a consensus attack are different failures. They expose different assets and require different defenses.

This guide retains twenty threat categories, but they are not twenty independent defects in every blockchain. Some overlap; others concern applications, network infrastructure, or human decisions. The aim is to identify **which assumption an attacker would have to break**, then choose a control that addresses that assumption.

## Reading the threat model {#contents}

Start by naming the chain, application, participants, and assets under review. A proof-of-work network, a proof-of-stake network, and a permissioned ledger do not share the same consensus thresholds. Likewise, a user trusting a remote RPC endpoint has a different view of the network from a validating full node.

| Layer | Questions to ask |
| --- | --- |
| Consensus | Who determines transaction order and finality, and what resources could undermine that process? |
| Network | Which peers and infrastructure deliver the information a node sees? |
| Application | Which invariants, external calls, and data sources govern asset movement? |
| Custody and identity | Who can sign, approve, recover, or change a key? |
| Governance and operations | Who can upgrade the system, change its rules, or respond to an incident? |

The examples below explain mechanisms and defensive reasoning. They should not be read as claims that a named network has an unpatched vulnerability today.

## 51% attacks

In a proof-of-work system, sustained control of a majority of the relevant hash power can allow an attacker to outpace the honest chain and reorganize recent history. The attacker may exclude transactions or replace their own previously confirmed payment with a conflicting spend. The [Bitcoin white paper](https://bitcoin.org/bitcoin.pdf) explains the relationship between competing computational power and reversal of transaction history.

This does not let an attacker forge someone else’s signature or make honest nodes accept transactions that violate validation rules. “Controls the chain” is therefore too broad a description. The risk concerns ordering and settlement under particular consensus assumptions.

Defenses depend on the role. An exchange can choose confirmation and deposit policies based on the chain’s security and monitor for reorganizations. Protocol designers must examine the economic cost and availability of attack resources. Adding node identities alone does not increase proof-of-work security. Checkpoints can limit some reorganizations, but introduce another trust or coordination assumption. Proof-of-stake systems require their own analysis rather than borrowing the 51% label unchanged.

## Replay attacks

A signed message can be valid in more than one context if its authorization does not identify the intended context. During a chain split, for example, a transaction may be accepted on both branches when the signature scheme and state permit it. The risk is unintended action using a signature that was genuinely authorized elsewhere.

[EIP-155](https://eips.ethereum.org/EIPS/eip-155) introduces chain identity into Ethereum transaction signing to address cross-chain replay. Application messages need their own protections: relevant domain identifiers, nonces or other one-use rules, and expiration where appropriate.

Typed signing improves the structure of a message, but [EIP-712 explicitly does not provide replay protection by itself](https://eips.ethereum.org/EIPS/eip-712). A contract still needs to reject an already used authorization. Test the same signature across accounts, contracts, chains, and repeated calls. The question is whether every accepted use matches the signer’s intended authority, not whether the signature is mathematically valid.

## Front-running

Public pending transactions can reveal a user’s intended action before it is executed. A participant with influence over transaction submission or ordering may act on that information. On a decentralized exchange, an adverse ordering can worsen the price a user receives; a sandwich places transactions around the user’s trade to exploit its price impact.

[Ethereum’s MEV documentation](https://ethereum.org/developers/docs/mev/) explains the broader role of transaction inclusion, exclusion, and ordering. Fast analysis is not the source of secrecy being broken here: the pending transaction may already be publicly visible.

Design the transaction to constrain acceptable outcomes. Minimum-output limits, deadlines, and application-specific auction or commit–reveal designs can address different cases. Private transaction submission changes who sees the order and which intermediaries are trusted; it is not a universal guarantee. Random delays alone do not fix an ordering incentive. Review the complete market mechanism and what happens when the protective condition causes a transaction to fail.

## Race condition attacks

In Ethereum’s execution model, transactions are processed in an ordered sequence. The relevant application problem is often **transaction-order dependence**, not two transactions literally writing the same state simultaneously. An off-chain application can also have ordinary concurrency bugs that affect how it prepares or records transactions.

For example, an application may prepare an action based on a state that changes before the action is included. A token allowance change can interact with another transaction that consumes the earlier allowance. The contract must define which state is authoritative at execution time and reject actions that no longer meet their conditions.

Operating-system mutexes are not a general solution to on-chain ordering. Use appropriate nonces, state checks, deadlines, and transaction semantics. Where a user signs an intent, bind it to the relevant conditions rather than assuming the state observed by the interface will remain unchanged. Test several valid orderings and confirm that each preserves the intended invariant.

## Time-jacking attacks

Time-related attacks concern how a node or application interprets clocks and timestamps. A node that relies on untrusted peer time information can have different risks from a contract that uses a block timestamp for a deadline. These mechanisms should be analyzed separately.

Block timestamps are constrained by the chain’s consensus rules; they are not arbitrary wall-clock readings from a perfectly synchronized global clock. The degree of influence and the acceptable range differ by protocol. A time-sensitive application must understand the chain it runs on rather than assume a timestamp behaves identically everywhere.

Use tolerant deadlines when the business process allows them, and avoid using block metadata as an unpredictable random source. For node operations, maintain sound clock configuration and use supported client software. A better NTP configuration can address an operating-system clock problem, but it does not change consensus rules or repair contract logic that makes an inappropriate timing assumption. Test boundary conditions explicitly.

## Data injection attacks

A ledger can preserve a false statement faithfully. If a supply-chain application records that a shipment passed inspection, consensus can establish which signed record was accepted; it cannot establish that the physical inspection actually happened.

The attack surface is the point at which external facts enter the system: an API, sensor, user form, administrator, or data provider. A compromised source can supply plausible but false values. Once downstream actions rely on those values, technical integrity of the record may coexist with a wrong business outcome.

Authenticate sources, validate formats and ranges, and define how evidence is checked or disputed. Digital signatures identify a key that authorized a message; they do not make its contents true. Encryption protects confidentiality, not truthfulness. For a high-consequence workflow, consider whether independent evidence, human review, or a delay is needed before an irreversible action. Also plan how a mistaken entry is corrected or superseded without pretending that historical records never existed.

## Distributed Denial of Service (DDoS)

A DDoS attack attempts to exhaust a resource by distributing traffic across many sources. In a blockchain service, the target may be a public RPC endpoint, a website, a node’s peer connections, or an upstream provider. An unavailable website does not necessarily mean the chain has stopped, but users may still be unable to interact with it through that service.

Match the defense to the interface. An HTTP API may benefit from rate limits, request-cost controls, caching, and upstream traffic protection. A peer-to-peer node needs protocol-aware resource limits and resilient connectivity. A CDN protecting a website does not automatically protect the chain’s peer protocol.

Identify expensive queries and isolate public service capacity from privileged operations. Test whether an outage at a single provider prevents all access, and ensure monitoring distinguishes local service failure from network-wide problems. A fallback endpoint is useful only if it has a genuinely different dependency path and returns data the application can verify or assess.

## Malicious node attacks

A malicious peer can withhold messages, provide misleading responses, or consume resources. That does not mean it can change the validation rules followed by an honest full node. Counting how many peers are malicious is also different from measuring control over consensus resources.

The trust model changes when an application accepts an RPC response without independently verifying it. A hostile endpoint might misreport balances, chain status, or simulated outcomes even when the underlying chain is operating correctly. The application needs to know what evidence it obtains and what it simply trusts.

Run maintained clients, constrain resource consumption, and seek diverse connectivity where appropriate. For critical decisions, define how chain identity, confirmations, and returned state are checked. Querying several endpoints can reveal disagreement, but identical answers are weak assurance if all providers depend on the same source. Distinguish an invalid message rejected by validation from a valid but strategically withheld message; the latter may affect availability or the view of recent history.

## Oracle attacks

An oracle connects a contract to information beyond the contract’s direct execution environment. The vulnerability may be a compromised data source, manipulation of the market being measured, a stale report, a unit mismatch, or an integration that handles an unavailable answer badly.

Imagine a lending application valuing collateral from a thinly traded pool. A temporary change in that pool’s price can produce an inappropriate valuation even if the oracle faithfully reports the pool. The source’s economic reliability matters alongside the integrity of the message.

Check freshness, decimals, accepted ranges, and the consequences of missing data. Multiple reports are useful only to the extent that their sources and failure modes are independent. A time-weighted price changes the manipulation problem but introduces its own window and liquidity assumptions. [Chainlink’s data-feed guidance](https://docs.chain.link/data-feeds/overview) describes update triggers and the need for application-specific freshness checks. Define whether a failure pauses activity, uses a bounded fallback, or requires review; do not let an accidental default decide.

## Smart contract vulnerabilities

Smart-contract bugs include reentrancy, incorrect authorization, arithmetic and rounding errors, unsafe external calls, and violations of the intended economic rules. A contract does not need to be technically complex to be dangerous. A single missing check can authorize a transfer or change that the rest of the code assumes is impossible.

Write down the invariants before choosing tools. For a vault, what must remain true about assets, shares, and withdrawals? For a marketplace, who may settle an order and under which terms? Test sequences of actions, including callbacks and failure paths, against those properties.

The [Solidity security considerations](https://docs.soliditylang.org/en/latest/security-considerations.html) explain implementation pitfalls such as reentrancy and resource limits. Independent audits, fuzzing, and formal methods can strengthen review, but each has a scope. A verified function does not prove the soundness of an oracle assumption or administrative key. Keep code small where possible and treat interactions with other contracts as part of the system being reviewed.

## Wallet vulnerabilities

A wallet manages keys and presents transactions for authorization; the assets are represented by the ledger’s state. Wallet security therefore includes both secret protection and the accuracy of what a person is asked to approve.

A compromised interface can replace a destination, obscure a token approval, or misrepresent the effect of a signature. A hardware device may protect a private key while still signing an action the user misunderstood. A secure element does not decide whether a transaction serves the user’s intention.

Use maintained software from verified distribution channels and review the destination, chain, amount, and permissions being granted. Where the signing device provides an independent display, verify what it can actually show. For an organization, separate routine spending from high-impact administrative authority and test recovery procedures. A wallet password or an exchange’s multi-factor authentication does not stop someone who already possesses an ordinary signing key from using it outside that interface.

## Private key vulnerabilities

Key compromise can result from weak generation, exposed backups, malware, accidental publication, or poor operational separation. Loss can be just as serious as theft if no authorized recovery path exists. The right key-management design therefore considers creation, use, backup, rotation where supported, and retirement.

For institutional custody, ask which people or systems can authorize a transaction and which failures are independent. A multisignature policy adds little resilience if every signer relies on the same compromised device or if all recovery material is accessible through one account.

Protect backup material and test recovery without exposing production secrets. Avoid copying seed phrases into ordinary online forms or support conversations. Keep the relationship between an account password and a blockchain key clear: changing a password may not invalidate a leaked signing key. Depending on the account design, responding to compromise may require moving assets or changing authorized signers. Plan that procedure while legitimate control is still available.

## Phishing attacks

Phishing targets the decision to trust a message, site, or requested action. In blockchain applications, the attacker may seek a seed phrase, a login credential, a token approval, or a signed message. They do not always need to obtain the private key itself.

A familiar-looking page can request authority far beyond the operation the user believes they are performing. A signature presented as a harmless login can be especially confusing when the wallet does not clearly explain the signed domain and action.

Use independently verified routes to services, inspect the requested permission, and treat unexpected recovery requests with particular caution. Organizational workflows should specify who can request a transaction and how the request is confirmed outside the same message thread. Phishing-resistant authentication can help protect supported web accounts, but it does not make a malicious on-chain authorization safe. The final control is understanding and limiting the authority being granted, supported by an interface that makes that authority visible.

## Sybil attacks

A Sybil attack uses many apparent identities to gain influence in a system that assumes identities are independent. Creating many node addresses is cheap relative to acquiring scarce resources such as proof-of-work hash power or stake. That is why “more nodes” does not automatically translate to control of a well-designed consensus mechanism.

The risk still appears in peer discovery, reputation, voting, rewards, and applications that allocate benefits per account. A distribution designed as “one reward per address” is not necessarily one reward per person.

Identify the resource or evidence that makes influence costly or accountable. Different settings use different mechanisms, and each brings trade-offs. A permissioned membership list changes the trust model; a token-weighted vote measures holdings rather than unique people. Avoid claiming that Sybil attacks are inherently rare or difficult. Their feasibility depends on what the system counts and what an attacker must spend to increase that count.

## Eclipse attacks

An eclipse attack isolates a victim’s view of the peer-to-peer network by controlling the connections through which it receives information. The attacker need not control most of the global network. A sufficient position around the victim can be enough to delay or selectively reveal blocks and transactions.

[Heilman and colleagues’ research](https://www.usenix.org/system/files/conference/usenixsecurity15/sec15-paper-heilman.pdf) demonstrates this threat in Bitcoin’s peer network and discusses countermeasures. The important distinction is between the state of the chain and the state the isolated victim can observe.

Diverse peers, robust peer-selection mechanisms, and monitoring for abnormal connectivity can raise the cost of isolation. Operational checks should also ask whether supposedly independent connections share an upstream network or service. Encryption alone does not ensure that a node has honest or diverse peers. An application making a high-value decision from one node should understand the consequences of that node temporarily seeing a delayed or incomplete view.

## BGP hijacking attacks

Blockchains use ordinary Internet infrastructure to exchange messages. Manipulated routing announcements can redirect, delay, or interrupt that traffic even when the blockchain’s cryptographic validation remains intact.

[Research by Apostolaki, Zohar, and Vanbever](https://www.nsg.ee.ethz.ch/publications/2017-06-26-hijacking-bitcoin-routing-attacks-on-cryptocurrencies-20-500-11850-192153/) examined how routing attacks can affect Bitcoin through partitioning and delayed propagation. The results illustrate a network dependency; they should not be treated as a current measurement of every chain’s exposure.

Review hosting and routing concentration, maintain diverse connectivity where the risk warrants it, and coordinate routing monitoring with infrastructure providers. Authentication can help detect altered messages, while transport encryption can protect their contents, but neither forces an adversary to deliver traffic promptly. A system can therefore preserve message integrity while losing availability. Incident response needs to distinguish an application fault from a routing incident, because restarting the same service behind the same affected route may not restore useful connectivity.

## Side-channel attacks

A cryptographic implementation may reveal secrets through properties of its execution: timing, cache behavior, power consumption, or electromagnetic emissions. The mathematical algorithm can remain sound while its implementation leaks information about a key.

The relevant attacker capabilities differ substantially. A remote timing observer, a process sharing hardware, and someone with physical access to a signing device do not have the same opportunities. Review the threat model for the actual key-holding environment rather than describing side channels as a generic attack on the whole network.

Use reviewed implementations and hardware suitable for the risk. Constant-time techniques can address some timing leakage; masking and other protections address particular physical leakage models. No single countermeasure covers every channel. Keep software and device firmware maintained, minimize unnecessary exposure of signing operations, and treat implementation changes as security-relevant. Ordinary network monitoring may detect a later unauthorized transaction, but it cannot be assumed to detect the key-extraction process itself.

## Quantum computing attacks

A sufficiently capable quantum computer could threaten public-key schemes used for digital signatures. For many blockchain accounts, the concern is deriving signing capability from an exposed public key, not decrypting an otherwise hidden ledger or “breaking the encryption of every transaction.”

Hashes and symmetric encryption face different quantum considerations. The effect therefore depends on the exact primitives and how the protocol exposes or uses them. Predicting a date for practical compromise is unnecessary to recognize that migration requires preparation.

[NIST’s post-quantum standards program](https://csrc.nist.gov/projects/post-quantum-cryptography) provides context for replacement primitives. Adopting them in a blockchain is a protocol and account-migration problem: signature size, verification cost, existing balances, and agreement on new rules all matter. An individual wallet update cannot unilaterally change what the network accepts. Inventory the cryptographic dependencies and distinguish long-lived migration work from an assertion that a network is already vulnerable to a deployed quantum attack.

## Blockchain bloat attacks

A system can become harder to operate as history, state, or verification work grows. An adversary may deliberately consume these resources through transactions that are valid under the protocol but expensive for other participants to retain or process. High activity alone is not evidence of an attack; the resource economics and pattern matter.

Distinguish historical block storage from active state and from the work needed to validate new activity. Pruning old data can reduce local storage, but it does not eliminate every state-growth or validation-cost problem. [Bitcoin Core’s pruning documentation](https://bitcoincore.org/en/releases/0.11.0/) describes deleting previously validated raw block and undo data while retaining the databases needed by the node.

Protocol designers need resource limits and fees that reflect the costs being imposed. Operators need capacity monitoring and supported retention policies. Simply filtering small transactions is not a complete answer: a small transaction can be legitimate, while a larger valid transaction may consume substantial resources. Review the actual bottleneck and who bears its cost.

## Blockchain governance attacks

Governance can change permissions, move treasury assets, or upgrade a contract. An attacker who obtains the required voting or administrative authority may cause a harmful action through the governance process itself. The code can execute correctly while the outcome defeats the community’s expectations.

Review who can propose, vote, cancel, and execute; when voting power is measured; and which assets or contracts are controlled by the result. Temporary access to voting power, concentrated delegation, low participation, and a poorly constrained executor create different risks.

[OpenZeppelin’s governance guide](https://docs.openzeppelin.com/contracts/5.x/governance) illustrates mechanisms such as voting snapshots and timelocks. A timelock provides a response window only if someone monitors proposals and has a useful action available. On-chain voting is not inherently safer than every alternative. The goal is a coherent authority model whose failure modes are understood, including the powers retained by administrators and emergency councils.

## Conclusion

A useful security review turns the threat list into specific work. Identify the assets, state the assumptions protecting them, and ask which actor could break each assumption. Prioritize the failures with both serious consequences and a plausible path in the system being reviewed.

For each important risk, record a preventive control, an observable signal, and a response owner. Test the response: can a service be isolated, a role revoked, a dependency replaced, or users informed while the system is under pressure? A control that cannot be operated during an incident is weaker than it appears on a diagram.

Avoid substituting one technology label for analysis. A decentralized exchange still has contract and economic risks. IPFS does not automatically provide confidentiality or permanent availability. A hardware wallet does not validate a business decision. Security comes from understanding which property each component supplies and how those properties fit together.

The ledger is one part of the system. Reviewing the whole path—from external data and signing decisions to consensus and governance—is what makes the assessment useful.
