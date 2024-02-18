# zkGitPerks

zkGitPerks is a privacy-focused platform designed to enhance the experience of open source contributors by enabling them to anonymously claim a variety of perks and benefits. At its core, zkGitPerks leverages zkEmail technology to establish a secure and privacy-preserving mechanism for contributors to prove their involvement in open source projects without revealing their identity. This system allows individuals who contribute to repositories, such as the go-ethereum project, to anonymously demonstrate their contributions through zero-knowledge proofs. By submitting evidence of a merged pull request (PR) without disclosing their email directly, contributors can join exclusive clubs associated with their projects.

## Deployed Contract and Demo

zkGitPerks Gatekeeper contract is deployed at [0x267ce9b841ce44e96f46d840a19850af480a81e3](https://sepolia.scrollscan.dev/address/0x267ce9b841ce44e96f46d840a19850af480a81e3) on the Scroll Sepolia testnet

Webapp is live on [https://perks.zkfriendly.xyz/](https://perks.zkfriendly.xyz/) 

## Prerequisites

Before you begin, ensure you have the following software installed on your local development environment:

- Node.js, version 16.0.0 or later
- Yarn package manager

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/zkfriendly/zkGitPerks.git
   ```
2. Install the project dependencies:
   ```
   cd zkGitPerks
   yarn install
   ```

## Workspace Structure

This workspace contains the following packages:

- [apps/circuits](https://github.com/zkfriendly/zkGitPerks/tree/main/apps/circuits): ZK Circuits
- [apps/contracts](https://github.com/zkfriendly/zkGitPerks/tree/main/apps/contracts): Smart contracts
- [apps/web-app](https://github.com/zkfriendly/zkGitPerks/tree/main/apps/web-app): A Vite React web-app client

Refer to the README files in each package directory for more details on the specific packages.

## License

This project is licensed under the terms of the MIT license.
