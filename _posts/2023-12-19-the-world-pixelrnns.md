---
layout: posts/post
title: "The World of Pixel Recurrent Neural Networks (PixelRNNs)"
date: 2023-12-19 00:00:00 +0000
categories: ["ai"]
tags: ["artificial-intelligence"]
post_image: "/assets/images/writing/the-world-pixelrnns.webp"
description: "What PixelRNN taught us about generating images sequentially, how its variants differ, and a small autoregressive TensorFlow teaching model."
permalink: "/the-world-pixelrnns/"
image_alt: "A ceramic mosaic wave forms one tile at a time, representing pixel-by-pixel image generation."
post_image_small: "/assets/images/writing/the-world-pixelrnns-640.webp"
post_image_medium: "/assets/images/writing/the-world-pixelrnns-960.webp"
image_width: 1600
image_height: 900
image_caption: "Editorial illustration."
original_post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2023/12/generatedart_Pixel_Recurrent_Neural_Networks_874142f3-17f1-4ba4-af7c-cc7e099163d1.png"
last_modified_at: 2026-11-22 12:00:00 +0000
---

PixelRNN asks an image model to do a sequence of local tasks: predict the next pixel value from the values that came before it. Repeating that process produces a complete image. The idea is simple to state, but it creates a demanding trade-off between a tractable probability model and slow sequential generation.

Introduced by van den Oord, Kalchbrenner, and Kavukcuoglu in [2016](https://arxiv.org/abs/1601.06759), PixelRNN is an important reference point in autoregressive image modeling. Understanding its mechanism is more useful than presenting it as a new general-purpose solution for every imaging task.

## Purpose and Application

PixelRNN models a distribution over images. It can assign probabilities to observed pixel values and generate new samples by drawing from those probabilities in order.

Image completion and conditional generation build on that idea, but they require a suitable conditioning design. An unconditional model does not automatically solve arbitrary inpainting or super-resolution. In particular, conditioning on pixels that occur later in the chosen ordering is not the same as predicting from an already observed prefix.

## Architecture

An autoregressive model factors a joint distribution into conditional distributions. In plain language: predict the first value, then the second given the first, then the third given the first two, and so on.

The architecture must respect this causal ordering. During training, the target image is available, but the network must not see the pixel it is being asked to predict through an unmasked connection. Otherwise, low training loss can reflect copying instead of learning a useful distribution.

For color images, the ordering also needs to account for dependencies among color channels. “Predict a pixel” is a convenient shorthand, not a complete specification of the output distribution.

## Pixel-by-Pixel Generation

Training and sampling are different. During training, the real preceding values are known, so a model can learn from them. During sampling, each new prediction depends on values the model has already generated. An early choice can therefore affect many later ones.

Generation cost grows with the sequence length and the implementation’s work per step. It does **not** inherently grow exponentially with the number of pixels. Nevertheless, a large image contains many prediction steps, and recomputing previous work at every step makes a simple implementation especially slow.

## Two Variants

The original paper describes **Row LSTM** and **Diagonal BiLSTM** recurrent layers. These are alternative ways to propagate spatial context while preserving the required ordering.

Row LSTM processes information across rows with a restricted receptive field. Diagonal BiLSTM uses a skewed representation to capture a broader causal context through diagonal processing. The important distinction is which preceding values can influence a prediction and how efficiently those dependencies can be computed.

There is no general rule that Row LSTM is “for landscapes” and Diagonal BiLSTM is “for portraits.” Such a task-specific recommendation would need an experiment. Architecture should be compared using a dataset, evaluation protocol, and computational budget.

## Conditional Generation

A conditional model adds information such as a label or a separate representation to the prediction process. This can direct samples toward a specified class or another constraint, provided the architecture and training objective use that condition consistently.

For an artwork, a condition might select a visual category in a carefully defined training collection. The condition does not guarantee control over every property of the resulting image. Evaluate whether changing it produces the intended variation rather than merely changing unrelated details.

## Training and Data Requirements

The task requires a consistent representation: pixel ordering, quantization, dimensions, and color handling. Training predicts the next value from a shifted input sequence. Validation data should be kept separate from training to assess whether the model learns patterns beyond the examples it has seen.

A likelihood objective and visual quality answer different questions. A model can assign better probabilities while producing samples that are not preferred aesthetically. Inspect generated examples, diversity, and failure cases alongside the training metric.

## Challenges and Limitations

Sequential sampling is the main practical obstacle. Memory and computation also increase with image size, model depth, and the context represented at each step. A small experiment is useful for understanding those costs before attempting a high-resolution system.

The example below demonstrates the autoregressive training contract. It deliberately uses a **one-dimensional LSTM over a flattened image**, not a reproduction of the paper’s two-dimensional PixelRNN layers. This distinction prevents a short teaching example from being mistaken for the research architecture.

## PixRNN using TensorFlow

Use a TensorFlow environment with NumPy. Downloading MNIST requires network access. The example resizes digits to 8 × 8 and quantizes them into 16 intensity bins to keep the sequence short. The small subset and single training epoch are for experimentation, not a performance claim.

```bash
pip install tensorflow numpy
```

```python
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers

tf.keras.utils.set_random_seed(7)
SIDE, BINS, START = 8, 16, 16
(raw_train, _), (raw_test, _) = tf.keras.datasets.mnist.load_data()

def prepare(images):
    resized = tf.image.resize(
        tf.cast(images[..., None], tf.float32), (SIDE, SIDE), method='area'
    )
    pixels = tf.cast(tf.clip_by_value(resized, 0.0, 255.0) // 16, tf.int32)
    targets = tf.reshape(pixels, [-1, SIDE * SIDE])
    start = tf.fill([tf.shape(targets)[0], 1], START)
    inputs = tf.concat([start, targets[:, :-1]], axis=1)
    return inputs, targets

x_train, y_train = prepare(raw_train[:2000])
x_test, y_test = prepare(raw_test[:200])

model = tf.keras.Sequential([
    layers.Input(shape=(None,), dtype='int32'),
    layers.Embedding(input_dim=BINS + 1, output_dim=32),
    layers.LSTM(128, return_sequences=True),
    layers.Dense(BINS),
])
model.compile(
    optimizer='adam',
    loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
)
model.fit(x_train, y_train, batch_size=32, epochs=1)
print('Held-out loss:', model.evaluate(x_test, y_test, verbose=0))

def sample_image():
    sequence = [START]
    for _ in range(SIDE * SIDE):
        logits = model(tf.constant([sequence], dtype=tf.int32), training=False)
        next_value = tf.random.categorical(logits[:, -1, :], num_samples=1)
        sequence.append(int(next_value[0, 0]))
    return np.asarray(sequence[1:]).reshape(SIDE, SIDE) / (BINS - 1)

sample = sample_image()
print('Sample shape:', sample.shape)
```

The start token supplies context for the first pixel. Each subsequent input is the preceding target value. The output has 16 logits per position, one per intensity bin; a single-channel softmax would always return 1 and could not model grayscale variation.

The [TensorFlow LSTM documentation](https://www.tensorflow.org/api_docs/python/tf/keras/layers/LSTM) specifies a three-dimensional recurrent input: batch, sequence, features. Here the embedding produces that shape. Passing a raw four-dimensional image directly to a standard LSTM was the shape error in the original example.

The sampling loop recomputes the whole prefix at each step for clarity. A more efficient implementation would reuse recurrent state. This model should be treated as a way to inspect causality, inputs, and outputs before implementing a spatial architecture.

## How can Pixel Recurrent Neural Networks (PixelRNNs) be used for Generative art?

A small autoregressive model can make the process of image construction visible. An installation might reveal samples incrementally, compare alternate continuations of a fixed prefix, or let a visitor choose among possible next values.

Those interactions expose the model’s uncertainty and the effect of earlier decisions. They can be artistically interesting even when the final image is low-resolution. Preserve the training collection’s provenance and describe how the image was generated, especially when presenting the process as part of the work.

## Recent Developments

PixelCNN is a closely related masked-convolution approach discussed alongside PixelRNN in the original research, not simply a later successor. Its architecture changes training computation while autoregressive sampling still requires ordered predictions.

The broader lesson is the value of an explicit probabilistic factorization. PixelRNN makes that relationship tangible: a complete image emerges from many conditional choices. Its speed and resolution limits are part of the method, and should shape the kinds of experiments built with it.
