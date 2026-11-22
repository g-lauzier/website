---
layout: posts/post
title: "Graph Neural Networks: Revolutionizing Data Analysis in Graph-Structured Domains"
date: 2023-08-01 00:00:00 +0000
categories: ["ai"]
tags: []
post_image: "/assets/images/writing/graph-neural-networks.webp"
description: "How graph neural networks learn from relationships, where message passing helps, and a small PyTorch Geometric example."
permalink: "/graph-neural-networks/"
image_alt: "A sculptural network of metal rods and graphite junctions shows a cobalt signal passing between neighboring nodes."
post_image_small: "/assets/images/writing/graph-neural-networks-640.webp"
post_image_medium: "/assets/images/writing/graph-neural-networks-960.webp"
image_width: 1600
image_height: 900
image_caption: "Editorial illustration."
original_post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2023/12/01825e05-3190-4e71-bd11-c31cff37a834_grid_0.webp"
last_modified_at: 2026-11-22 12:00:00 +0000
---

Some prediction problems depend on relationships as much as on the properties of individual objects. A molecule has atoms and bonds. A transport network has stops and connections. A graph neural network (GNN) provides a way to learn from both the objects and their links.

The important design choice comes before the neural network: **what should count as a node, an edge, and an input feature?** A powerful model cannot recover a meaningful relationship from an arbitrary graph simply because the data have been arranged as connections.

## Understanding Graph Neural Networks

### Direct Application to Graphs

A graph represents objects as nodes and relationships as edges. Predictions can concern a node, a possible edge, or the graph as a whole. These are different tasks: classifying an account, predicting a relationship, and estimating a molecular property require different targets and evaluation methods.

### Processing Complex Graph-Structured Data

Unlike a regular image grid, a graph can have a variable number of neighbors per node. A GNN therefore needs a way to combine information without depending on an arbitrary ordering of those neighbors. Common aggregations include sums, averages, and learned attention mechanisms.

The features matter too. Two nodes with the same connections may represent different things if their attributes differ. Conversely, a graph can add little value when its edges do not contain information relevant to the task.

### Dependence on Graph Structure

In message passing, each node receives information from its neighbors and updates its representation. Stacking layers expands the neighborhood that can influence a node. [Kipf and Welling’s graph convolutional network](https://arxiv.org/abs/1609.02907) is an influential example combining local graph structure with node features.

More layers are not automatically better. Repeated mixing can make node representations difficult to distinguish, and a large neighborhood can be expensive to process. Start with a shallow baseline and test whether additional graph context actually improves the chosen task.

## Expansive Applications of GNNs

### Versatility in Various Fields

Molecules, recommendation systems, transport networks, and physical meshes all offer plausible graph representations. The representation must match the question. In a recommendation graph, an edge might mean a purchase, a click, or a rating; treating those events as equivalent can discard the very distinction the model needs.

### From Foundations to Frontiers

Evaluation is especially important when related examples share a graph. If information from the future or from held-out labels enters the features or connections, apparent performance may reflect leakage. Choose splits that match the deployment question: unseen nodes, a later time period, or entirely new graphs.

Compare with a model that uses node features alone. If it performs just as well, the added graph machinery may not justify its cost. This comparison also helps identify whether the graph contributes information or merely complexity.

## How can Graph Neural Networks be used in Generative Art?

A graph can represent a mesh, a network of strokes, or relationships among elements in a composition. A model might predict how vertices move, which elements should connect, or attributes such as color and thickness.

These are design possibilities, not capabilities provided automatically by a classifier. A generative system needs an explicit output representation, a training objective, and a renderer. For an exploratory artwork, start with a small graph whose relationships can be inspected and change one part of the pipeline at a time.

## Python code example of a Graph Neural Networks

The following example keeps the original two-layer GCN and adds the missing data and optimization step. It requires PyTorch and PyTorch Geometric. The five-node graph and random features are **synthetic teaching data**; one training step demonstrates the API, not useful predictive performance.

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv

class GCN(nn.Module):
    def __init__(self, num_features, num_classes):
        super().__init__()
        self.conv1 = GCNConv(num_features, 16)
        self.conv2 = GCNConv(16, num_classes)

    def forward(self, data):
        x = self.conv1(data.x, data.edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.5, training=self.training)
        return F.log_softmax(self.conv2(x, data.edge_index), dim=1)

torch.manual_seed(7)
data = Data(
    x=torch.randn(5, 10),
    edge_index=torch.tensor([
        [0, 1, 1, 2, 2, 3, 3, 4],
        [1, 0, 2, 1, 3, 2, 4, 3],
    ], dtype=torch.long),
    y=torch.tensor([0, 1, 2, 0, 1]),
    train_mask=torch.tensor([True, True, True, False, False]),
)
model = GCN(num_features=10, num_classes=3)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

model.train()
optimizer.zero_grad()
log_probabilities = model(data)
loss = F.nll_loss(
    log_probabilities[data.train_mask], data.y[data.train_mask]
)
loss.backward()
optimizer.step()

model.eval()
with torch.no_grad():
    print(model(data).shape)  # Five nodes, three class scores: [5, 3]
```

`edge_index` has two rows: source and destination indices. Both directions are included for each undirected edge. The training mask selects which labels contribute to the loss; it does not remove the other nodes from message passing. That is a transductive setup, which should be chosen deliberately.

The [PyTorch Geometric introduction](https://pytorch-geometric.readthedocs.io/en/latest/get_started/introduction.html) documents these data structures. For a real task, replace the synthetic graph, define a meaningful split, and inspect errors alongside a simpler baseline. The graph should earn its place in the model.
