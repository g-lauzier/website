---
layout: posts/post
title: "Managing Parties and Fetching Off-Chain Data in NFTs using Solidity and Chainlink Oracles"
date: 2023-07-11 00:00:00 +0000
categories: ["blockchain"]
tags: ["chainlink", "collaboration"]
post_image: "/assets/images/writing/chain-data-solidity-chainlink-oracles.webp"
description: "A Solidity example for recording contributors and their shares, followed by the trust and lifecycle requirements for external data in NFT projects."
permalink: "/chain-data-solidity-chainlink-oracles/"
image_alt: "A metal bridge carries a cobalt bead from rough slate into a glass enclosure, illustrating external data entering a blockchain."
post_image_small: "/assets/images/writing/chain-data-solidity-chainlink-oracles-640.webp"
post_image_medium: "/assets/images/writing/chain-data-solidity-chainlink-oracles-960.webp"
image_width: 1600
image_height: 900
image_caption: "Editorial illustration."
original_post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2023/07/generatedart_ethereum_oracle_d5ca524d-218b-411d-8bef-f47cab4abc34-2.png"
last_modified_at: 2026-11-22 12:00:00 +0000
---

A collaborative NFT project often needs two kinds of information: who contributed to the work, and which external facts should affect its behavior. These are separate responsibilities. Contributor records belong to the project's agreement and contract design; external facts need an authenticated path from their source to the contract.

The [NFT-Managing-Parties project](https://github.com/guillaumelauzier/NFT-managing-parties/tree/main) explores that combination. This article focuses on the boundaries that make the design understandable: authority to mint, fixed contribution shares, and the rules for accepting data from outside the blockchain.

## NFT-Managing-Parties

Imagine a work created by an artist, a data supplier, and a developer. Recording their shares on-chain can make the allocation inspectable. The record still needs to specify what the shares apply to: revenue, a particular payment stream, or another agreed entitlement. A percentage does not automatically grant copyright or ownership of the NFT.

The educational contract below uses **Solidity 0.8.24 and OpenZeppelin Contracts 5.0.2**. The deploying project administrator can mint a token with a bounded list of contributors. Shares use basis points, where 10,000 represents 100%. They are set once at minting and cannot be edited through this interface.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT2 is ERC721 {
    struct Contribution {
        address contributor;
        uint16 basisPoints;
    }

    address public immutable projectAdmin;
    mapping(uint256 => Contribution[]) private contributions;

    constructor() ERC721("NFT2", "NFT") {
        projectAdmin = msg.sender;
    }

    function mintNFT(
        address recipient,
        uint256 tokenId,
        Contribution[] calldata shares
    ) external {
        require(msg.sender == projectAdmin, "Only project admin");
        require(_ownerOf(tokenId) == address(0), "Token exists");
        require(shares.length > 0 && shares.length <= 20, "Invalid count");

        uint256 total;
        for (uint256 i = 0; i < shares.length; ++i) {
            require(shares[i].contributor != address(0), "Zero contributor");
            require(shares[i].basisPoints > 0, "Zero share");
            for (uint256 j = 0; j < i; ++j) {
                require(
                    shares[j].contributor != shares[i].contributor,
                    "Duplicate contributor"
                );
            }
            total += shares[i].basisPoints;
            contributions[tokenId].push(shares[i]);
        }
        require(total == 10000, "Shares must total 100 percent");
        _safeMint(recipient, tokenId);
    }

    function getContributions(uint256 tokenId)
        external
        view
        returns (Contribution[] memory)
    {
        ownerOf(tokenId); // Reverts for a nonexistent token.
        return contributions[tokenId];
    }
}
```

All share checks occur before the safe-mint callback. If any check or mint fails, the transaction reverts, including the stored contribution entries. The maximum of 20 contributors bounds the work done by the duplicate check; a larger project would need a different storage and validation design.

This contract records allocations. It does not receive sale proceeds or distribute payments. A payment component would need its own rules for rounding, withdrawal, failed transfers, and the definition of the amount being shared. Keeping those responsibilities distinct makes the example easier to review.

The original open-ended idea of adding contributions also raises a governance question: may allocations change after a collector acquires the token? This example avoids that ambiguity by fixing them at minting. A mutable design would need explicit authority, limits, and an event history for every change.

## Fetching Off-Chain Data Using Chainlink Oracles

A smart contract cannot make an ordinary HTTP request from inside deterministic EVM execution. An oracle workflow obtains information outside the chain and submits data that the contract can authenticate and interpret.

The historical Chainlink Any API pattern used a request and a later fulfillment transaction. The contract did not itself perform the HTTP fetch. The [Any API documentation](https://docs.chain.link/any-api/getting-started) now labels that material as historical and directs new work to Chainlink Runtime Environment (CRE).

**Update, November 2026:** Chainlink's [migration documentation](https://docs.chain.link/cre/reference/clf-migration-ts) also records the deprecation of Chainlink Functions and its replacement by CRE. A new integration should follow the current supported workflow and chain-specific configuration, rather than copying an old oracle address, job ID, or fee.

The durable architecture is the data lifecycle. In schematic form:

```text
1. A permitted trigger identifies the data and intended update.
2. The off-chain workflow fetches and validates the source response.
3. The workflow produces an authenticated report.
4. The authorized on-chain receiver verifies the report context.
5. The application checks units, freshness, ordering, and acceptable values.
6. Only then does it update the NFT's state.
```

This is pseudocode for the responsibilities, not a deployable Chainlink SDK example. The exact interfaces, forwarder addresses, and authentication rules must come from the selected supported environment.

For an artwork that responds to weather, record the observation location, measurement unit, timestamp, and source. Decide whether an old value remains usable during an outage and whether a delayed report may overwrite a newer one. If the answer is no, enforce that rule before applying the update.

Authentication establishes who or what produced a report under the workflow's trust model. It does not establish that an external API is factually correct. Multiple operators querying the same faulty source can still agree on a faulty result. Source selection and validation remain part of the application's design.

Contributor management and oracle integration meet at that boundary: who is authorized to change which state, on what evidence, and under what agreement? Clear answers make a dynamic NFT easier to maintain, review, and explain to the people relying on it.
