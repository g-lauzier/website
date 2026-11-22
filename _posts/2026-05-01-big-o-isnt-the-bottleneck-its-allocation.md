---
layout: posts/post
title: "When Big-O isn't the bottleneck: allocation"
date: 2026-05-01 00:00:00 +0000
last_modified_at: 2026-11-22 12:00:00 +0000
categories: ["infrastructure"]
tags: ["performance", "profiling", "gc"]
description: "Two linear-time implementations can put very different pressure on memory. Profile allocations, garbage collection, and latency before changing a hot path."
permalink: "/big-o-isnt-the-bottleneck-its-allocation/"
canonical_url: "https://algosize.com/blog/big-o-isnt-the-bottleneck-its-allocation/"
post_image: "/assets/images/writing/allocation-bottleneck.webp"
post_image_small: "/assets/images/writing/allocation-bottleneck-640.webp"
post_image_medium: "/assets/images/writing/allocation-bottleneck-960.webp"
image_alt: "Dense graphite blocks gather at a constriction beside a smooth blue glass loop."
image_caption: "Editorial illustration."
image_width: 1600
image_height: 900
---

_Originally published on [Algosize](https://algosize.com/blog/big-o-isnt-the-bottleneck-its-allocation/) — service provisioning by [algosize.com](https://algosize.com)._

Two functions can both be O(n) and behave differently under load. One creates a result and discards a few small values. The other builds intermediate arrays, serializes an object that nobody uses, and keeps a large buffer alive longer than necessary.

Big-O describes how work grows with input size. It does not describe every constant, allocation, cache miss, or pause involved in completing that work. When a service slows down, allocation is one of the costs worth investigating alongside the algorithm, I/O, contention, and queuing.

The point is to find the limiting resource before choosing the optimization. A cleaner loop is useful only if it addresses a measured cost without changing the required behavior.

## The shape of the cliff

Allocation-heavy code may increase garbage-collection work and contribute to latency spikes. The effect depends on the runtime, the lifetime of objects, the live heap, and available memory. There is no universal pause duration or input threshold.

A stable p50 and an erratic p99 are clues, not a diagnosis. Slow downstream calls, lock contention, CPU throttling, cache misses, and queue buildup can create a similar pattern. Algorithmic growth and allocation pressure can also occur together.

Compare latency with CPU, event-loop delay or queue depth, allocation profiles, and GC events over the same workload. The useful question is whether those observations support a causal explanation that a controlled change can test.

## Where the allocations hide

### 1. Method-chain landmines

For a dense array of ordinary records, these two functions produce the same values:

```js
function activeValuesWithChain(items) {
  return items
    .filter(item => item.active)
    .map(item => item.value * 2);
}

function activeValuesWithLoop(items) {
  const out = [];
  for (const item of items) {
    if (item.active) out.push(item.value * 2);
  }
  return out;
}
```

The chain expresses an intermediate filtered array and a final mapped array. The loop avoids that intermediate collection. Both are linear in the number of input records, but their memory behavior can differ.

At fifty calls per second, the chain expresses fifty intermediate filtered arrays per second—not one intermediate array per element. Their sizes and lifetimes matter more than the count alone. Actual allocation behavior also depends on runtime optimization.

Use the clearer form on ordinary paths. Consider fusion on a measured hot path, and test semantics before substituting a loop: sparse arrays, getters, callbacks with side effects, and mutation can make apparently similar transformations behave differently.

### 2. Closures that capture too much

```js
function processBatch(records, ctx) {
  return records.map(record => transform(record, ctx));
}
```

The callback captures `ctx`. That does not establish that the engine cannot inline or optimize it, nor does the source create a new callback for every record. The important questions are how often the containing function runs and whether retained callbacks extend the lifetime of large objects.

Moving `transform` into a separate helper while keeping the capturing arrow function does not remove that callback. If profiling implicates the path, compare a direct loop and inspect what remains allocated or retained. The result array and anything `transform` creates still need to be accounted for.

### 3. String concatenation in logs

```js
logger.debug("processed " + record.id + " with " + JSON.stringify(meta));
```

Arguments are evaluated before the logging call. If the debug level is disabled, this line can still perform serialization and string construction before the logger discards the message.

Use the level-check API provided by the actual logging library. In schematic form:

```js
if (logger.isDebugEnabled()) {
  logger.debug("processed " + record.id + " with " + JSON.stringify(meta));
}
```

A lazy logging API can defer expensive work, but check its documented behavior. Passing a structured object can avoid manual serialization and improve logging output; it does not mean the object literal and its property expressions are never evaluated. If creating the arguments is expensive, guard that work explicitly.

### 4. Buffers and slices

Repeatedly creating a temporary buffer is another candidate. In this schematic Go example, `encode` appends a record's bytes to the supplied buffer and returns the resulting slice:

```go
for _, record := range records {
    buf := make([]byte, 0, 1024)
    buf = encode(buf, record)
    out = append(out, buf...)
}
```

A reusable scratch buffer changes the source-level allocation pattern:

```go
buf := make([]byte, 0, 1024)
for _, record := range records {
    buf = encode(buf[:0], record)
    out = append(out, buf...)
}
```

This works only if the encoder and later consumers do not retain references that are overwritten by the next iteration. The output append copies bytes, but the encoder's behavior still needs to be known. Larger records may grow the buffer, and a large peak capacity may remain retained.

Do not infer heap-allocation counts from `make` alone. Go's escape analysis affects placement, and its [GC guide](https://go.dev/doc/gc-guide) recommends allocation profiles and compiler diagnostics to identify the actual cost.

In Node, default to initialized buffers unless there is a measured reason and a proven initialization discipline. [`Buffer.allocUnsafe`](https://nodejs.org/api/buffer.html#static-method-bufferallocunsafesize) can expose old memory if uninitialized bytes reach a consumer. In Rust, reusing a `Vec` can avoid capacity growth, while `clear()` retains the allocation. Reuse is an ownership decision as well as a performance decision.

### 5. Iterator-protocol overhead

A generic iterator has a protocol for producing values and signaling completion. That does not prove that every `for...of` iteration creates a heap object in optimized machine code. Engines can specialize common paths, and behavior varies with the iterable and runtime version.

If iteration is a measured hotspot, compare the alternatives on representative data. An index loop over a typed array is a useful candidate, not a universal improvement. Keep the runtime version, input shape, and surrounding work consistent during the comparison.

## How to actually measure

Start with a reproducible workload and an outcome: latency at a given throughput, memory use, or total processing time. Warm up where the runtime requires it, consume the output, and collect several runs. A benchmark that ignores the result or tests only tiny inputs may answer a different question from the production workload.

For Node, GC tracing gives a first view of collection activity:

```bash
node --trace-gc app.js
```

A trace reports heap sizes around a collection and time spent in the event. A “before” heap size is not the number of bytes allocated since the last line; objects survive, spaces change, and collection types differ. Use the [Node GC-tracing guide](https://nodejs.org/en/learn/diagnostics/memory/using-gc-traces) to interpret the fields, and relate the timestamps to application latency.

For allocation sites, inspect the process with DevTools and capture an allocation profile. [Chrome's Memory panel](https://developer.chrome.com/docs/devtools/memory) distinguishes allocation sampling from a heap snapshot. Sampling helps locate allocation activity; a snapshot helps explain retained objects. A large retained object and a high rate of short-lived allocations are different problems.

In Go, compare benchmark allocation counts and bytes per operation, and use an allocation-space profile when investigating churn. GC tracing can provide context, but it does not replace attribution to a call site. In a runtime without tracing GC, allocation and deallocation can still consume time or affect locality.

## A worked example

Consider a hypothetical request-processing service whose tail latency worsens as throughput increases. A profile points to a validator that creates intermediate objects and serializes them for disabled debug logging.

Change one source of work at a time:

| Experiment | What it tests | What to verify |
| --- | --- | --- |
| Guard disabled logging | Whether unused serialization is material | Required audit events are still retained |
| Reuse an immutable parsed schema | Whether repeated setup is expensive | No request-specific state enters the shared object |
| Fuse a measured transformation | Whether intermediate collections matter | Output and error behavior remain equivalent |
| Re-run the same workload | Whether the change improves the service | Latency, throughput, allocation, and retained memory |

Record the results rather than assuming that fewer source-level allocations must improve every metric. A pool may reduce allocation while increasing retained memory or contention. A change that improves a microbenchmark may be invisible once network time dominates.

## When the algorithm _is_ the bottleneck

Input growth can expose a poor data structure or repeated work even after allocation is reduced. If doubling the input causes disproportionate CPU growth, examine the algorithm and the surrounding interactions. If the service spends most of its time waiting, investigate the wait.

A useful sequence is to establish the workload, locate the dominant cost, form a narrow hypothesis, and compare one change against the same baseline. Prioritize the change with the largest supported benefit for its complexity.

Allocation belongs in that investigation because it is easy to overlook in readable, correct code. Measure it directly, account for object lifetimes, and keep the optimization only when the evidence supports it.

---

_Service provisioning by [algosize.com](https://algosize.com) — algorithm and allocation profiling, vulnerability scanning, and cloud cost analysis for engineering teams._
