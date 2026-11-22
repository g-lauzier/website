---
layout: posts/post
title: "Basic Educative iOS App: Understanding Blockchain Smart Contract Transactions"
date: 2020-02-26 00:00:00 +0000
categories: ["blockchain"]
tags: ["blockchain-technology", "commoncrypto"]
post_image: "/assets/images/writing/blockchain-ios-app.webp"
description: "A Swift prototype that makes transaction records, hashes, nonces, and a local chain visible through a simple iOS interface."
permalink: "/blockchain-ios-app/"
post_image_small: "/assets/images/writing/blockchain-ios-app-640.webp"
post_image_medium: "/assets/images/writing/blockchain-ios-app-960.webp"
image_width: 1600
image_height: 900
image_alt: "A chain of blue cubes passes through a smoked-glass rectangle, suggesting blockchain transactions on a mobile device."
image_caption: "Editorial illustration."
original_post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2023/02/blockchainiosapp.png"
last_modified_at: 2026-11-22 12:00:00 +0000
---

I built BlockchainiOSApp as a small educational prototype: a way to make the structure of a transaction and a chain of blocks visible on an iPhone. The focus was learning through interaction, rather than moving real money.

## From a form to a block

The user enters a sender, a recipient, an amount, and a transaction type. The demonstration applies no fee to a domestic transaction and a 0.2% fee to an international one. These are rules of this prototype, not rules of blockchain networks generally.

Validating the form produces a JSON record containing the transaction details, its hash, and the nonce used by the demonstration. The **See all transactions** view shows the locally created blocks, beginning with the genesis block. That makes it easier to connect the fields on the screen with the records underneath them.

## What the prototype demonstrates

The app was written in Swift for iOS, using CommonCrypto for cryptographic operations. It introduces transaction serialization, hashing, and the idea of linking records. A local demonstration does not, by itself, establish distributed consensus or provide a production smart-contract execution environment.

Connecting transactions and mining between devices through Personal Hotspot was a proposed next step. It should be read as part of the project's development plan, rather than as a shipped feature.

[View BlockchainiOSApp on GitHub](https://github.com/guillaumelauzier/BlockchainiOSApp).
