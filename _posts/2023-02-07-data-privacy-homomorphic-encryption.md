---
layout: posts/post
title: "Data Privacy: Homomorphic Encryption"
date: 2023-02-07 00:00:00 +0000
categories: ["cybersecurity"]
tags: []
post_image: "/assets/images/writing/data-privacy-homomorphic-encryption.webp"
description: "What homomorphic encryption makes possible, how partial and fully homomorphic schemes differ, and where the privacy guarantees stop."
permalink: "/data-privacy-homomorphic-encryption/"
image_alt: "Metal rings surround a sealed smoked-glass capsule containing a blue threadlike form."
post_image_small: "/assets/images/writing/data-privacy-homomorphic-encryption-640.webp"
post_image_medium: "/assets/images/writing/data-privacy-homomorphic-encryption-960.webp"
image_width: 1600
image_height: 900
image_caption: "Editorial illustration."
original_post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2023/02/generatedart_homomorphic_encryption.png"
last_modified_at: 2026-11-22 12:00:00 +0000
---

Encryption usually protects information while it is stored or transmitted. Processing it often means decrypting it first. Homomorphic encryption changes that arrangement: a service can perform supported computations on ciphertexts, returning a result that the key holder can decrypt.

The appeal is concrete. A data owner may want a computation performed without giving the operator access to the underlying values. The challenge is designing a useful calculation, an acceptable performance budget, and a security model that covers the entire exchange.

## Computing without revealing the input

Consider an illustrative service that calculates a total. A client encrypts several values under an appropriate scheme, sends the ciphertexts to the service, and receives an encrypted sum. The client decrypts the result locally. The service’s arithmetic is on ciphertexts; the meaningful sum appears only after authorized decryption.

[NIST’s overview of fully homomorphic encryption](https://csrc.nist.gov/Projects/pec/fhe) describes the broader goal of evaluating arbitrary functions without possessing the decryption key. In practice, the computation must be represented using operations supported by the scheme and implementation.

The distinction matters for ordinary software. A program that branches on a plaintext value cannot necessarily be moved unchanged into an encrypted workflow. Comparisons, table lookups, and other operations may require a different representation or a costly circuit. The engineering problem is often to reshape the computation rather than simply switch on encryption.

## FHE & SHE

Three terms describe different capabilities:

| Family | Capability | Main constraint |
| --- | --- | --- |
| Partially homomorphic encryption | Supports a restricted operation, such as addition or multiplication, repeatedly | The available operation set is limited |
| Somewhat homomorphic encryption | Supports combinations of operations up to a bounded complexity | The computation must fit the scheme’s supported depth |
| Fully homomorphic encryption | Supports arbitrary computable functions in principle | Practical latency, memory, ciphertext size, and parameter choices remain limiting |

A related term, **leveled FHE**, refers to supporting a chosen bounded circuit depth through parameter selection. Some constructions use **bootstrapping** to refresh a ciphertext and enable further computation. Neither term implies that a large calculation is inexpensive. The [Canadian privacy commissioner’s technical explanation](https://www.priv.gc.ca/en/blog/20231024/) provides a more detailed account of these distinctions.

Choose the required computation before choosing the most general label. An application that needs encrypted totals has different requirements from one evaluating a neural network. A narrowly defined calculation may permit a much simpler design.

## What remains exposed

Homomorphic encryption protects the confidentiality of the encrypted input under the scheme’s assumptions. It does not automatically hide all metadata, verify that the service performed the requested calculation, or control what the decrypted answer reveals.

For example, a series of aggregate queries could expose an individual’s contribution even if each calculation was performed on encrypted data. A compromised client can also disclose information before encryption or after decryption. Key management, query authorization, and output policy therefore remain part of the design.

[Microsoft SEAL’s security guidance](https://github.com/microsoft/SEAL/blob/main/SECURITY.md) highlights the need to assess the complete application and its security model. Correct use of a library is necessary, but the library cannot decide which answers an application should disclose.

## Potential uses and practical limits

Possible applications include outsourced statistics, selected financial calculations, and model inference on sensitive inputs. Each needs a concrete threat model: is the service merely curious, actively malicious, or allowed to collude with another participant? Who can decrypt the result, and can that party misuse it?

A useful proof of concept measures the actual workload. Record accuracy where approximate arithmetic is used, ciphertext and key sizes, evaluation time, and the cost of transfers. Compare those costs with the benefit of withholding plaintext from the operator.

Homomorphic encryption is also not automatically quantum-resistant. The property “supports computation on ciphertexts” says nothing by itself about the mathematical assumption behind the encryption. Some widely studied constructions use lattice assumptions; other homomorphic schemes use different assumptions. Claims about quantum resistance must identify the scheme and parameters rather than appeal to a “higher level of abstraction.”

## Choosing a system {#conclusion}

Begin with the smallest useful computation and state exactly who should learn its input and output. Check whether homomorphic encryption solves that requirement better than alternatives such as local computation or a different sharing arrangement. Then test the full protocol, including how errors, repeated queries, and key loss are handled.

The value of homomorphic encryption is the ability to separate computation from access to plaintext. That is a powerful building block when its boundaries are explicit.
