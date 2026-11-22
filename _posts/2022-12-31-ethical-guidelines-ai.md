---
layout: posts/post
title: "Ethical guidelines for AI and machine learning"
date: 2022-12-31 00:00:00 +0000
categories: ["ai"]
tags: ["accountability", "artificial-intelligence", "bias"]
post_image: "/assets/images/ethical-guidelines-ai.webp"
description: "A practical approach to AI ethics: define the purpose, examine data and errors, assign responsibility, and give people a way to challenge outcomes."
permalink: "/ethical-guidelines-ai/"
image_width: 1408
image_height: 768
last_modified_at: 2026-11-22 12:00:00 +0000
---

AI ethics becomes useful when it changes a decision: which problem to automate, which data to collect, which errors are acceptable, and who can stop a system that is causing harm. Principles such as fairness, privacy, and accountability need to be translated into choices a team can explain and review.

The starting point is the people affected. A tool that recommends a song and a tool that influences access to a job do not warrant the same tolerance for error. Assess the consequences of a wrong output before choosing the model or defining a success metric.

![Illustration accompanying the original discussion of AI ethics](https://guillaumelauzier.com/wp-content/uploads/2022/12/AI-Ethics-images-02-scaled-1-1024x576.jpg)

## Define a purpose and a boundary

Write down what the system should do, for whom, and under which conditions. Identify uses it should not support. Ask whether a simpler process could meet the need with less data or less uncertainty.

A clear boundary is testable. “Help reviewers find relevant documents” gives a team a different responsibility from “make the final eligibility decision.” Describe where a person must exercise judgment and what information they need to do so.

## Examine the data and the errors

Document the origin of training and evaluation data, the rights to use it, and the people or circumstances it may underrepresent. Collect only what the task needs, restrict access, and decide how long the data should be retained.

Evaluate more than an overall accuracy score. Examine false positives and false negatives, performance across relevant groups, and cases outside the expected input distribution. A model can perform well on average while repeatedly failing a smaller group. Equally, a fairness metric needs a reason for being chosen; different metrics can reflect different goals.

## Make responsibility explicit

Assign an owner for deployment, monitoring, and incident response. Keep a record of the model version, the evaluation evidence, and the reasoning behind material changes. A vendor’s model does not remove the deploying organization’s responsibility for how it is used.

Tell people when AI materially affects their interaction or an important decision. Offer explanations suited to the situation and a practical route to correction or appeal. Human review has value only when the reviewer has enough time, relevant evidence, and authority to disagree with the system.

## Review the system after launch

Check whether actual use matches the original purpose. Monitor changes in data, failure patterns, and user behavior. Define conditions that trigger investigation, rollback, or suspension before an incident creates pressure to improvise.

As a later practical reference, [NIST’s AI Risk Management Framework, published in 2023](https://www.nist.gov/itl/ai-risk-management-framework), organizes this work around governing, mapping, measuring, and managing risk. It supports an ongoing process rather than a one-time ethical approval.

The test of a guideline is whether someone can act on it. Who investigates a complaint? What evidence is retained? What happens when the model and a domain expert disagree? Answering those questions makes ethical commitments part of how the system operates.
