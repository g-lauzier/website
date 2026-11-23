---
layout: posts/post
title: "Preparing for the Post-Quantum Era"
date: 2022-11-05 00:00:00 +0000
categories: ["cybersecurity"]
tags: ["algorithms", "code-based"]
post_image: "/assets/images/preparing-post-quantum-era.webp"
description: "What quantum computing threatens, how the main post-quantum cryptographic families differ, and how to plan a measured migration."
permalink: "/preparing-post-quantum-era/"
image_width: 1408
image_height: 768
last_modified_at: 2026-11-22 12:00:00 +0000
---

Post-quantum cryptography addresses a migration problem: information protected today may need to remain confidential long after the systems that encrypted it have changed. Preparing means understanding which cryptographic components are exposed, what can replace them, and how to change those components without breaking the services that depend on them.

*Revision note, November 2026: this article was originally published in 2022. The standards discussion below now includes NIST’s first three post-quantum standards, finalized in August 2024.*

## An Introduction to Quantum-Resistant Cryptography

A sufficiently capable fault-tolerant quantum computer could use Shor’s algorithm to undermine widely deployed public-key techniques based on integer factorization and discrete logarithms, including RSA and elliptic-curve systems. This is a particular concern for key establishment and digital signatures. It does not mean that every kind of encryption would fail in the same way.

Symmetric encryption and hash functions face different quantum speedups and parameter considerations. The migration task is therefore an inventory of algorithms and uses, not a blanket instruction to replace everything bearing the word “encryption.” [NIST’s post-quantum project](https://csrc.nist.gov/projects/post-quantum-cryptography) provides the standards and transition context.

![Diagram from the original introduction to post-quantum cryptography](https://guillaumelauzier.com/wp-content/uploads/2023/01/IoT-02-00005-g001-550.webp)

An attacker may collect encrypted traffic now and attempt to decrypt it later. Whether that matters depends on how long the information must remain secret and whether its key exchange would be vulnerable. Migration lead times matter alongside estimates of future computing capabilities.

![Illustration from the original post-quantum cryptography article](https://guillaumelauzier.com/wp-content/uploads/2023/01/dgs.png)

## Lattice-based cryptography

Lattice-based designs rely on problems involving structured sets of points in high-dimensional space. Learning with Errors and its variants provide assumptions used by several constructions. LWE and Ring-LWE are problem families; they are not interchangeable names for complete encryption products.

Two finalized NIST standards illustrate the different jobs these designs can perform:

- **ML-KEM**, specified in [FIPS 203](https://csrc.nist.gov/pubs/fips/203/final), establishes a shared secret that can then be used by a symmetric encryption protocol.
- **ML-DSA**, specified in [FIPS 204](https://csrc.nist.gov/pubs/fips/204/final), provides digital signatures.

A key-encapsulation mechanism is not a replacement for every function of a public-key cryptosystem. Protocols must use the right primitive for the job. Implementations also need attention to randomness, parameter selection, side channels, and message sizes. “Lattice-based” alone is not a performance or security guarantee.

![Illustration of multivariate cryptographic constructions from the original article](https://guillaumelauzier.com/wp-content/uploads/2023/01/General-workflow-of-multivariate-encryption-schemes.png)

## Multivariate cryptography

Multivariate constructions use systems of polynomial equations over finite fields. They form a distinct research family, particularly for signatures. The broad difficulty of solving polynomial systems does not establish the security of every structured scheme built from them; attackers may exploit the specific structure needed to make signing efficient.

This distinction corrects a common classification mistake: **McEliece and Niederreiter belong to code-based cryptography**, not the multivariate family. Selecting a construction requires reviewing the actual scheme and its cryptanalysis, rather than treating a family name as an endorsement.

![Illustration from the original comparison of post-quantum approaches](https://guillaumelauzier.com/wp-content/uploads/2023/01/2-Figure1-1-1024x260.png)

## Code-based cryptography

Code-based schemes build on the difficulty of decoding certain error-correcting codes without the required secret information. McEliece and Niederreiter are cryptosystem constructions; Goppa codes are mathematical objects used in some such constructions. Those terms should not be listed as if they were three equivalent algorithms.

The engineering trade-offs differ from lattice-based designs. Key and ciphertext sizes, deployment constraints, and implementation maturity can matter as much as the headline security level. A large public key, for example, affects certificate handling and constrained devices differently from an increase in signature size.

Use the [NIST project’s published evaluations and standards](https://csrc.nist.gov/projects/post-quantum-cryptography) to track individual schemes. Research interest, selection for standardization, and a finalized standard are different milestones.

![Illustration from the original hash-based cryptography section](https://guillaumelauzier.com/wp-content/uploads/2023/01/Figure1-1024x426-1.jpg)

## Hash-based cryptography

Hash-based signatures use hash functions as building blocks, but a signature scheme is more than a choice of hash. **SLH-DSA**, standardized in [FIPS 205](https://csrc.nist.gov/pubs/fips/205/final), is a stateless hash-based digital signature scheme derived from SPHINCS+.

Merkle–Damgård and sponge constructions describe ways of building hash functions. HMAC is a message-authentication construction. None of these is, by itself, a post-quantum public-key signature scheme.

Stateful and stateless hash-based signatures also have different operational requirements. A stateful design can fail if signing state is reused or rolled back. This is a reminder that security depends on how keys and state are managed as well as the underlying mathematics.

## Planning the transition {#conclusion}

Start with the systems whose compromise would have the longest consequences. Record where public-key cryptography appears: TLS termination, VPNs, certificates, software signing, device firmware, backups, and external service dependencies. Identify who can change each component and which clients must remain compatible.

Then test a supported migration path. Measure handshake size, latency, memory use, failure behavior, and interoperability with actual clients. Use maintained implementations and follow the applicable protocol guidance; combining classical and post-quantum algorithms safely requires a specified construction, not a homemade concatenation.

A useful plan produces an inventory, accountable owners, a test environment, and a sequence of changes. It also leaves room to replace an algorithm if later analysis changes the assessment. Cryptographic agility is an operational capability: knowing where the cryptography is, being able to update it, and verifying that the update works.
