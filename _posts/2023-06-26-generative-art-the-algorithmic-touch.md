---
layout: posts/post
title: "Generative Art: The Algorithmic Touch"
date: 2023-06-26 00:00:00 +0000
categories: ["digital-art"]
tags: ["cellular-automata"]
post_image: "/assets/images/writing/generative-art-the-algorithmic-touch.webp"
description: "A practical guide to thirteen generative techniques: what each controls, where it is useful, and which assumptions can mislead an artist."
permalink: "/generative-art-the-algorithmic-touch/"
image_alt: "A branching metal sculpture grows into intricate curls and lace-like forms, expressing algorithmic creativity."
post_image_small: "/assets/images/writing/generative-art-the-algorithmic-touch-640.webp"
post_image_medium: "/assets/images/writing/generative-art-the-algorithmic-touch-960.webp"
image_width: 1600
image_height: 900
image_caption: "Editorial illustration."
original_post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2023/06/generatedart_fractal_art_7eeffb8b-eb2b-4e45-b8c2-9ac36d7d9c35-2.png"
last_modified_at: 2026-11-22 12:00:00 +0000
---

Generative art starts with a choice about behavior. Do you want branching growth, smooth variation, coordinated motion, a learned image distribution or a set of tiles that fit together? Different algorithms answer different questions.

The techniques below are a vocabulary for building those behaviors. Some generate structure, some search for a solution and some render an existing scene. They can be combined, but understanding their roles makes experimentation more deliberate.

## Fractals

Fractals involve structure across scales, often through repeated rules. Self-similarity may be exact, approximate or statistical; it is too narrow to define every fractal as an identical shape repeated infinitely. A digital rendering also has finite resolution and computation.

For an artist, the useful controls include iteration limits, scale, sampling and the way numerical values become color. A Mandelbrot or Julia-set image is shaped as much by those presentation decisions as by the underlying iteration. Use zoom and repetition to explore relationships across scales rather than assuming that added detail always improves the composition.

## Cellular Automata

A cellular automaton updates discrete cells according to rules involving their current state and a neighborhood. In Conway’s Game of Life, a simple set of rules can produce persistent, moving or disappearing patterns.

The initial state, neighborhood and update rule are central artistic decisions. A changing pattern does not require each cell to have a global plan. When implementing a synchronous model, calculate the next state from a consistent previous state; updating cells in place can change the intended behavior.

## Noise Functions

Coherent noise creates smoothly related values across nearby positions. It is useful for controlling a flowing line, a terrain height or a field of movement. It differs from choosing an unrelated random value at each point.

The [p5.js noise reference](https://p5js.org/reference/p5/noise/) documents how input spacing changes the apparent smoothness and how a noise seed can repeat the sequence. Start by varying the scale of the input coordinates. That often changes the character of the result more clearly than adding more layers of detail.

## Genetic Algorithms

A genetic algorithm searches through candidate solutions using selection and variation. In an art system, a candidate might encode a palette, geometry or set of compositional rules.

The fitness criterion does not objectively measure beauty. It expresses a chosen preference or constraint, which may be supplied by a formula or a person selecting candidates. Watch for the search exploiting that criterion in an uninteresting way. A score that rewards contrast, for example, may produce extreme contrast without a compelling image.

## Lindenmayer Systems

An L-system rewrites symbols according to production rules. Those symbols can be interpreted as drawing or movement instructions, making the method useful for branching forms and growth-like sequences.

The authors’ [Algorithmic Botany publications](https://algorithmicbotany.org/papers/#abop), including *The Algorithmic Beauty of Plants*, provide the primary foundation for this approach. In a visual experiment, vary branch angle, step length and the number of rewriting steps independently so their effects remain understandable.

## Neural Networks

Neural networks can support image generation, transformation and style-related work, but a convolutional neural network is not automatically a generator. A network’s architecture and training objective determine its role.

A GAN trains a generator in relation to a discriminator. Other generative approaches use different objectives and sampling procedures. The training material, conditioning, seed and selection of results all influence the final artwork. Keep those choices visible in the project description instead of attributing the entire result to a model name.

Google’s [Inceptionism experiments](https://research.google/blog/inceptionism-going-deeper-into-neural-networks/?m=1) are a useful example of producing imagery by examining and amplifying features in a trained network, a different process from training a generator to sample new images.

## Physics-Based Algorithms

Particle systems, fluid models and reaction-diffusion systems can produce evolving patterns. They allow an artist to work with interactions over time instead of placing each element independently.

A physically inspired model may be used expressively without being an accurate simulation of a real material. State which goal matters. Numerical stability, time step and boundary conditions can affect the result, so change them deliberately when comparing experiments.

## Swarm Intelligence

Collective movement can emerge from local behavior. Craig Reynolds’ [Boids model](https://www.red3d.com/cwr/boids/) uses separation, alignment and cohesion to produce flock-like motion. Trails, density and the field of view can turn that movement into a visual composition.

Flocking and particle swarm optimization are related through the idea of multiple interacting agents, but they serve different purposes. One models coordinated movement; the other searches an objective space. Choose the method for the behavior you need rather than treating all “swarm” techniques as interchangeable.

## Shape Grammars

A shape grammar applies transformation rules to recognized shapes or arrangements. The interest lies in how a limited vocabulary can generate a family of forms.

Specify where a rule may apply and when the process stops. Otherwise, the system can grow without producing a composition that fits the intended frame or fabrication constraints. Compare the family of outputs as well as a selected example: the range reveals what the rules actually control.

## Agent-Based Models

An agent-based model assigns behavior to individual entities and observes what follows from their interactions. Agents might move, leave traces, compete for space or respond to a shared field.

The model is only as meaningful as its assumptions. A visually persuasive crowd pattern does not validate a prediction about real people. For an artwork, those assumptions can be expressive choices; for a scientific claim, they need a separate evidential basis.

## Wave Function Collapse Algorithm

[Wave Function Collapse](https://github.com/mxgmn/WaveFunctionCollapse) is a constraint-based method for constructing patterns from permitted local arrangements. The original implementation learns small patterns from an example and propagates constraints while choosing among remaining possibilities.

Despite its name, it does not perform quantum computation. It can also encounter contradictions and need a restart or other recovery strategy. The artistic work includes designing the tiles or examples and deciding which adjacencies are allowed.

## Chaos Theory

A chaotic dynamical system can be deterministic while remaining highly sensitive to its initial conditions. That makes it different from a system that draws fresh random values at every step.

Strange attractors and related structures provide a way to explore how a trajectory develops under repeated rules. Record the initial conditions and numerical method so that an interesting result can be examined again. The viewing projection and color mapping remain substantial compositional choices.

## Ray Marching

Ray marching is a rendering approach, rather than a source of generative structure by itself. It samples along viewing rays to determine how a scene should appear. One important method, John Hart’s [sphere tracing](https://experts.illinois.edu/en/publications/sphere-tracing-a-geometric-method-for-the-antialiased-ray-tracing/), uses distance information to advance toward an implicit surface.

This can pair well with procedurally defined forms. Its behavior depends on the correctness of the distance information, stopping conditions and sampling choices. It does not make every scene easier or faster to render than another technique.

## Conclusion

Choose a technique by the behavior it gives you control over. Start with a small example, change one parameter at a time and keep the versions that explain something useful about the system. A convincing generative work comes from the relationship between those decisions and the experience of the result.
