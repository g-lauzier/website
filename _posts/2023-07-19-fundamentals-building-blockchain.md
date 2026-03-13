---
layout: posts/post
title: "Fundamentals of Building a Blockchain"
date: 2023-07-19 00:00:00 +0000
categories: ["projects"]
tags: ["block-design", "blockchain", "blockchain-mathematical-principles", "c-blockchain-implementation"]
post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2023/07/generatedart_blockchain_design_2646b05c-8a51-400f-8a48-d65ace71f92f-2.png"
description: "The blockchain is a transformative technology that has had a profound impact on various sectors from finance to supply chain management. While the journey to master blockchain development is a complex"
permalink: "/fundamentals-building-blockchain/"
---

The blockchain is a transformative technology that has had a profound impact on various sectors from finance to supply chain management. While the journey to master blockchain development is a complex one, understanding its fundamentals is the first step towards proficiency. This article delves into these essential building blocks of creating a blockchain.

## 1. Understanding Blockchain Basics

Before you build a blockchain, it's crucial to understand its core elements:

- **Blockchain Structure**: A blockchain is a distributed ledger of transactions, organized into blocks. Each block contains a list of transactions, a reference to the previous block (through its hash), and the block's unique hash. This chain of blocks forms the blockchain.

Creating a blockchain structure involves creating a data structure to store blocks, and each block will contain a set of transactions. For simplicity, we'll create a simple blockchain structure where each block stores a string as data. Also, we'll use the SHA-256 cryptographic hash function to create the hash for each block. Here's a simple C++ implementation:

```
#include <iostream>
#include <sstream>
#include <vector>
#include <openssl/sha.h>

using namespace std;

// Function to calculate SHA256
string calculateSHA256(string data) {
    unsigned char hashSHA256_DIGEST_LENGTH];
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, data.c_str(), data.size());
    SHA256_Final(hash, &sha256);

    stringstream ss;
    for(int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << hex << setw(2) << setfill('0') << (int)hashi];
    }
    return ss.str();
}

// Block Structure
class Block {
public:
    string prevHash;
    string data;
    string blockHash;
    Block(string data, string prevHash) {
        this->data = data;
        this->prevHash = prevHash;
        blockHash = calculateSHA256(prevHash + data);
    }
};

// Blockchain Structure
class Blockchain {
private:
    vector<Block> chain;
public:
    // Add Block to Blockchain
    void addBlock(string data) {
        string prevHash = chain.empty() ? string(64, '0') : chain.back().blockHash;
        Block newBlock(data, prevHash);
        chain.push_back(newBlock);
    }

    // Print Blockchain
    void printChain() {
        for(Block block : chain) {
            cout << "Data: " << block.data << endl;
            cout << "Previous Hash: " << block.prevHash << endl;
            cout << "Block Hash: " << block.blockHash << endl << endl;
        }
    }
};

int main() {
    Blockchain myChain;
    myChain.addBlock("Block 1");
    myChain.addBlock("Block 2");
    myChain.addBlock("Block 3");
    myChain.printChain();
    return 0;
}
```

```

```

Note that you need the OpenSSL library installed to compile this code.

This code defines a `Block` class that stores the data, the hash of the previous block, and the hash of the current block. The current block's hash is calculated by hashing the previous block's hash and the data. The `Blockchain` class is a list of `Block` objects. It has a method to add new blocks to the blockchain, with the new block's previous hash set to the current last block's hash.

In terms of mathematical formula, it's important to remember that a blockchain is not represented by a single formula. However, the way a block's hash is calculated can be represented as follows:

H = Hash(PH + D)

Where:

- H is the current block's hash

- PH is the previous block's hash

- D is the current block's data

- '+' indicates concatenation of the strings

- Hash is the SHA-256 cryptographic hash function

- **Consensus Mechanism**: This is the method a blockchain uses to agree on the validity of transactions. The most known mechanisms are Proof-of-Work (PoW) and Proof-of-Stake (PoS), but other types, like Delegated Proof-of-Stake (DPoS), Byzantine Fault Tolerance (BFT), and more are also used.

Implementing a consensus mechanism like Proof-of-Work (PoW) or Proof-of-Stake (PoS) in C++ would be a fairly complex task, as these algorithms require a network of nodes communicating with each other and other advanced features. However, a simplified implementation of Proof-of-Work can be done, which we will demonstrate below. In this example, we'll use a simple mining function to demonstrate the PoW concept.

```
#include <iostream>
#include <sstream>
#include <vector>
#include <openssl/sha.h>
#include <iomanip>

using namespace std;

string calculateSHA256(string data) {
    unsigned char hashSHA256_DIGEST_LENGTH];
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, data.c_str(), data.size());
    SHA256_Final(hash, &sha256);

    stringstream ss;
    for(int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << hex << setw(2) << setfill('0') << (int)hashi];
    }
    return ss.str();
}

class Block {
public:
    string prevHash;
    string data;
    string blockHash;
    int nonce;
    Block(string data, string prevHash) {
        this->data = data;
        this->prevHash = prevHash;
        nonce = -1;
        blockHash = mineBlock(4);  // 4 is the difficulty level
    }

    string mineBlock(int difficulty) {
        string target(difficulty, '0');
        string newHash;
        do {
            nonce++;
            newHash = calculateSHA256(prevHash + data + to_string(nonce));
        } while (newHash.substr(0, difficulty) != target);
        return newHash;
    }
};

class Blockchain {
private:
    vector<Block> chain;
public:
    void addBlock(string data) {
        string prevHash = chain.empty() ? string(64, '0') : chain.back().blockHash;
        Block newBlock(data, prevHash);
        chain.push_back(newBlock);
    }

    void printChain() {
        for(Block block : chain) {
            cout << "Data: " << block.data << endl;
            cout << "Previous Hash: " << block.prevHash << endl;
            cout << "Block Hash: " << block.blockHash << endl;
            cout << "Nonce: " << block.nonce << endl << endl;
        }
    }
};

int main() {
    Blockchain myChain;
    myChain.addBlock("Block 1");
    myChain.addBlock("Block 2");
    myChain.addBlock("Block 3");
    myChain.printChain();
    return 0;
}
```

In this code, the `Block` class has been updated to include a `nonce` variable and a `mineBlock` function. This function calculates the block's hash in a loop until it finds a hash that starts with a certain number of zeroes. The number of zeroes (the difficulty level) determines how hard it is to mine a block.

Mathematically, Proof of Work can be represented as:

H = Hash(PH + D + N) < Target

Where:

- H is the current block's hash

- PH is the previous block's hash

- D is the current block's data

- N is the nonce

- Hash is the SHA-256 cryptographic hash function

- Target is a value that the hash must be less than (represented by leading zeroes)

The loop continues to increment the nonce and compute the hash until it finds a hash value less than the target. This process is what gives PoW its security, as it requires significant computational resources to calculate a valid hash.

- **Decentralization**: Blockchain networks are typically decentralized, meaning no single entity has control over the entire network. Instead, multiple nodes participate in the network, each having a copy of the entire blockchain.

## 2. Node Creation

A blockchain network is made up of nodes. Each node is a computer that participates in the blockchain network and maintains a copy of the entire blockchain. Understanding how to set up these nodes, which involves installing the necessary software and connecting the node to the blockchain network, is fundamental to building a blockchain.

Creating a node and establishing a network connection in C++ involves using networking libraries. We will use a simplified version in our example which uses the standard library's networking facilities (as of C++20, C++ now includes native support for networking in the standard library).

Before going further, it should be noted that implementing a fully functional blockchain node in C++ from scratch would require handling many complex issues including peer discovery, transaction validation, block validation, consensus algorithms, maintaining a UTXO database, handling forks, broadcasting messages to peers, etc. It would also need to be secure against various forms of attacks and handle large amounts of data efficiently.

Below is a simple example of a blockchain node that can receive and display blocks from its peers. It does not validate the blocks or maintain a copy of the blockchain:

```
#include <iostream>
#include <string>
#include <vector>
#include <asio/ip/tcp.hpp>

using asio::ip::tcp;
using namespace std;

class Block {
public:
    string prevHash;
    string data;
    string blockHash;
    // Assume these fields are properly set in the constructor
};

class Node {
private:
    asio::io_context io_context;
    tcp::acceptor acceptor;
    vector<Block> blockchain;

    void startAccepting() {
        tcp::socket socket(io_context);
        acceptor.async_accept(socket, this](std::error_code ec) {
            if (!ec) {
                handleNewConnection(std::move(socket));
            }
            startAccepting();
        });
    }

    void handleNewConnection(tcp::socket socket) {
        // For simplicity, assume each connection sends exactly one block,
        // then closes the connection
        Block newBlock;
        asio::async_read(socket, asio::buffer(&newBlock, sizeof(newBlock)), this, newBlock](std::error_code ec, std::size_t /*length*/) {
            if (!ec) {
                handleNewBlock(newBlock);
            }
        });
    }

    void handleNewBlock(const Block& newBlock) {
        // In a real blockchain node, you would validate the block here,
        // update your UTXO database, handle forks, etc.
        // This example simply prints the block and adds it to a vector.
        cout << "Received a new block with data: " << newBlock.data << endl;
        blockchain.push_back(newBlock);
    }
public:
    Node(unsigned short port)
    : acceptor(io_context, tcp::endpoint(tcp::v4(), port)) {
        startAccepting();
        io_context.run();
    }
};

int main() {
    Node node(12345);
    return 0;
}
```

This is a very simple and unrealistic example. In reality, you would need to implement many more features, and you would also need to use a serialization format for sending and receiving blocks. You would also need to connect to multiple peers and handle incoming and outgoing connections simultaneously.

As you can see, building a blockchain from scratch is a substantial task that requires a solid understanding of many areas including network programming, cryptography, databases, and multithreaded programming. It's recommended to study existing open source blockchain implementations to understand how they work in detail.

## 3. Transaction Design

Transactions are the heart of a blockchain as they represent the actions carried out on the network. In Bitcoin, for example, a transaction is a transfer of value from one person to another. Designing a transaction involves defining its structure (inputs, outputs) and how it's validated (signature verification).

Creating a transaction in a blockchain network involves dealing with cryptography, specifically with cryptographic signatures and hash functions. The C++ Standard Library doesn't have cryptographic functions, so you'll need to use a library like OpenSSL or Crypto++.

In this simplified example, I'll illustrate a basic structure of a transaction and its validation using Crypto++. However, bear in mind that a real-world blockchain transaction would be much more complex, would include additional checks and balances, and would be part of a larger system that includes blocks, a network of nodes, consensus mechanisms, etc.

```
#include <string>
#include <crypto++/secblock.h>
#include <crypto++/osrng.h>
#include <crypto++/eccrypto.h>
#include <crypto++/oids.h>

using namespace std;
using namespace CryptoPP;

class Transaction {
public:
    string senderPublicKey;
    string receiverPublicKey;
    double amount;
    string signature;

    bool Validate() {
        // We'll use the secp256k1 curve, like Bitcoin.
        ECDSA<ECP, SHA256>::PublicKey publicKey;
        publicKey.Load(StringSource(senderPublicKey, true).Ref());

        ECDSA<ECP, SHA256>::Verifier verifier(publicKey);
        return verifier.VerifyMessage((const byte*)&amount, sizeof(amount), (const byte*)signature.data(), signature.size());
    }
};

class Wallet {
public:
    ECDSA<ECP, SHA256>::PrivateKey privateKey;
    ECDSA<ECP, SHA256>::PublicKey publicKey;

    Wallet() {
        AutoSeededRandomPool rng;
        privateKey.Initialize(rng, ASN1::secp256k1());
        publicKey = ECDSA<ECP, SHA256>::PublicKey(privateKey);
    }

    Transaction SendFunds(string receiverPublicKey, double amount) {
        Transaction tx;
        tx.senderPublicKey = publicKey.Save(StringSink().Ref());
        tx.receiverPublicKey = receiverPublicKey;
        tx.amount = amount;

        AutoSeededRandomPool rng;
        ECDSA<ECP, SHA256>::Signer signer(privateKey);
        size_t siglen = signer.MaxSignatureLength();
        tx.signature.resize(siglen);
        siglen = signer.SignMessage(rng, (const byte*)&amount, sizeof(amount), (byte*)tx.signature.data());
        tx.signature.resize(siglen);

        return tx;
    }
};
```

In this example, a `Transaction` has a sender's public key, a receiver's public key, and the amount to be transferred. The `Validate` function checks the signature of the transaction to ensure that it has indeed been created by the sender. A `Wallet` has a private and a public key and can create a `Transaction` to send funds.

A transaction is valid if the message (in this case, the amount being sent) signed with the sender's private key can be verified with the sender's public key. This is the essence of digital signatures, and it is how transactions are validated in many blockchains.

It's important to note that a real transaction system would also need to include measures to prevent double spending, to keep track of balances, and to handle transaction fees, among other things. Implementing such a system securely and efficiently is a significant task.

From a mathematical perspective, digital signatures are based on the mathematics of elliptic curves. The secp256k1 curve used by Bitcoin, for example, is defined by the equation `y^2 = x^3 + 7` over a finite field. The private key is a random number, and the public key is a point on the curve derived from the private key. The signature is a pair of numbers (r, s) derived from the private key, the message being signed, and a random number. The verification process uses the public key, the message, and the signature (r, s) to confirm that the signature was generated by someone with access to the corresponding private key. The details of this process involve complex mathematics including modular arithmetic, the properties of elliptic curves, and the discrete logarithm problem.

## 4. Block Design

A block is a container for transactions. Designing a block involves understanding its structure, which typically includes the following:

- Block Header: This includes metadata, such as a version number, the hash of the previous block (linking it to this block), a timestamp, and a nonce used in PoW.

- Transaction Counter: An indicator of the number of transactions in the block.

- Transactions: The transactions themselves.

The process of creating a new block, often known as mining in PoW blockchains, involves validating and adding transactions to the block, and finding a value that, when hashed with the block's contents, produces a hash that meets certain criteria.

Here's a simplified example of a block structure in C++. We're not dealing with actual mining in this example, just the basic structure of a block.

```
#include <string>
#include <vector>
#include <ctime>
#include <crypto++/sha.h>
#include <crypto++/hex.h>

using namespace std;
using namespace CryptoPP;

class Transaction { /* As previously defined */ };

class Block {
public:
    string previousHash;
    int nonce = 0;
    time_t timestamp;
    vector<Transaction> transactions;

    Block(string previousHash, vector<Transaction> transactions) {
        this->previousHash = previousHash;
        this->timestamp = time(NULL);
        this->transactions = transactions;
    }

    string GetBlockHash() {
        SHA256 hash;
        string src = to_string(timestamp) + to_string(nonce) + previousHash + GetTransactionsData();
        string digest;
        StringSource s(src, true, new HashFilter(hash, new HexEncoder(new StringSink(digest))));
        return digest;
    }

    string GetTransactionsData() {
        // Concatenate transaction data
        string transactionData = "";
        for (auto &transaction : transactions) {
            // Here we would typically include transaction-specific data
            transactionData += transaction.amount; // Simplified for this example
        }
        return transactionData;
    }

    void MineBlock(int difficulty) {
        string target(difficulty, '0');
        while (GetBlockHash().substr(0, difficulty) != target) {
            nonce++;
        }
    }
};
```

In this code:

- Each `Block` contains a previous block hash, a nonce (which is used during mining), a timestamp, and a list of transactions.

- `GetBlockHash()` generates a SHA-256 hash of the block data.

- `GetTransactionsData()` is a simplified example of how you might gather data from the block's transactions.

- `MineBlock(int difficulty)` is a basic example of mining. It increments the nonce until the first `difficulty` characters of the block's hash are zeros. This isn't how real mining works, but it serves to illustrate the basic concept of trying different nonce values until you find one that makes the hash meet certain criteria.

Bear in mind that this code is extremely simplified and should not be used for any real-world purposes. A production blockchain would include many more checks and balances, a mechanism for distributing blocks to other nodes, more complex transaction data, and much more. The code is provided to illustrate the fundamental concepts of a block in a blockchain and how it might be represented in code.

For the mathematical part, the fundamental operation here is the SHA-256 hash function, which transforms any input data into a 256-bit number in such a way that even a tiny change to the input will produce a dramatically different output. The 'mining' process can be seen as a search for a specific input that will produce an output with certain properties (in this case, beginning with a certain number of zeros). The only way to find such an input is to try different possibilities one after another, which is why it requires a lot of computational work.

## 5. Security Measures

Blockchain's value proposition hinges on its security and immutability. Here are key security aspects to consider:

- **Cryptography**: Blockchains use cryptographic algorithms (like SHA-256 in Bitcoin) for various purposes, such as creating a digital signature or generating a block's hash.

- **Consensus Mechanism**: The consensus mechanism ensures that all nodes agree on the validity of transactions, preventing double-spending and maintaining consistency across the network.

- **Incentive Mechanism**: This includes rewarding nodes (through mining rewards or transaction fees) to encourage honest behavior and secure the network.

## 6. Smart Contracts

For blockchains like Ethereum, smart contracts are crucial. They are self-executing contracts with the terms of the agreement directly written into code. They enable complex applications and automate the enforcement of their rules. Building a blockchain with smart contract functionality involves designing the contract structure and the associated programming language.

## 7. Interfacing: API and GUI

To interact with your blockchain, you'll need to create interfaces:

- **Application Programming Interface (API)**: This allows other software (like applications or other nodes) to interact with your blockchain. It defines functions that command the node to perform certain actions like creating a transaction or fetching a block.

- **Graphical User Interface (GUI)**: A GUI allows humans to interact with your blockchain more easily. This could be a wallet application that allows users to send transactions, view their balance, or any number of other interactions with the blockchain.

Understanding and implementing these fundamental components will put you on the path to becoming proficient in blockchain development. As your knowledge deepens, you can explore more complex aspects like cross-chain interoperability, Layer-2 solutions, and privacy enhancements. Remember, learning is an iterative process, so continue experimenting and building. The world of blockchain awaits your innovations!
