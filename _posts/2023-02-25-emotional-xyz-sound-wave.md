---
layout: posts/post
title: "Emotional XYZ Sound Wave"
date: 2023-02-25 00:00:00 +0000
categories: ["digital-art"]
tags: []
post_image: "/assets/images/writing/emotional-xyz-sound-wave.webp"
description: "An audiovisual concept that maps speech into three dimensions while keeping measured sound features separate from uncertain emotion estimates."
permalink: "/emotional-xyz-sound-wave/"
image_alt: "A flowing ribbon of metal fins curves through space with blue and copper edge light."
post_image_small: "/assets/images/writing/emotional-xyz-sound-wave-640.webp"
post_image_medium: "/assets/images/writing/emotional-xyz-sound-wave-960.webp"
image_width: 1600
image_height: 900
image_caption: "Editorial illustration."
original_post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2023/02/generatedart_generative_art_sound_frequency.png"
last_modified_at: 2026-11-22 12:00:00 +0000
---

Emotional XYZ Sound Wave is a concept for turning speech into a visual and potentially tactile experience. The idea is to give different features of a voice a spatial expression, so that a participant can see and explore how the representation changes while they speak.

The distinction between a measured signal and an interpretation is central. Pitch and signal level can be estimated from audio. Emotion is a more uncertain inference, influenced by context, language, the person speaking and the way a model was trained. An appealing visualization should not imply that a device can directly read someone’s inner state.

This account describes the project’s design direction. It does not report a validated emotion-recognition system or a demonstrated therapeutic effect.

## A clear mapping from input to output

A prototype could use the horizontal axis for a chosen spatial position, the vertical axis for estimated vocal pitch, and depth for a participant-controlled or model-estimated affect value. The mapping is an artistic convention. Placing pleasant states toward the front and unpleasant states toward the back does not make emotion a physical depth measurement.

An initial version could let participants label their own experience. That would make it possible to explore the representation without presenting automatic classification as a prerequisite. If a model is introduced later, show uncertainty and let the participant correct or ignore its estimate.

The audio and visual paths also need to be distinguished. A microphone captures sound; analysis produces features; a renderer maps those features into geometry. A separate synthesis or haptic stage can translate selected values into output. An actuator is not needed to capture a voice that is already available through a microphone.

In the [Web Audio API](https://www.w3.org/TR/2021/REC-webaudio-20210617/), an oscillator generates a periodic signal, a gain node changes amplitude and a stereo panner controls left-right placement. Changing gain does not directly set a visual object’s depth, and a stereo panner is not a full three-dimensional positioning system. The visual coordinates must be controlled in the renderer; spatial audio requires an appropriate audio model.

## Voice-coil actuators and tactile patterns {#voice-coil-actuators-translating-emotional-content-into-vibrations}

A voice-coil actuator converts an electrical drive signal into mechanical motion. In this concept, it could provide a tactile counterpart to a visual change: a pulse, a rhythm or a change in intensity.

The relationship between that pattern and an emotion would be designed and tested with participants. A vibration does not carry a universally understood emotion by itself. The same pattern could feel pleasant, distracting or uncomfortable in different contexts.

A prototype should begin with simple, adjustable patterns and a clear stop control. The useful question is whether participants can understand and use the mapping, not whether the hardware has encoded an emotion in a literal sense.

## Choosing a piezoelectric response {#piezoelectric-transducers-converting-emotions-into-tactile-feedback}

Piezoelectric devices offer another way to convert electrical input into movement. Their suitability depends on the intended mechanical response and the object in which they are mounted. They are not a special category of “digital” actuator opposed to an “analog” voice coil.

The artistic design should be specified before selecting the mechanism. Does the participant need to feel a brief event, a continuous texture or a change in rhythm? The answer determines what must be prototyped and how the output should be evaluated.

The proposed association between a higher vibration frequency and joy, or a lower one and sadness, should be treated as a mapping to explore. It is not a reliable method for inducing those feelings.

## Speech Analysis

Speech analysis can provide features such as an estimated pitch contour, timing and signal energy. Those features can drive an expressive visual system even without assigning emotional labels. The [speech-feature material in Jurafsky and Martin’s Speech and Language Processing](https://web.stanford.edu/~jurafsky/slp3/) is a useful technical starting point.

A model that estimates emotion adds a separate inference layer. It should be evaluated on the intended speakers, languages and recording conditions, using a clear account of what its labels mean. A system trained on acted expressions may not perform the same way in ordinary conversation.

For this project, a more honest interface would show an estimate as an estimate and keep the participant’s own description visible. Disagreement can be part of the interaction rather than something the system conceals.

## Electroencephalography (EEG)

EEG records electrical activity at the scalp. It is used in research on affect, but a frequency band is not a direct label for a particular emotion. The [DEAP study](https://doi.org/10.1109/T-AFFC.2011.15), for example, investigated associations between physiological recordings and participants’ ratings while they watched video excerpts.

Such a study defines a particular collection and evaluation setting. It does not establish that an artwork can infer any visitor’s feelings from an EEG frequency alone. Adding EEG to the concept would create a separate research and interaction problem, with its own equipment, consent and validation requirements.

## Heart Rate Variability (HRV) Analysis

HRV concerns variation in the intervals between heartbeats. Its interpretation depends on context; it should not be reduced to a universal “emotion frequency.” Research on [emotion characterization using HRV guided by respiration](https://pubmed.ncbi.nlm.nih.gov/30703049/) illustrates that physiological modeling includes influences such as breathing and evaluates performance within a defined experiment.

A heart-based input could still be meaningful artistically. It might allow a participant to explore a changing rhythm while keeping the signal’s interpretation open. That is a different claim from diagnosing stress or accurately identifying a specific emotion.

## Conclusion

The most useful first version of Emotional XYZ would make the mapping understandable and give participants control over it. Start with visible audio features and optional self-description, then evaluate whether the experience communicates what it claims to communicate.

The project remains an exploration of expression through sound, space and touch. Its artistic potential does not require presenting uncertain inferences as measurements of a person’s emotional life.

[See the Emotional XYZ Sound Wave repository](https://github.com/guillaumelauzier/emotional-xyz-soundwave).

## References

- [W3C, Web Audio API Recommendation, 2021](https://www.w3.org/TR/2021/REC-webaudio-20210617/).
- [Dan Jurafsky and James H. Martin, Speech and Language Processing](https://web.stanford.edu/~jurafsky/slp3/), online manuscript.
- [Koelstra and colleagues, DEAP: A Database for Emotion Analysis Using Physiological Signals](https://doi.org/10.1109/T-AFFC.2011.15), IEEE Transactions on Affective Computing, 2012.
- [Valderas Yamuza and colleagues, Human Emotion Characterization by Heart Rate Variability Analysis Guided by Respiration](https://pubmed.ncbi.nlm.nih.gov/30703049/), IEEE Journal of Biomedical and Health Informatics, 2019.
- S. O. Reza Moheimani and Andrew J. Fleming, *Piezoelectric Transducers for Vibration Control and Damping*, Springer, 2006.
- Steven J. Luck, *An Introduction to the Event-Related Potential Technique*, MIT Press, 2014.
- K. Trimmel, J. Sacha and H. V. Huikuri, editors, *Heart Rate Variability: Clinical Applications and Interaction between HRV and Heart Rate*, Frontiers Media, 2015.
