# zkGitPerks

zkGitPerks is a privacy-focused platform designed to enhance the experience of open source contributors by enabling them to anonymously claim a variety of perks and benefits. At its core, zkGitPerks leverages zkEmail technology to establish a secure and privacy-preserving mechanism for contributors to prove their involvement in open source projects without revealing their identity. This system allows individuals who contribute to repositories, such as the go-ethereum project, to anonymously demonstrate their contributions through zero-knowledge proofs. By submitting evidence of a merged pull request (PR) without disclosing their email directly, contributors can join exclusive clubs associated with their projects.

## Deployed Contract and Demo

### Live Demo

Webapp is live on [https://perks.zkfriendly.xyz/](https://perks.zkfriendly.xyz/) 

### Deployed Contracts

| Contract Name             | Address                                                                                      |
|---------------------------|----------------------------------------------------------------------------------------------|
| `pairingLibrary`          | [`0x05Fc6E7e008eA42410Ce09279E8D810ac7838FA6`](https://sepolia.scrollscan.dev/address/0x05Fc6E7e008eA42410Ce09279E8D810ac7838FA6) |
| `semaphoreVerifier`       | [`0x796778a6502405929135d6934E0d647723C6db11`](https://sepolia.scrollscan.dev/address/0x796778a6502405929135d6934E0d647723C6db11) |
| `poseidonLibrary`         | [`0x495D0753dEcC9Bb5740591ec2Ff3DA6a1760767a`](https://sepolia.scrollscan.dev/address/0x495D0753dEcC9Bb5740591ec2Ff3DA6a1760767a) |
| `incrementalBinaryTree`   | [`0xC96B68D9d89cfD0D0BaB2bc022366483CBDef9e9`](https://sepolia.scrollscan.dev/address/0xC96B68D9d89cfD0D0BaB2bc022366483CBDef9e9) |
| `semaphore`               | [`0xf4C4821434c0B54Dd0c45953A8fF38f6D15c2166`](https://sepolia.scrollscan.dev/address/0xf4C4821434c0B54Dd0c45953A8fF38f6D15c2166) |
| `prVerifier`              | [`0x2D6f61a7D4Fc62169327B7B58F59Bf21c1CFd037`](https://sepolia.scrollscan.dev/address/0x2D6f61a7D4Fc62169327B7B58F59Bf21c1CFd037) |
| `zkBillVerifier`          | [`0x3B6c494fB12246787e5675241c6D24Ca3063E21A`](https://sepolia.scrollscan.dev/address/0x3B6c494fB12246787e5675241c6D24Ca3063E21A) |
| `packedUtils`             | [`0x14CCd8b3ea6EC2dbF70043DFb32914f3E30aC4D5`](https://sepolia.scrollscan.dev/address/0x14CCd8b3ea6EC2dbF70043DFb32914f3E30aC4D5) |
| `zkBill`                  | [`0x63E38740bDa25B22DAd4872b2088f5AbfE0Da51E`](https://sepolia.scrollscan.dev/address/0x63E38740bDa25B22DAd4872b2088f5AbfE0Da51E) |
| `herokuBill`              | [`0xDe4B6FdD32F1bF5984348Eeaa567F95AEFB03A99`](https://sepolia.scrollscan.dev/address/0xDe4B6FdD32F1bF5984348Eeaa567F95AEFB03A99) |
| `gateKeeper`              | [`0x267ce9b841ce44e96f46d840a19850af480a81e3`](https://sepolia.scrollscan.dev/address/0x267ce9b841ce44e96f46d840a19850af480a81e3) |

### Semaphore Subgraph

Semaphore subgraph endpoint: [https://api.studio.thegraph.com/proxy/65978/semaphore/version/latest](https://api.studio.thegraph.com/proxy/65978/semaphore/version/latest)

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
