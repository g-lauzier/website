---
layout: posts/post
title: "Monte Carlo Simulation in Finance: Traditional and Decentralized"
date: 2023-06-17 00:00:00 +0000
categories: ["fintech"]
tags: []
post_image: "/assets/images/writing/monte-carlo-simulation-finance.webp"
description: "Using random sampling to estimate financial outcomes, distinguish model risk from sampling error, and test scenarios in traditional finance and DeFi."
permalink: "/monte-carlo-simulation-finance/"
image_alt: "Graphite and cobalt beads disperse toward glass bowls, evoking many possible outcomes under uncertainty."
post_image_small: "/assets/images/writing/monte-carlo-simulation-finance-640.webp"
post_image_medium: "/assets/images/writing/monte-carlo-simulation-finance-960.webp"
image_width: 1600
image_height: 900
image_caption: "Editorial illustration."
original_post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2023/06/generatedart_Monte_Carlo_Simulation_Finance_37395abb-80e4-4b6b-a5ca-465ee649e98d-2.png"
last_modified_at: 2026-11-22 12:00:00 +0000
---

Monte Carlo simulation estimates outcomes by repeatedly sampling from a model. In finance, that can mean generating price paths, valuing a payoff, or measuring how a portfolio behaves under uncertain conditions.

It does not reveal every possible future or turn uncertainty into certainty. Its answers are conditional on the model, parameters, and data. More simulations reduce sampling noise; they cannot repair an incorrect assumption about the market.

## Monte Carlo Simulation in Traditional Finance

### Options Pricing

Simulation is useful when a derivative's payoff depends on several risk factors or on the path taken by an asset. A European call has a relatively simple terminal payoff; an Asian option, whose payoff depends on an average price, requires information along the path.

For valuation, the simulation must use a pricing model consistent with the relevant market assumptions. In a standard risk-neutral approach, the estimate is the discounted average simulated payoff. That is different from forecasting the asset's real-world expected return. Paul Glasserman's [Monte Carlo Methods in Financial Engineering](https://doi.org/10.1007/978-0-387-21617-1) develops this distinction and its applications.

Using Monte Carlo also does not automatically remove Black–Scholes assumptions. A simulation with constant volatility still has constant volatility. The numerical method and the market model are separate choices.

### Investment Portfolio Optimization

A portfolio model can simulate joint returns and compare candidate allocations. Correlations matter: sampling each asset independently can severely misrepresent how a portfolio behaves when assets move together.

The result can help answer a specific question, such as how often a portfolio falls below a funding threshold under the assumed model. It should not be described as a forecast probability without explaining the assumptions used to generate the paths. Optimizing against those paths can also overfit the scenario set.

### Risk Management

Simulation can estimate a distribution of losses over a chosen horizon. Value at Risk is a quantile of that distribution, not the maximum possible loss. Expected shortfall examines losses beyond a specified tail threshold, giving more information about the severity of unfavorable outcomes.

Both measures depend on the chosen distribution and portfolio valuation. A precise estimate under a mild-tailed model can still understate real tail risk. Stress scenarios should therefore challenge the model rather than merely repeat its typical behavior.

## Monte Carlo Simulation in Decentralized Finance (DeFi)

### Liquidity Provision and Yield Farming

For a liquidity position, simulate the assets, the pool's pricing rules, trading fees, and any rebalancing strategy. Compare the result with an explicit alternative, such as holding the same initial assets outside the pool.

A model that includes only token prices may miss fee income, concentrated-liquidity ranges, reward-token dilution, and the costs of repositioning. “Impermanent loss” should be interpreted as a relative performance measure under specified conditions; withdrawing a position does not guarantee that the loss reverses.

### DeFi Derivatives

On-chain derivatives add settlement and collateral details to the usual market model. If an option settles against an averaged oracle price, simulate that rule. If collateral is volatile, model the collateral as well as the underlying payoff. An option with a bounded dollar payoff may still have a different risk profile when margined in another asset.

### DeFi Protocol Risk Assessment

Simulation can explore the consequences of a price shock, a withdrawal surge, or delayed liquidation. For example, a lending model could vary collateral prices and available liquidation liquidity to estimate shortfalls under selected scenarios.

It cannot discover arbitrary smart-contract vulnerabilities merely by generating random market paths. Code review, testing, and security analysis address different questions. Simulation is useful when the failure mechanism has been represented in the model; omitted mechanisms remain omitted.

## The Mathematical Principle of Monte Carlo Simulation

Let `X` represent uncertain inputs and `Y = f(X)` the quantity of interest. To estimate the model's expected value of `Y`, draw inputs `X₁, …, Xₙ`, compute the corresponding outputs, and take their average:

```text
estimated expectation = (f(X₁) + ... + f(Xₙ)) / N
```

Under suitable assumptions, the law of large numbers explains convergence to the model expectation. For independent, identically distributed samples with finite variance, the standard error of the mean scales as `1 / sqrt(N)`. Reducing it by a factor of ten therefore requires one hundred times as many samples. The University of Michigan's [standard-error notes](https://dept.stat.lsa.umich.edu/~kshedden/introds/topics/standard_errors/) explain this relationship and the corresponding formula for a sample proportion.

A simple geometric example estimates pi. Draw points uniformly in the square from −1 to 1 on both axes. The proportion inside the unit circle estimates the ratio of the circle's area to the square's area. Multiplying that proportion by four estimates pi.

```text
inside = 0
repeat N times:
    x = uniform sample between -1 and 1
    y = uniform sample between -1 and 1
    if x*x + y*y <= 1:
        inside += 1
pi_estimate = 4 * inside / N
```

## C++ Implementation for Estimating Pi

This C++11 example uses a fixed seed to make repeated runs reproducible within the same implementation. It rejects a non-positive sample count and reports an approximate Monte Carlo standard error alongside the estimate.

```cpp
#include <cmath>
#include <cstdint>
#include <iostream>
#include <random>
#include <stdexcept>

struct Estimate {
    double value;
    double standard_error;
};

Estimate estimate_pi(std::int64_t iterations, std::uint64_t seed) {
    if (iterations <= 0) {
        throw std::invalid_argument("iterations must be positive");
    }
    std::mt19937_64 generator(seed);
    std::uniform_real_distribution<double> uniform(-1.0, 1.0);
    std::int64_t inside = 0;

    for (std::int64_t i = 0; i < iterations; ++i) {
        const double x = uniform(generator);
        const double y = uniform(generator);
        if (x * x + y * y <= 1.0) {
            ++inside;
        }
    }
    const double n = static_cast<double>(iterations);
    const double p = static_cast<double>(inside) / n;
    return {4.0 * p, 4.0 * std::sqrt(p * (1.0 - p) / n)};
}

int main() {
    const auto result = estimate_pi(1000000, 42);
    std::cout << "Pi estimate: " << result.value
              << "\nApproximate standard error: "
              << result.standard_error << '\n';
}
```

Compile with `g++ -std=c++11 -O2 monte_carlo.cpp -o monte_carlo`. The random engine is suitable for this numerical demonstration, not for cryptographic key generation. Standard-library implementations may transform random draws differently, so the exact output is not a cross-platform guarantee.

The standard error measures sampling uncertainty for this estimator. It does not cover a programming error or a wrong geometric model. That separation is directly relevant to financial simulation.

## Monte Carlo Simulation in Conjunction with Other Algorithms

### Algorithmic Trading

Simulation can stress a strategy under generated scenarios or resampled returns. Historical backtesting instead evaluates it against an observed sequence. The two can complement each other, but neither should use information that would have been unavailable at the decision time.

Include the execution mechanism: spreads, fees, latency, market impact, and failed orders where relevant. A strategy that appears profitable before costs may not survive realistic trading assumptions.

### Risk Management

A useful process combines simulated distributions with deliberately adverse scenarios. Vary parameters, dependence assumptions, liquidity, and recovery rates. Report how the decision changes, not only the average result.

Rare events require particular care. If an event has very low probability under the model, a modest number of ordinary samples may never produce it. The absence of an event in a run is not evidence that its risk is zero.

### Portfolio Optimization

Use simulation to compare decisions under uncertainty, then evaluate the selected decision on fresh scenarios. Otherwise, the optimization can exploit random features of the same paths used to judge it.

Sensitivity analysis is often more useful than presenting one optimal weight vector. If small changes in expected returns produce a completely different portfolio, the apparent precision of the allocation deserves scrutiny.

## Conclusion

Monte Carlo is a way to make assumptions produce measurable consequences. Its strongest use is to compare decisions, expose sensitivity, and quantify sampling uncertainty under a stated model.

Before trusting a result, identify the distribution being sampled, the mechanism being simulated, and the risks that remain outside it. Then ask whether the numerical precision is meaningful relative to the uncertainty in those choices.
