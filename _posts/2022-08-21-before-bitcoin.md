---
layout: posts/post
title: "Before Bitcoin"
date: 2022-08-21 00:00:00 +0000
categories: ["blockchain"]
tags: ["bitcoin", "blockchain"]
post_image: "/assets/images/writing/before-bitcoin.webp"
description: "E-gold and b-money show two different approaches to digital cash—and help explain the problem Bitcoin set out to solve."
permalink: "/before-bitcoin/"
post_image_small: "/assets/images/writing/before-bitcoin-640.webp"
post_image_medium: "/assets/images/writing/before-bitcoin-960.webp"
image_width: 1600
image_height: 900
image_alt: "Metallic discs and partial arcs form a progression toward a translucent blue disc."
image_caption: "Editorial illustration."
original_post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2022/12/Logo-e-gold.png"
last_modified_at: 2026-11-22 12:00:00 +0000
---

Bitcoin did not begin the search for digital money. Earlier systems and proposals had already explored online payments, cryptographic identities, and alternatives to conventional banking. What differed was where users had to place their trust.

E-gold and b-money make that distinction especially clear. One was an operated payment service backed by a physical asset. The other was a proposal for participants to maintain balances without a central operator. Treating both as early versions of the same technology misses the design choices that mattered.

## What was e-gold?

E-gold allowed account holders to transfer balances denominated in precious metals. The service depended on an operator to maintain accounts, process transfers, and hold the assets that backed those balances. It was a centralized system, not a decentralized blockchain network.

That distinction shaped its risks. A user needed confidence in both the account records and the custody of the underlying gold. Fast electronic transfers could not remove either dependency. Multiple servers, if used to run a service, do not by themselves make its governance decentralized.

E-gold also illustrates why payment design and legal obligations cannot be separated. In July 2008, the company and its affiliate pleaded guilty to charges involving money laundering and an unlicensed money-transmitting business. The [US Department of Justice announcement](https://www.justice.gov/archive/opa/pr/2008/July/08-crm-635.html) describes the proceedings and compliance requirements. This is more precise than describing the service as simply having been “shut down in 2009.”

## B-money

Wei Dai's 1998 [b-money proposal](https://www.weidai.com/bmoney.txt) approached the problem differently. Participants would use cryptographic pseudonyms and signed messages, while a shared accounting process recorded balances. Dai outlined two protocols: one with every participant maintaining accounts, and another with a subset of servers doing that work.

B-money was a design proposal, rather than an operating currency comparable to e-gold. Its importance lies in the questions it made concrete: how to create units, transfer value, enforce agreements, and discourage dishonest accounting without relying on a conventional payment company.

Those questions remained difficult. Agreeing on a balance is not enough if participants can receive conflicting histories or spend the same units twice. A payment network needs a way to decide which history counts.

## What Bitcoin brought together

The [Bitcoin white paper](https://bitcoin.org/bitcoin.pdf), published in 2008, explicitly cites b-money and Hashcash. Bitcoin's network began operating in 2009. Its contribution was to combine signed transactions, a chain of proof-of-work blocks, and incentives into a working approach to ordering payments without a trusted payment processor.

The useful historical comparison is therefore about trust and coordination. E-gold put the operator at the center. B-money described ways to distribute accounting. Bitcoin supplied a particular mechanism for participants to converge on a transaction history. Each helps explain why digital cash was an engineering problem as much as a new form of money.
