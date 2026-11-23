---
layout: posts/post
title: "Understanding Iron Condor and Butterfly Spread"
date: 2025-01-11 00:00:00 +0000
categories: ["fintech"]
tags: ["strategy", "tokenomic"]
post_image: "/assets/images/iron-condor-butterfly-spread.webp"
description: "Two defined-payoff options structures compared through worked ETH and BTC examples, including premiums, break-evens, and settlement risks."
permalink: "/iron-condor-butterfly-spread/"
image_width: 1456
image_height: 816
last_modified_at: 2026-11-22 12:00:00 +0000
---

An iron condor and a butterfly can both express a view that an asset will finish near a price range or target. Their payoff shapes are different: a credit iron condor has a wider region of maximum profit, while a standard long butterfly reaches its maximum at one middle strike.

The distinction becomes clear when the premium is included. Being right about the final price is not enough if the structure costs too much to enter or cannot be settled as expected.

## Options Trading: A Quick Primer

A call's expiry value on one unit is `max(S − K, 0)`; a put's is `max(K − S, 0)`. Here, `S` is the settlement price and `K` is the strike. Profit adds premiums received and subtracts premiums paid, together with fees and other costs.

The examples below are hypothetical. They assume European-style, cash-settled options with the same underlying, expiry, settlement source, and one-unit multiplier. Amounts are in dollars, and fees are omitted to isolate the payoff. Different contract conventions require different calculations.

## Iron Condor Strategy in DeFi

### What is an Iron Condor?

The credit iron condor considered here combines a bull put spread with a bear call spread. It receives a net premium at entry and earns its maximum profit if the asset finishes between the two short strikes. The outer long options cap the contractual loss on either side.

### How Does It Work?

The position has four legs: a long lower-strike put, a short higher-strike put, a short lower-strike call, and a long higher-strike call. All use the same expiration and quantity.

For equal-width wings, maximum profit is the net credit and maximum loss is the wing width minus that credit. The lower break-even is the short put strike minus the credit; the upper break-even is the short call strike plus the credit. See the [Options Institute's iron-condor explanation](https://www.fidelity.com/learning-center/investment-products/options/options-strategy-guide/short-iron-condor-spread).

### DeFi Example

Suppose ETH is at $3,000. Buy a $2,600 put, sell a $2,800 put, sell a $3,200 call, and buy a $3,400 call. Assume the four premiums produce a net credit of $80 per ETH.

Each wing is $200 wide. Maximum profit is $80, maximum loss is $120, and the break-even prices are $2,720 and $3,280.

| ETH settlement price | Combined option payoff | Profit including $80 credit |
| --- | ---: | ---: |
| $2,500 | −$200 | −$120 |
| $2,700 | −$100 | −$20 |
| $3,000 | $0 | $80 |
| $3,300 | −$100 | −$20 |
| $3,500 | −$200 | −$120 |

The long wings cap the expiry loss under the stated assumptions. They do not make the position immune to an oracle failure, liquidation under the venue's margin rules, or a failure to acquire one of the intended legs.

### Why Use It in DeFi?

The structure can express a range-bound view with a defined terminal payoff. Its suitability depends on whether the premium adequately compensates for that view and whether all four legs can be executed and settled consistently.

Before expiration, the position's value also reacts to implied volatility and time remaining. A trader who closes early receives market prices, not the final payoff in the table.

## Butterfly Spread Strategy in DeFi

### What is a Butterfly Spread?

A standard long call butterfly uses equally spaced strikes. It buys one low-strike call, sells two middle-strike calls, and buys one high-strike call. The resulting payoff rises toward the middle strike and falls away on either side.

### How Does It Work?

Let the strike spacing be `W` and the net debit be `D`. For a conventional symmetric butterfly, maximum loss is `D` and maximum profit is `W − D`. The break-evens are the lower strike plus `D` and the upper strike minus `D`.

The [Options Industry Council](https://www.optionseducation.org/strategies/all-strategies/long-call-butterfly) describes this structure and its sensitivity to settlement near the middle strike. Unequal wings or different option ratios produce different payoffs and need a separate calculation.

### DeFi Example

Suppose BTC is at $60,000. Buy one $58,000 call, sell two $60,000 calls, and buy one $62,000 call, for a hypothetical net debit of $600 per BTC.

The $2,000 strike spacing gives a maximum profit of $1,400 at $60,000. Maximum loss is $600. Break-evens are $58,600 and $61,400.

| BTC settlement price | Combined option payoff | Profit after $600 debit |
| --- | ---: | ---: |
| $57,000 | $0 | −$600 |
| $59,000 | $1,000 | $400 |
| $60,000 | $2,000 | $1,400 |
| $61,000 | $1,000 | $400 |
| $63,000 | $0 | −$600 |

The position does not need to finish exactly at $60,000 to profit, but that is where this example achieves its maximum. Small changes near expiry can materially change the result.

### Why Use It in DeFi?

A butterfly can express a more concentrated price view than a condor. Its low entry debit can be attractive, but a small debit is not the same as a high probability of success. Fees and wide option spreads can consume a meaningful part of the potential gain.

## Benefits of Options in DeFi

Smart contracts can make collateral rules and settlement logic inspectable, and they can connect an option position with other on-chain assets. Those are useful infrastructure characteristics when the implementation is reliable.

They do not make every strategy accessible on every venue. Available strikes, eligible collateral, wallet requirements, liquidity, and jurisdictional restrictions can limit what a user can construct.

## Risks to Watch Out For

Separate market risk from implementation risk. The market risk is that the asset finishes outside the desired range. Implementation risk includes mismatched legs, a compromised oracle, unavailable liquidity, contract defects, and rules that permit upgrades or emergency intervention.

### Risk Management Tips

Read the exact specification for all legs and verify the settlement price source. Check whether the margin system recognizes the hedge or treats short options separately. Model early exit as well as expiry, including the cost of closing four contracts. A quoted maximum loss only applies to the position and assumptions used to derive it.

## Implementing Strategies in DeFi

Begin with the table of outcomes, then check whether a protocol can express that table. Confirm multipliers, expirations, settlement currency, and exercise rules. Next, verify that the required options have usable quotes at the intended size and that the combined order does not leave an unhedged short position during execution.

Start with the contract specification and current deployment documentation. Confirm that the venue supports every strike and expiry needed, and that each leg uses compatible collateral and settlement terms.

## Conclusion

A credit iron condor collects premium across a wider target region; a long butterfly concentrates its payoff around a middle strike. Both require careful alignment of their legs.

Their most useful comparison is the complete cash flow: entry debit or credit, possible expiry outcomes, execution costs, collateral requirements, and settlement dependencies. Once those are explicit, the strategy's tradeoffs become much easier to assess.
