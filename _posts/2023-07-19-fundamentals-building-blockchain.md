---
layout: posts/post
title: "Fundamentals of Building a Blockchain"
date: 2023-07-19 00:00:00 +0000
categories: ["blockchain"]
tags: ["block-design", "blockchain", "blockchain-mathematical-principles", "c-blockchain-implementation"]
post_image: "/assets/images/writing/fundamentals-building-blockchain.webp"
description: "A C++ learning path through hash-linked records, proof of work, message framing, transaction signatures, and the limits of a local prototype."
permalink: "/fundamentals-building-blockchain/"
image_alt: "Interlocking graphite slabs with distinct engraved textures represent records linked into a blockchain."
post_image_small: "/assets/images/writing/fundamentals-building-blockchain-640.webp"
post_image_medium: "/assets/images/writing/fundamentals-building-blockchain-960.webp"
image_width: 1600
image_height: 900
image_caption: "Editorial illustration."
original_post_image: "https://old.guillaumelauzier.com/wp-content/uploads/2023/07/generatedart_blockchain_design_2646b05c-8a51-400f-8a48-d65ace71f92f-2.png"
last_modified_at: 2026-11-22 12:00:00 +0000
---

Building a small blockchain is a useful way to learn how records, cryptography, and distributed systems fit together. The first milestone is a program whose behavior you can explain and test. A production network adds a much harder problem: independent participants must agree on valid state while some participants may be faulty or hostile.

The examples below separate those concerns. A local hash chain demonstrates tamper detection and a simplified work requirement. A bounded network receiver illustrates message framing. A transaction example shows which fields must be authenticated. They are learning components, not a deployable financial system.

## 1. Understanding Blockchain Basics

A block can commit to its own contents and to a previous block through a cryptographic hash. Changing an earlier record changes its hash, which breaks the expected link from the next record unless subsequent records are also recomputed.

That property alone does not make the history immutable. Someone controlling a local file can rewrite the whole chain. A network needs additional rules about valid transactions, competing histories, and the cost or authority required to propose blocks.

The following complete C++17 program uses OpenSSL's [EVP digest interface](https://docs.openssl.org/3.0/man3/EVP_DigestInit/) for SHA-256. Each block includes a previous hash, data, and a nonce. Length prefixes make the fields unambiguous, while a version marker identifies this demonstration's encoding.

```cpp
#include <openssl/evp.h>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

std::string sha256(const std::string& input) {
    unsigned char digest[EVP_MAX_MD_SIZE];
    unsigned int length = 0;
    if (EVP_Digest(input.data(), input.size(), digest, &length,
                   EVP_sha256(), nullptr) != 1) {
        throw std::runtime_error("SHA-256 failed");
    }
    std::ostringstream out;
    for (unsigned int i = 0; i < length; ++i) {
        out << std::hex << std::setw(2) << std::setfill('0')
            << static_cast<unsigned int>(digest[i]);
    }
    return out.str();
}

std::string field(const std::string& value) {
    return std::to_string(value.size()) + ":" + value;
}

struct Block {
    std::string previous;
    std::string data;
    std::uint64_t nonce = 0;
    std::string hash;

    std::string calculateHash() const {
        return sha256("demo-block-v1|" + field(previous) + field(data)
                      + field(std::to_string(nonce)));
    }
};

Block mineBlock(const std::string& previous, const std::string& data,
                unsigned difficulty) {
    if (difficulty > 4) {
        throw std::invalid_argument("Use a small demo difficulty: 0 to 4");
    }
    const std::string prefix(difficulty, '0');
    Block block{previous, data, 0, ""};
    const std::uint64_t attemptLimit = 1000000;
    for (; block.nonce < attemptLimit; ++block.nonce) {
        block.hash = block.calculateHash();
        if (block.hash.compare(0, prefix.size(), prefix) == 0) {
            return block;
        }
    }
    throw std::runtime_error("Demo attempt limit reached");
}

bool validChain(const std::vector<Block>& chain, unsigned difficulty) {
    if (difficulty > 4) return false;
    const std::string prefix(difficulty, '0');
    std::string expectedPrevious(64, '0');
    for (const auto& block : chain) {
        if (block.previous != expectedPrevious ||
            block.hash != block.calculateHash() ||
            block.hash.compare(0, prefix.size(), prefix) != 0) {
            return false;
        }
        expectedPrevious = block.hash;
    }
    return true;
}

int main() {
    constexpr unsigned difficulty = 3;
    std::vector<Block> chain;
    for (const std::string data : {"Block 1", "Block 2", "Block 3"}) {
        const auto previous = chain.empty()
            ? std::string(64, '0') : chain.back().hash;
        chain.push_back(mineBlock(previous, data, difficulty));
    }
    for (const auto& block : chain) {
        std::cout << block.data << " | nonce " << block.nonce
                  << " | " << block.hash << '\n';
    }
    std::cout << "Valid: " << std::boolalpha
              << validChain(chain, difficulty) << '\n';
    chain[1].data = "Changed data";
    std::cout << "Valid after edit: "
              << validChain(chain, difficulty) << '\n';
}
```

Compile with OpenSSL development headers and libraries installed:

```bash
g++ -std=c++17 -O2 chain_demo.cpp -lcrypto -o chain_demo
./chain_demo
```

The program should accept the original chain and reject it after the second block's data changes. Try a second experiment: recompute the changed block and every successor. The resulting local chain can pass again. That demonstrates why hash linkage is only one part of a distributed ledger's security.

The work rule requires a chosen number of leading zero hexadecimal digits. Under the usual uniform-hash model, each additional zero multiplies expected attempts by 16. This is a simplified threshold test; it is not Bitcoin's block format, difficulty adjustment, or full consensus mechanism. The attempt limit keeps this learning example bounded.

In a real proof-of-work network, nodes also validate transactions and apply a rule for choosing among competing valid histories. Proof of stake uses a different mechanism for assigning and constraining that authority. Neither can be implemented merely by adding a mining loop to a vector of blocks.

## 2. Node Creation

A node needs to receive data without trusting it. Network messages require a wire format with size limits and a parser. Sending the raw memory of a C++ object is incorrect when that object contains strings, vectors, or pointers: those bytes describe process-local representation, not a portable block.

Asio is a separate networking library, not native networking added to the C++20 standard library. This complete example uses standalone Asio 1.30.2 to accept one connection on loopback and read one bounded newline-delimited message. It demonstrates transport only; it does not accept the contents as a valid block.

```cpp
#define ASIO_STANDALONE
#include <asio.hpp>
#include <iostream>
#include <string>

int main() {
    try {
        asio::io_context context;
        using asio::ip::tcp;
        tcp::acceptor acceptor(
            context, tcp::endpoint(asio::ip::address_v4::loopback(), 12345));
        tcp::socket socket(context);
        acceptor.accept(socket);

        asio::streambuf buffer(4096); // Maximum buffered message size.
        asio::read_until(socket, buffer, '\n');
        std::istream input(&buffer);
        std::string encodedMessage;
        std::getline(input, encodedMessage);
        std::cout << "Received " << encodedMessage.size()
                  << " bytes; decoding and validation are still required.\n";
    } catch (const std::exception& error) {
        std::cerr << error.what() << '\n';
        return 1;
    }
}
```

Build with the Asio include directory on the compiler's search path and `-pthread`, for example `g++ -std=c++17 node_demo.cpp -I/path/to/asio/include -pthread -o node_demo`. The [Asio `read_until` reference](https://think-async.com/Asio/asio-1.30.2/doc/asio/reference/read_until.html) describes the framing operation.

The synchronous structure keeps the socket and buffer alive for the whole read. A real server needs deadlines, connection limits, peer management, and asynchronous operations with well-defined object lifetimes. The bounded buffer prevents unbounded message allocation, but it does not stop a slow peer from occupying this single connection indefinitely.

After receiving a message, a node must decode it, check field limits, recompute commitments, verify transactions, and apply the consensus rules before updating state. Transport success is not validation success.

## 3. Transaction Design

A transaction defines a proposed state change and the authority for making it. The signed message must bind every field that affects that change. Signing only an amount would let an attacker substitute a recipient while keeping the signature valid.

Use integer amounts in the smallest defined unit instead of floating-point values. Include a network identifier to separate domains and a nonce or input reference to support replay and double-spend checks. Specify one canonical encoding so every node signs and verifies the same bytes.

The following C++17 fragment constructs that message and verifies an ECDSA/SHA-256 signature through OpenSSL. The caller must obtain `authorizedKey` from the trusted association with the transaction's sender; accepting an arbitrary key supplied by an attacker would defeat the authorization check.

```cpp
#include <openssl/evp.h>
#include <cstdint>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

struct Transaction {
    std::uint64_t chainId;
    std::uint64_t nonce;
    std::string sender;
    std::string recipient;
    std::uint64_t amount;
};

std::string signedMessage(const Transaction& tx) {
    const auto encode = [](const std::string& value) {
        return std::to_string(value.size()) + ":" + value;
    };
    return "demo-transfer-v1|" + encode(std::to_string(tx.chainId))
        + encode(std::to_string(tx.nonce)) + encode(tx.sender)
        + encode(tx.recipient) + encode(std::to_string(tx.amount));
}

bool verifySignature(EVP_PKEY* authorizedKey, const Transaction& tx,
                     const std::vector<unsigned char>& signature) {
    if (authorizedKey == nullptr || signature.empty()) return false;
    const auto message = signedMessage(tx);
    std::unique_ptr<EVP_MD_CTX, decltype(&EVP_MD_CTX_free)> context(
        EVP_MD_CTX_new(), EVP_MD_CTX_free);
    if (!context) throw std::runtime_error("Cannot allocate digest context");
    if (EVP_DigestVerifyInit(context.get(), nullptr, EVP_sha256(), nullptr,
                             authorizedKey) != 1) {
        throw std::runtime_error("Cannot initialize signature verification");
    }
    const int result = EVP_DigestVerify(
        context.get(), signature.data(), signature.size(),
        reinterpret_cast<const unsigned char*>(message.data()), message.size());
    return result == 1;
}
```

This is a library fragment, not a complete wallet. It requires an appropriately generated key and a signature over `signedMessage(tx)`. OpenSSL's [EVP signing documentation](https://docs.openssl.org/3.0/man3/EVP_DigestSignInit/) covers the corresponding signing operations. Production key generation and storage should use the library's supported mechanisms and an explicit custody design.

A valid signature is only one condition for a valid transaction. The node must also check the expected chain ID, sender authority, nonce or unspent inputs, sufficient funds, amount limits, and arithmetic overflow. It must ensure the same authorization cannot be applied twice.

A useful test signs one transaction, then changes the recipient, amount, nonce, and chain ID separately. Every altered message should fail signature verification. A separate state test should reject a replay of the original valid message after it has already been applied.

## 4. Block Design

A full block design separates the header from the transaction body. The header can commit to the transaction set through a Merkle root, together with a previous-block reference and the fields required by the chosen consensus rules. Nodes still need the actual transactions to validate their state effects.

The local example above hashes one data string directly. Extending it to transactions requires a canonical encoding of each transaction and an unambiguous commitment to their order. Concatenating loosely formatted amounts or reading object memory is insufficient.

A simplified construction can be described as:

```text
transaction_id = hash(canonical transaction bytes)
transaction_root = merkle_root(ordered transaction identifiers)
block_id = hash(canonical header containing previous_id and transaction_root)
```

These equations describe relationships, not a complete protocol. The design must specify the hash function, serialization, empty-tree behavior, treatment of an odd number of leaves, and exactly which fields are signed or hashed. Independent implementations need to produce identical bytes for identical logical inputs.

The [Bitcoin developer reference](https://developer.bitcoin.org/reference/block_chain.html) provides a concrete example of a block header and transaction commitment. Its details should not be assumed to apply unchanged to every chain.

## 5. Security Measures

Security comes from the interaction of cryptography, validation, consensus, and operations. A cryptographic hash detects changes to committed bytes; a signature authenticates a message under a key; consensus rules determine which valid history the network accepts. None replaces the others.

Test invalid inputs as carefully as valid ones. Include malformed encodings, excessive lengths, duplicate transactions, arithmetic boundaries, unknown parents, and conflicting histories. Nodes must reject bad data without exhausting memory or blocking essential work.

Define how state is persisted and recovered after interruption. A node that crashes between updating a balance and recording the transaction must not restart with inconsistent accounting. Protocol upgrades also require an explicit compatibility and deployment plan.

## 6. Smart Contracts

A programmable execution layer lets applications define state transitions beyond simple transfers. It also enlarges the system that every validating node must reproduce. The execution environment needs deterministic behavior, bounded resource use, and explicit rules for errors and external calls.

A contract cannot simply fetch arbitrary internet data during consensus execution. External inputs need a defined ingestion mechanism and trust model. Similarly, a contract's permission to move assets must come from the application's authorization rules, not from the fact that the code exists on-chain.

For a learning project, add a small, explicit state machine before attempting a general virtual machine. Specify allowed operations and test that every node derives the same resulting state from the same ordered inputs.

## 7. Interfacing: API and GUI

An API should expose validated state and distinguish read-only queries from operations that sign or submit transactions. Apply input limits and access controls where appropriate. A node's administrative interface should not be casually exposed as a public application endpoint.

A graphical interface should show the network, recipient, amount, fee, and status of a proposed transaction. “Submitted,” “included,” and “final under the chosen policy” are different states. Recovery and key backup also belong in the user experience.

The learning path is incremental: verify local commitments, authenticate complete messages, validate state transitions, then study how independent nodes coordinate. Keeping those boundaries visible makes each experiment useful without confusing a working demonstration with a secure network.
