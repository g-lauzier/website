---
layout: posts/post
title: "DEX Arbitrage: Three Worked Examples"
date: 2024-06-25 00:00:00 +0000
categories: ["fintech"]
tags: ["strategy", "tokenomic"]
post_image: "/assets/images/case-studies-successful-arbitrage.webp"
description: "Three hypothetical DEX arbitrage examples show how pool prices, fees, liquidity, and atomic execution determine the actual result."
permalink: "/case-studies-successful-arbitrage/"
image_width: 1408
image_height: 768
last_modified_at: 2026-11-22 12:00:00 +0000
---

A price difference between two decentralized exchanges is an invitation to calculate, not evidence of a profit. The relevant prices are the amounts obtainable for the intended trade size, after fees and price impact, at the state in which the transaction executes.

The three cases below are **hypothetical worked examples**. They illustrate token launches, stablecoin imbalances, and liquidity moving between pools. They are not verified trades, interviews, or reported investment returns.

## Introduction

Arbitrage can move prices closer together by buying where an asset is cheaper and selling where it is more expensive. In an automated market maker, each trade also changes the pool's reserves. The apparent spread can shrink as the trade grows.

A useful starting calculation is:

```text
net result = sale proceeds − purchase cost − swap fees
             − financing fees − transaction costs
```

When quotes already include swap fees and price impact, do not subtract them again. For a flash-funded route, compare the final amount returned with the principal plus the flash-loan fee, then account for transaction costs paid outside that balance.

The [Uniswap v2 flash-swap documentation](https://developers.uniswap.org/docs/protocols/v2/concepts/flash-swap) describes how temporary liquidity can support an atomic trade. That mechanism removes some funding constraints; it does not guarantee a favorable price or free execution.

## Case Study 1: Arbitrage During a Token Launch

### The Context

Imagine TokenX trades in two pools on the same chain. Buying interest pushes one pool's price above the other. Both pools are shallow, so the gap visible for a tiny trade may disappear when the order size increases.

### The Strategy

An off-chain process reads both pools at a consistent block state and simulates several trade sizes. The execution contract would borrow ETH, buy TokenX in the cheaper pool, sell it in the other pool, and repay the loan within the same transaction. It should reject the route if the final balance cannot cover repayment and the required surplus.

The atomic unit is the transaction, not merely the block. Two transactions in the same block can still have other transactions inserted between them or execute against different pool states.

### The Tools Used

The workflow needs a reliable node connection, protocol-specific quoting, transaction simulation, and an execution contract that restricts the routes and assets it can use. A Python or JavaScript monitor can discover candidates; the on-chain contract performs the sequence that must succeed or revert together.

### The Outcome

Suppose a simulation borrows 100 ETH and ends the two swaps with 100.35 ETH after swap fees and price impact. Assume, purely for the example, a financing fee of 0.05 ETH and transaction costs of 0.08 ETH. The estimated net profit is:

```text
100.35 − 100.00 − 0.05 − 0.08 = 0.22 ETH
```

If the executable route instead returns 100.10 ETH, the same costs produce a 0.03 ETH loss. A transaction-level minimum-profit check can reject an unfavorable route, but a reverted transaction can still consume gas.

### Lessons Learned

The decision depends on executable quotes and position size. Newly launched tokens can also contain transfer taxes or restrictions that make standard pool assumptions incorrect. Testing the token's behavior is part of evaluating the route.

## Case Study 2: Cross-DEX Arbitrage with Stablecoins

### The Context

Suppose the same stablecoin trades at slightly different prices in two pools. That can reflect an ordinary imbalance, but it can also reflect concerns about redemption, liquidity, or the other asset in a pair. A stablecoin label does not establish that the difference is temporary or safe to hold.

### The Strategy

Compare a complete round trip in one accounting asset. The route begins with that asset, acquires the stablecoin, sells it through the second pool, and returns to the starting asset. Use the actual reserve curves and fee tiers rather than multiplying a headline price difference by the available capital.

### The Tools Used

Pool-state reads, exact-input or exact-output quote functions, and a local transaction simulation are more informative than a dashboard's last traded price. Contract addresses and chain IDs must match the intended assets. Tokens with the same symbol on different chains are not automatically interchangeable.

### The Outcome

Assume a hypothetical route begins with 100,000 units of the accounting stablecoin and returns 100,060 after both swaps, including pool fees and price impact. If execution costs are equivalent to 25 units, the net is 35 units. An additional 40 units of adverse execution would turn it into a loss.

This arithmetic says nothing about a repeatable monthly return. To evaluate a running strategy, include failed transactions, infrastructure costs, idle capital, and periods without profitable opportunities. A record of successful trades alone omits part of the economics.

### Lessons Learned

Small spreads leave little room for errors. Stablecoin routes require analysis of depegging and redemption risk as well as execution. The ability to close atomically on one chain differs materially from holding inventory while moving assets across a bridge.

## Case Study 3: Arbitrage During a Liquidity Migration

### The Context

Liquidity can shift between older and newer pools without the old pools disappearing. Uniswap's [March 2021 v3 announcement](https://blog.uniswap.org/uniswap-v3) introduced concentrated liquidity and targeted a May 5 mainnet launch. This example concerns liquidity moving between coexisting pools, rather than a particular dated migration event.

The hypothetical opportunity is a price difference between a constant-product pool and a concentrated-liquidity pool for the same pair on the same chain.

### The Strategy

Quote the proposed route against both pool designs. In a concentrated-liquidity pool, crossing price ranges can change the available liquidity and execution cost. A trade that looks profitable from the current price alone may be unattractive once the full path is simulated.

The execution contract needs to enforce the intended asset sequence, slippage bounds, repayment, and a final balance condition. Contract complexity should be justified by the route being executed, rather than treated as an advantage by itself.

### The Tools Used

Use the appropriate version's pool interfaces and quoting logic, inspect liquidity around the trade's price path, and simulate the full transaction. Historical analysis also needs the exact block state: today's liquidity cannot explain a trade from an earlier period.

### The Outcome

Suppose one simulated trade size produces a 0.12 ETH surplus before transaction costs, while a larger size produces only 0.09 ETH because it moves farther through the available liquidity. If the smaller route costs 0.04 ETH to execute, its estimated net is 0.08 ETH. Increasing notional did not improve the result.

### Lessons Learned

Understanding the pool's pricing mechanics matters more than the version number. Liquidity changes create opportunities only when the final route remains profitable after all relevant costs and risks.

## Conclusion: The Art and Science of DEX Arbitrage

A credible arbitrage case study should identify the chain, transaction hash, assets, route, funding, and complete cost calculation. That evidence lets another reader reconstruct the result. Without it, numerical examples should remain explicitly hypothetical.

Across these scenarios, the useful discipline is the same: quote at size, simulate the whole transaction, distinguish atomic execution from multi-step exposure, and account for failures. Those checks make the difference between observing a spread and understanding a trade.
