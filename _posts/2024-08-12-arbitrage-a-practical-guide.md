---
layout: posts/post
title: "Arbitrage - A Practical Guide"
date: 2024-08-12 00:00:00 +0000
last_modified_at: 2026-11-22 12:00:00 +0000
categories: ["fintech"]
tags: ["strategy", "tokenomic"]
post_image: "/assets/images/arbitrage-a-practical-guide.webp"
description: "Evaluate DEX arbitrage using executable quotes, complete costs, transaction ordering, and explicit limits on what atomic execution can protect."
permalink: "/arbitrage-a-practical-guide/"
image_width: 1408
image_height: 768
---

<span id="table-of-contents" aria-hidden="true"></span>A price difference between two decentralized exchanges is a starting point for analysis. Profit depends on the amounts a trade can actually execute, the fees it incurs, and whether the opportunity still exists when the transaction is included.

This guide explains the mechanics of DEX arbitrage and a disciplined way to evaluate it. The numerical examples are hypothetical. They illustrate the calculation rather than returns from a live strategy.

## What is Arbitrage in DEXs?

Arbitrage involves buying an asset at a lower price and selling an equivalent asset at a higher price. On a single chain, compatible contract calls can sometimes be combined into one transaction so that all legs succeed or the transaction reverts.

For an automated market maker, the displayed price is usually a marginal price. A trade changes the pool's state, so the average execution price for a meaningful amount can differ. Use an executable quote for the proposed size and route, not a dashboard price multiplied by the desired quantity.

The broad calculation is:

**Net result = final proceeds − initial capital − borrowing costs − transaction costs − other execution costs.**

If the final-proceeds quote already includes swap fees and price impact, do not subtract them a second time. Track failed attempts separately; an included transaction that reverts can still consume gas.

## Types of Arbitrage Opportunities in DeFi

### 1. Cross-DEX Arbitrage

Buy and sell the same asset across pools on the same chain. Verify that the asset contracts are the ones intended and that transfers behave as expected. A shared ticker is not proof that two tokens are interchangeable.

The sequence may be atomic, but the transaction still competes for inclusion. Quotes, balances, and the ordering of other transactions can change before execution.

### 2. Triangular Arbitrage

A route can pass through three assets and return to the starting one: for example, WETH → DAI → USDC → WETH. Compare the final WETH amount with the initial amount after every pool's fees and price impact.

More legs create more dependencies. A route that looks profitable before costs can become unprofitable after three swaps and the gas needed to execute them.

### 3. Cross-Chain Arbitrage

A price gap across chains introduces a different execution problem. Bridging an asset and then selling it is generally not one atomic transaction across both chains. Settlement delays, bridge security, and a changing destination price matter.

Maintaining inventory on both chains can reduce the time between the buy and sell legs, but creates capital, custody, and rebalancing requirements. Those costs belong in the strategy's economics.

### 4. Stablecoin Arbitrage

A stablecoin's target price is not a guarantee of redemption at that price. A discount may reflect liquidity conditions, restrictions on redemption, or concern about backing. Trading two dollar-denominated tokens also introduces exposure to both instruments.

Before treating a deviation as temporary, understand what mechanism could close it and who can actually use that mechanism.

## Common Arbitrage Techniques in DEXs

### Flash Loan Arbitrage

<span id="2-flash-loan-contracts" aria-hidden="true"></span>In a repay-in-the-same-transaction flash loan, a contract borrows assets, performs its operations, and returns the required amount and fee. If the repayment condition fails, the transaction reverts. [Aave's flash-loan documentation](https://aave.com/docs/aave-v3/guides/flash-loans) describes the interfaces and their different repayment or debt-opening options.

Flash liquidity can reduce the upfront capital needed for the trade itself. It does not remove gas costs, development work, contract risk, or competition. A production receiver must validate the callback and requested operation, restrict approvals appropriately, and account for the lender's actual current terms.

### A worked calculation

Suppose two hypothetical venues offer fixed execution prices of 2,500 and 2,510 DAI per ETH for the relevant trade size. Ignore price impact initially and assume a 0.30% input fee on each swap. Starting with 10,000 DAI:

| Step | Calculation | Result |
| --- | --- | ---: |
| Buy ETH after the first swap fee | 10,000 × 0.997 ÷ 2,500 | 3.988 ETH |
| Sell ETH after the second swap fee | 3.988 × 2,510 × 0.997 | 9,979.85036 DAI |
| Result before gas and borrowing | 9,979.85036 − 10,000 | −20.14964 DAI |

Without fees, the apparent gain would have been 40 DAI. With these assumptions, the route already loses about 20.15 DAI before gas, borrowing costs, or any adverse price movement. The example uses a fee associated with the [Uniswap v2 model](https://docs.uniswap.org/concepts/protocol/fees); fees differ by protocol, pool, and version.

For an actual AMM route, replace these fixed prices with quotes from the relevant pool state. Quote both legs for their dependent amounts, rather than assuming the same price at every trade size.

## How to Identify Arbitrage Opportunities in DEXs

<span id="3-aggregators-with-built-in-arbitrage" aria-hidden="true"></span>Start with trusted chain data and verified contract addresses. Public services such as [Dex Screener](https://dexscreener.com/), [CoinGecko](https://www.coingecko.com/), or [1inch](https://1inch.io/) can help investigate markets, but an indicative price is not an executable promise.

A useful evaluation sequence is:

1. Identify equivalent assets and compatible pools.
2. Quote the complete route at a specified block and trade size.
3. Simulate the exact transaction, including approvals, lender fees, and minimum-output checks.
4. Estimate inclusion costs and compare the result with a defined minimum net return.
5. Reject a stale or changed opportunity rather than relaxing the checks to force execution.

Retain the quote, simulation state, and final receipt. This makes it possible to explain why a candidate succeeded, failed, or was not submitted.

## Challenges in DEX Arbitrage

### 1. High Transaction Fees and Network Congestion

Gas and inclusion costs can consume a small spread. Lower-fee networks may change the economics, but they also have different liquidity, ordering, and bridge assumptions. There is no universally cheap time of day or network that makes a route profitable.

### 2. Slippage and Liquidity Issues

Distinguish the price impact caused by the proposed trade from slippage between the quoted and executed result. Set minimum outputs and a minimum final balance based on the whole transaction. Splitting a trade does not automatically remove aggregate price impact and can increase fees or exposure.

### 3. Execution Risks

Searchers compete for opportunities, and other transactions can change pool state first. Ethereum's [MEV documentation](https://ethereum.org/en/developers/docs/mev/) explains this competition. Private submission systems, including the [Flashbots ecosystem](https://docs.flashbots.net/), change how a transaction reaches builders; they do not guarantee inclusion or profit.

### 4. Smart Contract Vulnerabilities

Every additional token, router, lender, or callback expands the interaction surface. An audit is useful evidence about a particular scope and version, not a guarantee that the composed strategy is safe. Review token behavior, approval limits, external calls, and the conditions under which funds can remain in the receiver contract.

### 5. Market Volatility

An atomic transaction can enforce that its on-chain legs satisfy the program's conditions. It does not protect inventory already held elsewhere, future rebalancing, a token depeg after execution, or money spent on failed attempts. Those exposures need their own limits.

## Tools and Platforms for Automating Arbitrage Strategies

<span id="1-arbitrage-bots" aria-hidden="true"></span><span id="4-custom-scripts" aria-hidden="true"></span>Separate the research pipeline from transaction submission. A scanner discovers candidates; a quoting and simulation layer evaluates them; an execution component submits only transactions that satisfy explicit conditions. Logging and accounting then compare expected and realized results.

For development, a local fork of a relevant chain state can expose interactions that a simple test environment misses. Public testnets help test deployment and integration, but their liquidity and competition do not reproduce a live market. Use the networks supported by the current protocol documentation; retired networks such as [Ropsten](https://blog.ethereum.org/2022/11/30/ropsten-shutdown-announcement) are no longer a useful default.

Track more than successful trades. Include rejected candidates, reverted transactions, infrastructure costs, capital tied up in inventory, and time spent maintaining integrations. A strategy's economics cannot be inferred from a few profitable receipts.

## The Future of Arbitrage in DeFi

<span id="2-layer-2-expansion" aria-hidden="true"></span><span id="4-regulatory-considerations" aria-hidden="true"></span>New pool designs, additional chains, and changes in transaction ordering can create different opportunities and dependencies. They also require continual adaptation of quotes, simulations, and risk assumptions.

<span id="1-cross-chain-interoperability" aria-hidden="true"></span><span id="3-advanced-dex-models" aria-hidden="true"></span>Concentrated liquidity, for example, makes available depth depend on the price range. Cross-chain routes add settlement and inventory questions. The durable skill is understanding the mechanism and the complete execution path, rather than assuming a familiar strategy carries unchanged into a new environment.

## Conclusion: Mastering Arbitrage in DeFi

A credible arbitrage strategy begins with an executable calculation and survives a realistic accounting of costs and failures. Establish the asset identities, simulate the whole route, enforce the economic conditions in the transaction, and compare actual results with the assumptions. A visible spread earns further investigation; the completed accounting determines whether there was a profit.
