---
layout: posts/post
title: "How to spot AWS Savings Plan gaps before the bill arrives"
date: 2026-04-08 00:00:00 +0000
last_modified_at: 2026-11-22 12:00:00 +0000
categories: ["infrastructure"]
tags: ["cloud-cost", "aws", "finops"]
description: "Review coverage and utilization together, inspect hourly commitments, and distinguish a real Savings Plan gap from usage that should stay On-Demand."
permalink: "/how-to-spot-aws-savings-plan-gaps/"
canonical_url: "https://algosize.com/blog/how-to-spot-aws-savings-plan-gaps/"
post_image: "/assets/images/writing/aws-savings-plan-gaps.webp"
post_image_small: "/assets/images/writing/aws-savings-plan-gaps-640.webp"
post_image_medium: "/assets/images/writing/aws-savings-plan-gaps-960.webp"
image_alt: "Rows of graphite compute modules extend beyond translucent blue glass coverage bands."
image_caption: "Editorial illustration."
image_width: 1600
image_height: 900
---

_Originally published on [Algosize](https://algosize.com/blog/how-to-spot-aws-savings-plan-gaps/) — service provisioning by [algosize.com](https://algosize.com)._

A Savings Plan can be fully utilized while a substantial amount of eligible usage is still billed On-Demand. It can also be underutilized during quiet hours and exhausted during busy ones. A single monthly percentage will not explain both situations.

The useful review combines utilization, coverage, and the workload behind them. The four checks below help identify where a commitment no longer fits. They also help avoid buying a larger commitment to cover usage that should instead be stopped, resized, or left flexible.

## The metric you actually want

**Utilization** measures how much of the purchased commitment was used. **Coverage** measures the share of eligible usage covered, valued at equivalent On-Demand rates. They have different denominators. The [AWS coverage calculation](https://docs.aws.amazon.com/savingsplans/latest/userguide/ce-sp-cr-metrics.html) and [utilization definition](https://docs.aws.amazon.com/aws-cost-management/latest/APIReference/API_SavingsPlansUtilization.html) make that distinction explicit.

Track uncovered eligible On-Demand cost and unused commitment together. A large uncovered amount is a candidate for investigation, not automatically the amount a new plan would save. The potential saving depends on applicable rates, the duration of the workload, and the risk of paying for commitment that later goes unused.

A Savings Plan is a billing commitment expressed in dollars per hour. It is not a futures contract or a reservation of physical capacity. Critically, unused commitment from one hour does not carry into another. [AWS's application rules](https://docs.aws.amazon.com/savingsplans/latest/userguide/sp-applying.html) describe how eligible usage consumes it.

## Gap 1: family-mismatch

First identify the plan type. Compute Savings Plans can cover eligible EC2 usage across families and regions, as well as eligible Fargate and Lambda usage. An EC2 Instance Savings Plan is tied to an instance family in a selected region. The distinction is documented in [AWS's plan-type guide](https://docs.aws.amazon.com/savingsplans/latest/userguide/plan-types.html).

A migration from one family to another may therefore strand an EC2 Instance commitment while the new family incurs On-Demand charges. A Compute plan does not require the new instance's rate to equal the commitment; eligible usage consumes the dollar commitment at its applicable Savings Plans rate.

Inspect the inventory alongside the migration plan. Record the family, region, owner account, hourly commitment, and end date. Compare them with the workloads expected to remain after rightsizing and scheduled migrations.

At renewal, compare the discount and flexibility of a replacement plan against that forecast. There is no universal percentage penalty for choosing flexibility, and an existing plan's terms should not be assumed to be freely convertible.

## Gap 2: region-mismatch

A regional EC2 Instance commitment may stop fitting when a workload moves. A Compute Savings Plan is region-flexible; buying a separate “DR-region Compute plan” is therefore not the remedy merely because the destination region changed.

For a failover exercise, ask whether the original workload continues running, whether total eligible usage rises, and whether account sharing permits the plan to apply. Model the exercise as additional or shifted usage at the relevant rates.

Keep service-specific purchasing arrangements separate. SageMaker AI Savings Plans are also region-flexible under AWS's documented terms. Database plans, Reserved Instances, and other commitments have their own scope; consult the applicable product documentation rather than applying an EC2 rule to everything.

A short, infrequent exercise may reasonably remain On-Demand. Its cost should be budgeted and tested against the actual recovery requirements. Do not introduce interruptible capacity simply to make the rehearsal cheaper unless the system's resilience design supports it.

## Gap 3: instance-class skew

A larger instance or a variant with a different rate can consume an hourly dollar commitment faster. That is different from an automatic exclusion of a storage or network “premium.” Inspect full instance types and actual covered usage before attributing a gap to a suffix.

The same review should separate instance charges from adjacent charges. An application's bill can include storage, data transfer, and service fees that the relevant compute commitment does not discount. Increasing the compute commitment will not make unrelated line items eligible.

Use a narrowly scoped query to find candidate On-Demand EC2 usage. This example targets a classic CUR Athena schema; replace the table and date window, and adapt column names for your export schema. It is a screening query, not a complete Savings Plans savings calculation.

```sql
SELECT
  line_item_usage_account_id,
  product_region,
  product_instance_type,
  SUM(line_item_unblended_cost) AS on_demand_ec2_cost
FROM cur_table
WHERE line_item_usage_start_date >= TIMESTAMP '2026-11-01 00:00:00'
  AND line_item_usage_start_date < TIMESTAMP '2026-11-08 00:00:00'
  AND line_item_line_item_type = 'Usage'
  AND line_item_product_code = 'AmazonEC2'
  AND product_product_family = 'Compute Instance'
  AND pricing_term = 'OnDemand'
GROUP BY 1, 2, 3
ORDER BY on_demand_ec2_cost DESC;
```

Review matching `SavingsPlanCoveredUsage`, `SavingsPlanNegation`, and commitment charges separately. Summing all of these indiscriminately can double-count costs or mix different measures. The [CUR Savings Plans guide](https://docs.aws.amazon.com/cur/latest/userguide/cur-sp.html) explains the line items and effective-cost fields. Reconcile your result with Cost Explorer using the same accounts, period, and cost basis.

## Gap 4: sandbox and dev burn

Development environments often differ from production: they may run only during working hours, appear for a short experiment, or remain active accidentally. Those are different purchasing problems.

Tag and assign ownership before deciding on coverage. Shut down forgotten resources, schedule work that does not need to run continuously, and establish budgets or provisioning controls. Only then consider whether the remaining baseline is predictable enough to support a commitment.

An automatic 10–15% commitment buffer can turn intermittent experiments into a fixed bill. Spare hourly commitment is paid for even when unused. Size the plan against a conservative, durable workload forecast, and evaluate bursts separately.

## A focused weekly review {#a-weekly-review-that-takes-20-minutes}

Once the queries and owners are in place, a short recurring review can focus on changes rather than reconstructing the bill:

1. Compare utilization, coverage, unused commitment, and uncovered eligible cost over the same period.
2. Break material changes down by account, service, region, and instance family or type.
3. Check plan expirations, sharing settings, migrations, and workload schedules.
4. Assign an action: stop waste, resize, repair allocation settings, budget a temporary burst, or evaluate future commitment.
5. Revisit the action after the next complete billing-data update.

The duration depends on the account's complexity. Choose thresholds proportionate to the bill and record decisions so that the same anomaly is not investigated from scratch every week.

## What this looks like end-to-end

Consider a hypothetical $10-per-hour commitment and a single workload whose plan rate is half its On-Demand rate. This deliberately simplified example excludes other plans, fees, credits, and taxes.

| Hour | Eligible usage at On-Demand rates | Commitment consumed | Unused commitment | Uncovered On-Demand cost |
| --- | ---: | ---: | ---: | ---: |
| Quiet hour | $12 | $6 | $4 | $0 |
| Busy hour | $32 | $10 | $0 | $12 |
| Total | $44 | $16 | $4 | $12 |

Utilization is 16 ÷ 20 = **80%**. Covered usage has an On-Demand equivalent of $12 + $20 = $32, so coverage is 32 ÷ 44, or approximately **72.7%**. Total cost in this model is the $20 commitment plus $12 On-Demand, or $32.

The account has both unused commitment and uncovered usage because the hours differ. Buying enough commitment for the busy hour would increase the amount left unused in the quiet hour. The right decision depends on how often each pattern occurs and what workload will remain throughout the term.

A useful cost review ends with that decision, supported by the hourly evidence. Read coverage and utilization together, then investigate the work behind the bill.

---

_Service provisioning by [algosize.com](https://algosize.com) — algorithm and allocation profiling, vulnerability scanning, and cloud cost analysis for engineering teams._
