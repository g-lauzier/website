---
layout: posts/post
title: "Federated Learning: Privacy-Preserving Machine Learning"
date: 2022-12-17 00:00:00 +0000
categories: ["cybersecurity"]
tags: ["biased-data", "collaborative-learning"]
post_image: "/assets/images/federated-learning-privacy.webp"
description: "How federated learning keeps training data distributed, why model updates can still leak information, and how to choose an architecture."
permalink: "/federated-learning-privacy/"
image_width: 1408
image_height: 768
last_modified_at: 2026-11-22 12:00:00 +0000
---

Federated learning changes where model training happens. Instead of collecting every participant’s records in one place, it coordinates learning across devices or organizations that retain their own data. That can reduce the need to move sensitive records, but it does not automatically make the resulting system private, secure, or fair.

The useful question is therefore more precise than “Can we train without sharing data?” Ask **which information moves, who can observe it, and what an observer could infer**. A gradient, activation, or trained model can reveal information even when the original record never leaves its owner.

## Federated Learning for Data Privacy

In a typical server-coordinated arrangement, participants receive a model, compute updates using local data, and return those updates for aggregation. The server distributes the revised model and repeats the process. The [original federated averaging research](https://arxiv.org/abs/1602.05629) describes this approach as a way to learn from decentralized data while reducing communication.

There are two broad settings worth distinguishing. **Cross-device learning** may involve many intermittently available phones or other devices. **Cross-silo learning** may involve a smaller group of organizations with more reliable infrastructure. An agreement among several institutions and a training service spanning millions of devices raise different questions about participation, identity, bandwidth, and governance.

Keeping records local can reduce centralized exposure. It does not remove risks at the endpoint, in transit, in aggregation, or in the final model. [Deep Leakage from Gradients](https://arxiv.org/abs/1906.08935), for example, demonstrates that shared gradients can reveal training examples under particular conditions. The result is not that every update exposes every record, but that an update must not be treated as harmless merely because it is not raw data.

Separate the protections by what they do:

- **Transport encryption and authentication** protect communication and identify participants.
- **Secure aggregation** can let a server obtain an aggregate without seeing each individual contribution, subject to the protocol’s assumptions.
- **Differential privacy** can bound how much the released result depends on an individual contribution when noise, clipping, and privacy accounting are correctly designed.
- **Access controls and monitoring** govern who can use models, submit updates, or query outputs.

[Bonawitz and colleagues’ secure aggregation work](https://arxiv.org/abs/1611.04482) addresses the second of these problems. It does not, by itself, guarantee that the aggregate model reveals nothing about its training data.

## Architectures

It helps to distinguish a learning **setting**, an optimization **algorithm**, and a system **architecture**. Federated averaging and federated SGD describe ways of updating parameters. Split learning partitions a model across participants. “Collaborative” and “hybrid” are broader labels whose meaning depends on the design.

The [research survey *Advances and Open Problems in Federated Learning*](https://research.google/pubs/advances-and-open-problems-in-federated-learning/) describes the challenges created by heterogeneous data, systems, and privacy requirements. A design should state these assumptions rather than imply that one named approach solves them all.

For a concrete starting point, imagine three organizations with different customer populations. They can agree on a shared prediction task while disagreeing on data definitions, label quality, or acceptable errors. Distribution of the computation does not settle any of those questions. Resolve the task and evaluation contract before comparing training protocols.

## Federated Averaging

Federated averaging, often called **FedAvg**, lets each selected participant take several local optimization steps before returning model parameters or a parameter update. The coordinator combines contributions, commonly weighting them by the amount of local training data, to form the next global model.

A round looks like this:

1. The coordinator selects participants and sends the current parameters.
2. Each participant performs a specified amount of local training.
3. Participants return updates through the chosen security protocol.
4. The coordinator aggregates accepted updates and begins the next round.

The number of local steps is a practical trade-off. More local work can reduce communication rounds, but it can also make participants’ models diverge when their data differ. Weighting by dataset size is an optimization choice; it does not establish fair performance across groups.

Evaluate the global model on more than a pooled average. In the three-organization example, a large site can dominate the aggregate while a smaller site experiences worse results. The evaluation should reveal that outcome before deployment.

## Federated Stochastic Gradient Descent

Federated SGD aggregates locally computed gradients and uses them for a global parameter update. Compared with taking multiple local steps in FedAvg, this generally means more frequent communication for a similar sequence of optimization steps.

That can make reasoning about a synchronized update easier, but it is not inherently the best choice for a low-bandwidth environment. Nor does sending gradients create stronger privacy guarantees than sending parameters. Privacy depends on what the messages reveal and which protections surround them.

When comparing the two approaches, measure communication volume, rounds to reach a chosen quality threshold, participant dropouts, and performance on each relevant population. A nominally cheaper local computation may still produce a slower end-to-end training job.

## Split Learning

Split learning divides the model at a **cut layer**. A client computes the early layers on its data and sends intermediate activations to the server. The server computes subsequent layers and returns gradients so the client can complete backpropagation. This is a different mechanism from averaging several clients’ activations into a new model.

The [original split-learning research](https://arxiv.org/abs/1812.00564) explores arrangements in which raw records remain at their source. The placement of labels and model segments depends on the particular arrangement.

Splitting can shift computation away from a constrained client, but it can require frequent exchanges during training. Intermediate representations may also leak information. The location of the cut layer changes both computation and exposure, so “the server never receives the raw record” is only the beginning of the analysis.

## Hybrid Federated Learning

A hybrid system may combine local training, model partitioning, secure computation, or different coordination methods. The term is not a single standardized algorithm, and there is no universal six-step procedure that defines it.

Describe a hybrid by its actual data flow. Which participant holds each layer? Which messages are exchanged? Who aggregates updates? What happens when a participant drops out? What can a malicious participant submit? These questions make a proposal assessable.

A more elaborate design is justified when it resolves an identified constraint. If several organizations can train a small model locally and communicate reliably, adding a split-model service may introduce complexity without improving the property they care about.

## Collaborative Learning

“Collaborative learning” is an umbrella description for parties learning together. Some systems coordinate through a central server; others exchange information among peers. Peer-to-peer communication changes the trust relationships, but it does not eliminate them.

A practical collaboration needs shared feature definitions, a model-release process, responsibilities for incidents, and an agreement about permitted use of the result. Participants also need a way to detect poor-quality or malicious updates. Secure aggregation can complicate that task because hiding individual updates makes individual inspection harder.

Keep the objective visible: a useful model under explicit data and trust constraints. A system can distribute training successfully and still fail because labels mean different things at different sites or because the final model is unsuitable for its intended users.

## Deciding whether to federate {#conclusion}

Start with a baseline that each participant can evaluate locally. Specify the collaboration’s expected benefit and the information it may expose. Then compare a federated model against that baseline using the same held-out criteria, including performance for smaller participants.

Assess operating costs as well as model quality: client availability, communication, version compatibility, security review, and the work needed to maintain a shared schema. Document the threat model and any privacy guarantee separately from the model’s predictive performance.

Federated learning is valuable when distributed data and a shared task create a reason to collaborate. Its architecture can support privacy goals, but the privacy claim belongs to the complete system, not to the word “federated.”
