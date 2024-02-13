//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IGateKeeperMeta {
    struct RepositoryName {
        uint chunk1;
        uint chunk2;
    }

    struct Proof {
        uint[2] _pA;
        uint[2][2] _pB;
        uint[2] _pC;
        uint[5] _pubSignals;
    }

    struct Signal {
        uint256 signal;
        uint256 scope;
        uint256 merkleTreeRoot;
        uint256 nullifierHash;
        uint256[8] proof;
    }
    error InvalidProof();
    error EmailAlreadyRegistered();
    error InvalidRepository();
    error CommitmentExists();
}
