//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import "./interfaces/IGroth16Verifier.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IGateKeeperMeta.sol";

contract GateKeeper is IGateKeeperMeta {
    using SafeERC20 for IERC20;

    address public admin; // for debuging and testing purposes

    uint256 public immutable CONTRIBUTORS_GROUP_ID;
    address public semaphore;
    address public groth16verifier;

    RepositoryName public repository;
    mapping(uint => bool) public emailNullifier;
    // group id => commitment => isMember
    mapping(uint => mapping(uint => bool)) public isMember;

    uint public totalContributors;
    uint public totalDonators;

    constructor(address _semaphore, address _verifier, uint _repoNameChunk1, uint _repoNameChunk2) {
        semaphore = _semaphore;
        groth16verifier = _verifier;
        repository = RepositoryName(_repoNameChunk1, _repoNameChunk2);

        admin = msg.sender;

        // generate random group id
        uint256 contributorGroupId = uint256(keccak256(abi.encodePacked(address(this), "CONTRIBUTOR")));

        CONTRIBUTORS_GROUP_ID = contributorGroupId;

        // create groups
        ISemaphore(_semaphore).createGroup(contributorGroupId, 20, address(this));
    }

    // ================== VIEW FUNCTIONS ==================

    function isContributor(uint commitment) external view returns (bool) {
        return isMember[CONTRIBUTORS_GROUP_ID][commitment];
    }

    // ================== MUTATING FUNCTIONS ==================

    function joinContributors(Proof calldata proof) external {
        uint commitment = _validateContributionProof(proof); // reverts if invalid
        if (isMember[CONTRIBUTORS_GROUP_ID][commitment]) revert CommitmentExists();
        isMember[CONTRIBUTORS_GROUP_ID][commitment] = true;
        totalContributors++;
        ISemaphore(semaphore).addMember(CONTRIBUTORS_GROUP_ID, commitment);
    }

    function validateContributorSignal(Signal calldata signal) external {
        _validateSignal(CONTRIBUTORS_GROUP_ID, signal);
    }

    // ================== INTERNAL FUNCTIONS ==================

    function _validateSignal(uint256 groupId, Signal memory signal) internal {
        ISemaphore(semaphore).verifyProof(
            groupId,
            signal.merkleTreeRoot,
            signal.signal,
            signal.nullifierHash,
            signal.scope,
            signal.proof
        );
    }

    function _validateContributionProof(Proof memory proof) internal returns (uint) {
        if (!IGroth16Verifier(groth16verifier).verifyProof(proof._pA, proof._pB, proof._pC, proof._pubSignals))
            revert InvalidProof();

        if (emailNullifier[proof._pubSignals[1]]) revert EmailAlreadyRegistered();

        if (repository.chunk1 != proof._pubSignals[3] || repository.chunk2 != proof._pubSignals[4])
            revert InvalidRepository();
        emailNullifier[proof._pubSignals[1]] = true;
        // todo: verify email sender

        return proof._pubSignals[0];
    }

    // ================== ADMIN FUNCTIONS ================== for testing and debugging

    function setRepositoryName(uint _repoNameChunk1, uint _repoNameChunk2) external {
        require(msg.sender == admin, "only admin");
        repository = RepositoryName(_repoNameChunk1, _repoNameChunk2);
    }

    function setAdmin(address _admin) external {
        require(msg.sender == admin, "only admin");
        admin = _admin;
    }

    function setVerifier(address _verifier) external {
        require(msg.sender == admin, "only admin");
        groth16verifier = _verifier;
    }

    function setSemaphore(address _semaphore) external {
        require(msg.sender == admin, "only admin");
        semaphore = _semaphore;
    }
}
