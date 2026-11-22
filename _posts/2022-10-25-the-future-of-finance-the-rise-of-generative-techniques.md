---
layout: posts/post
title: "The future of finance: The rise of generative techniques"
date: 2022-10-25 00:00:00 +0000
categories: ["fintech"]
tags: ["artificial-intelligence", "asset-pricing"]
post_image: "/assets/images/writing/the-future-of-finance-the-rise-of-generative-techniques.webp"
description: "How generative models can support financial scenarios and research, and why validation matters more than plausible output."
permalink: "/the-future-of-finance-the-rise-of-generative-techniques/"
post_image_small: "/assets/images/writing/the-future-of-finance-the-rise-of-generative-techniques-640.webp"
post_image_medium: "/assets/images/writing/the-future-of-finance-the-rise-of-generative-techniques-960.webp"
image_width: 1600
image_height: 900
image_alt: "Smoked-glass curves fan outward around a blue path, suggesting alternative financial futures."
image_caption: "Editorial illustration."
original_post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2022/12/1-s2.0-S0378437119307277-gr2.jpg"
last_modified_at: 2026-11-22 12:00:00 +0000
---

A financial model becomes useful when it improves a decision under uncertainty. Generating more scenarios, forecasts, or investment ideas is only the beginning; the harder task is establishing which outputs deserve to influence capital allocation.

I use **generative finance** here as a descriptive term for applying generative and computational methods to financial research. It is not a single standardized discipline. The work overlaps with established quantitative finance: simulation, statistical modeling, optimization, and machine learning.

It also helps to separate prediction from generation. A model that estimates next-period returns makes a forecast. A model that creates plausible return paths generates scenarios. Those tasks can support each other, but a realistic-looking scenario is not evidence that a forecast will be accurate.

## Applications of generative finance

Three applications make the idea practical.

**Scenario generation** creates alternative paths for prices, interest rates, or liquidity. A risk team can use those paths to examine how a portfolio might behave under different assumptions. The value comes from covering relevant conditions, including stress, rather than producing a large volume of similar simulations.

**Research support** helps organize information and propose hypotheses. For example, a model might suggest relationships between a company's exposure to energy prices and its financing needs. The analyst still needs to check the underlying documents, dates, and causal reasoning before treating the suggestion as an investment thesis.

**Synthetic data** can support development when real observations are scarce or sensitive. It requires careful evaluation: generated samples may reproduce training biases, miss rare events, or disclose patterns from the source data. Synthetic does not automatically mean representative or private.

![Illustration originally accompanying this discussion of generative finance.](https://guillaumelauzier.com/wp-content/uploads/2022/12/0E6Wg6QsQPNIYbWLc.jpg)

## Advantages of generative finance

The main advantage is the ability to explore assumptions systematically. Instead of discussing one forecast, a team can compare how a decision behaves across multiple plausible environments.

Automation can also reduce repetitive work: preparing scenario inputs, classifying documents, or checking whether a proposed portfolio breaches a limit. That gives analysts more time to investigate exceptions and challenge the model.

A third advantage is consistency. A defined process can apply the same calculation to many assets or portfolios. Consistency makes review easier, but it does not guarantee correctness: an incorrect assumption can be applied very efficiently.

These benefits should be measured against a simpler baseline. If a complex generative model does not improve a relevant decision, its additional maintenance and validation costs may be difficult to justify.

## Challenges and limitations of generative finance

**Data quality and timing.** Training data must reflect what was actually available at the decision date. Using revised data, future constituents, or later disclosures can make a historical result look stronger than a deployable strategy.

**Changing conditions.** Relationships learned during one market regime may weaken in another. A model trained on liquid markets may say little about the price at which a position can be sold during stress.

**Interpretation.** An output needs a traceable connection to the assumptions that produced it. Analysts should be able to explain what changed between model versions and which inputs drive the decision.

**Validation.** Separate model development from evaluation. Use data outside the training period, compare against established methods, include trading costs where relevant, and test sensitivity to uncertain parameters. Good performance on a convenient historical window is insufficient evidence of durable value.

**Governance.** Decide who can approve use, change inputs, override outputs, and stop the system. For traditional quantitative models, the [Federal Reserve's revised model-risk guidance](https://www.federalreserve.gov/supervisionreg/srletters/sr2602.htm) provides a current reference on risk-based governance. Its [2026 scope statement](https://www.federalreserve.gov/frrs/guidance/supervisory-guidance-on-model-risk-management.htm) explicitly excludes generative and agentic AI; it should not be presented as a complete governance framework for those systems.

## The future of generative finance

The most credible applications will connect a model to a specific decision and a measurable standard of improvement. A scenario generator might be judged on coverage of relevant stress conditions. A research assistant might be judged on factual accuracy and analyst time saved. A trading model needs evaluation after fees, slippage, and realistic execution constraints.

The opportunity is to make financial reasoning more explicit and testable. That requires more than convincing output: it requires a process for finding the model's errors before those errors become positions.
