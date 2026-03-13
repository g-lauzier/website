---
layout: posts/post
title: "Managing Parties and Fetching Off-Chain Data in NFTs using Solidity and Chainlink Oracles"
date: 2023-07-11 00:00:00 +0000
categories: ["projects"]
tags: ["chainlink", "collaboration"]
post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2023/07/generatedart_ethereum_oracle_d5ca524d-218b-411d-8bef-f47cab4abc34-2.png"
description: "In the burgeoning world of Non-Fungible Tokens (NFTs), many new challenges and use-cases are emerging. One such use-case is managing different contributing parties and their respective shares in a pro"
permalink: "/chain-data-solidity-chainlink-oracles/"
---

In the burgeoning world of Non-Fungible Tokens (NFTs), many new challenges and use-cases are emerging. One such use-case is managing different contributing parties and their respective shares in a project represented by an NFT. Another is fetching and incorporating off-chain data into the [Ethereum smart contract](https://github.com/guillaumelauzier/NFT-managing-parties/tree/main). In this article, we'll explore how to handle both these cases using Solidity and Chainlink oracles.

## NFT-Managing-Parties

Imagine a scenario where an NFT represents a collaborative project with various contributors such as data providers, developers, or project managers, each holding a certain percentage of shares. Managing these contributions directly on-chain provides a transparent, immutable, and verifiable record.

We can achieve this with the help of Solidity, a contract-oriented programming language used for writing smart contracts on various blockchain platforms, most notably Ethereum. Let's take a look at a simple contract `NFT2` where an NFT can be minted and contributions can be added to the NFT.

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT2 is ERC721 {
    struct Contribution {
        address contributor;
        uint percentage;
    }

    mapping(uint => Contribution]) public contributions;

    constructor() ERC721("NFT2", "NFT") {}

    function mintNFT(address recipient, uint tokenId) public {
        _mint(recipient, tokenId);
    }

    function addContribution(uint tokenId, address contributor, uint percentage) public {
        contributionstokenId].push(Contribution(contributor, percentage));
    }

    function getContributions(uint tokenId) public view returns (Contribution] memory) {
        return contributionstokenId];
    }
}
```

In this contract, `mintNFT` allows for the creation of a new NFT. `addContribution` enables the addition of contributors and their respective percentage shares to a specific NFT. The `getContributions` function retrieves the contributors and their percentages for a given NFT. Each NFT and its contributions are tracked using a mapping that links each token ID to an array of Contribution structs.

## Fetching Off-Chain Data Using Chainlink Oracles

While the Ethereum blockchain and smart contracts offer robust and decentralized solutions, they're inherently cut off from the outside world and can't directly access off-chain data. This is where Chainlink comes in. Chainlink is a decentralized oracle network that allows smart contracts to securely interact with real-world data and external APIs.

Chainlink oracles can be used to fetch data from an off-chain source and supply it to your on-chain smart contract. For example, we might want to fetch data from a specific URL and store the returned value in our contract.

```
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract MyContract is ChainlinkClient {
    using Chainlink for Chainlink.Request;

    uint256 public volume;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    constructor() {
        setPublicChainlinkToken();
        oracle = 0x123...; // This should be the address of the oracle
        jobId = "abc123..."; // This should be the job ID
        fee = 0.1 * 10 ** 18; // This is the fee (0.1 LINK in this case)
    }

    function requestData() public returns (bytes32 requestId) {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        request.add("get", "http://api.example.com/data"); // This should be your off-chain API URL
        return sendChainlinkRequestTo(oracle, request, fee);
    }

    function fulfill(bytes32 _requestId, uint256 _volume) public recordChainlinkFulfillment(_requestId) {
        volume = _volume;
    }
}
```

In this `MyContract`, we first initialize a new Chainlink request in the `requestData` function. This function sends an HTTP GET request to an API at `http://api.example.com/data`. When the Chainlink oracle gets a response, it calls the `fulfill` function on the contract, which updates the `volume` variable with the returned data.

It's important to note that you'd need to replace the oracle address and jobId with actual values that you'd get from a Chainlink node. Also, you need to have enough LINK tokens to pay for the oracle service.

By combining NFTs, Solidity, and Chainlink oracles, we can create more dynamic, interactive, and useful smart contracts that could potentially revolutionize how we use blockchain technology. Remember that smart contract development and testing should be done very carefully to avoid potential security and functionality issues.
