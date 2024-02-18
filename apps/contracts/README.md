# zkGitPerks Contracts

This repository contains smart contracts for the `zkGitPerks` system, a decentralized application leveraging zero-knowledge proofs (ZKPs) to validate pull request (PR) email proofs and manage user identities and permissions within a blockchain ecosystem.

## Overview

The `zkGitPerks Contracts` system is designed to integrate with Git-based project management workflows, utilizing zero-knowledge proofs to ensure privacy and security in validating contributions and managing access to project-specific perks and functionalities.

### Main Components

- **GateKeeper Contract**: The central contract that validates PR email proofs by interfacing with the `PrVerifier` contract. Upon successful validation, it adds the user's Semaphore identity commitment to an on-chain Semaphore group, enabling controlled access to project perks and functionalities.

- **PrVerifier Contract**: Located in the `verifiers` directory, this contract contains the logic for verifying zero-knowledge proofs of PR email submissions. It ensures that proofs are valid without revealing the underlying data.

- **Perk Contracts**: Found in the `perks` directory, these contracts interface with the `GateKeeper` contract to perform additional email validations tailored to specific use cases. They define the logic for accessing various perks associated with project contributions.

## Getting Started

To get started with the `zkGitPerks Contracts`:

clone the repo and install the dependencies using:

### install the dependencies

```
yarn
```

### download snark artifacts required for running the tests

```
npx hardhat run scripts/download-snark-artifacts.ts
```

### run the tests:

```
npx hardhat test
```

## deploying

edit `deploy.ts` script and adjust it to what you want to deploy and run it using `npx hardhat run`