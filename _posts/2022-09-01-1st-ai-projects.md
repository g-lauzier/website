---
layout: posts/post
title: "1st AI projects"
date: 2022-09-01 00:00:00 +0000
categories: ["ai"]
tags: ["ai", "artificial-intelligence"]
post_image: "/assets/images/1st-ai-projects.webp"
description: "Logic Theorist, General Problem Solver, and ELIZA: three early approaches to machine intelligence, and what their limits still teach us."
permalink: "/1st-ai-projects/"
image_width: 1408
image_height: 768
last_modified_at: 2026-11-22 12:00:00 +0000
---

Early artificial intelligence explored a question that still matters: which parts of human reasoning can be expressed as procedures a computer can follow? Three influential projects approached it differently. Logic Theorist searched for proofs, General Problem Solver organized problem solving, and ELIZA generated conversational responses.

These systems did not learn from vast datasets in the way many contemporary models do. Their capabilities depended on representations, rules, and search strategies designed by people. Looking at those mechanisms is more informative than describing them simply as machines that could “think.”

## Logic Theorist

![Historical illustration of the Logic Theorist](https://guillaumelauzier.com/wp-content/uploads/2022/12/4-Figure1-1.png)

Allen Newell, Herbert Simon, and J. C. “Cliff” Shaw developed Logic Theorist in the mid-1950s. Its task was to find proofs for propositions in the symbolic logic of *Principia Mathematica*. Shaw’s contribution matters: implementing the ideas was part of the research, not a separate detail.

The program represented logical expressions symbolically and used heuristics to decide which proof steps to explore. A heuristic does not guarantee the shortest route to a solution. It makes the search more selective, directing limited computation toward promising steps.

The [researchers’ account of the Logic Theory Machine](https://iiif.library.cmu.edu/file/Newell_box00028_fld01976_doc0005/Newell_box00028_fld01976_doc0005.pdf) describes an experiment in how difficult problems can be solved without exhaustively trying every possibility. Its significance was specific: a machine could manipulate symbols and discover proofs within a formal system. That did not establish a general ability to understand mathematics or the world.

This distinction remains useful. Success on a precisely defined task is evidence about that task; broader intelligence requires additional evidence.

## GPS

![Historical illustration associated with General Problem Solver](https://guillaumelauzier.com/wp-content/uploads/2022/12/school-gps.png)

General Problem Solver, developed by Newell, Shaw, and Simon from 1957, tried to separate a reusable problem-solving method from the details of an individual problem. [Carnegie Mellon’s historical account](https://digitalcollections.library.cmu.edu/cmu-collection/herbert-simon) connects its development to observations of how people described their own reasoning.

Its central method was **means–ends analysis**: compare the current state with the desired state, identify a difference, and select an operation that might reduce that difference. If the operation cannot yet be applied, solve the prerequisite as a smaller subproblem.

Imagine a puzzle in which a piece must move to a target square, but another piece blocks the route. “Clear the route” becomes an intermediate goal. The program can reuse this pattern, provided the puzzle has been encoded as states, legal operations, and goals.

That qualification is the limit behind the name. GPS was not a universal solver for arbitrary real-world problems. Someone still had to supply an appropriate representation and useful operators. A search method cannot compensate for an incomplete description of what actions mean or which outcomes count as success.

The lasting idea is the separation between a reasoning procedure and the knowledge it operates on. The difficult work often lies in both.

## ELIZA

![Historical illustration associated with ELIZA](https://guillaumelauzier.com/wp-content/uploads/2022/12/4-Figure2-1.png)

Joseph Weizenbaum described ELIZA in a [1966 paper](https://courses.cs.umbc.edu/undergraduate/CMSC471/papers/weizenbaum.eliza.1966.pdf). The program used scripts, keyword matching, and rules for decomposing and reassembling input. Its best-known script, DOCTOR, adopted the conversational style of a nondirective therapist.

That setting was clever because reflecting a person’s words back as a question could keep a conversation moving without requiring detailed knowledge of the subject. An input about a family member, for example, could trigger a response asking the user to say more about their family. The apparent relevance came from a rule and the user’s interpretation, not a clinical understanding of their situation.

ELIZA therefore offers two lessons. First, a narrow mechanism can create a compelling interface. Second, a compelling interface can encourage people to attribute more understanding to a system than its mechanism supports.

Logic Theorist, GPS, and ELIZA made different capabilities visible: symbolic search, goal-directed planning, and conversational pattern matching. Their limitations are part of their importance. To evaluate any AI system, ask what it represents, how it produces an answer, and where the evidence for its competence stops.
