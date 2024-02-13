//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import "./interfaces/IPrVerifier.sol";

// holds repository name packed
struct Repository {
    uint chunk1;
    uint chunk2;
}

contract GateKeeper {
    uint256 public immutable CONTRIBUTOR_GROUP_ID;
    uint256 public immutable DONATORS_GROUP_ID;
    address public immutable semaphore;
    address public immutable groth16verifier;
    address public immutable token;

    Repository public repository;
    mapping(uint => bool) public emailNullifier;

    uint public totalContributorsVotingPower;
    uint public totalDonatorsVotingPower;

    error InvalidProof();
    error EmailAlreadyRegistered();
    error InvalidRepository();

    constructor(
        address _semaphore,
        address _groth16verifier,
        address _token,
        uint _repoNameChunk1,
        uint _repoNameChunk2
    ) {
        semaphore = _semaphore;
        groth16verifier = _groth16verifier;
        repository = Repository(_repoNameChunk1, _repoNameChunk2);
        token = _token;

        // generate random group ids
        uint256 contributorGroupId = uint256(
            keccak256(abi.encodePacked(address(this), "CONTRIBUTOR"))
        );
        uint256 donatorGroupId = uint256(
            keccak256(abi.encodePacked(address(this), "DONATOR"))
        );

        CONTRIBUTOR_GROUP_ID = contributorGroupId;
        DONATORS_GROUP_ID = donatorGroupId;

        // create groups
        ISemaphore(_semaphore).createGroup(
            contributorGroupId,
            20,
            address(this)
        );
        ISemaphore(_semaphore).createGroup(donatorGroupId, 20, address(this));
    }

    function joinContributors(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[5] calldata _pubSignals
    ) external {
        if (
            !IPrVerifier(groth16verifier).verifyProof(
                _pA,
                _pB,
                _pC,
                _pubSignals
            )
        ) revert InvalidProof();

        if (emailNullifier[_pubSignals[1]]) revert EmailAlreadyRegistered();

        if (
            repository.chunk1 != _pubSignals[3] ||
            repository.chunk2 != _pubSignals[4]
        ) revert InvalidRepository();

        // todo: verify email sender

        emailNullifier[_pubSignals[1]] = true;
        ISemaphore(semaphore).addMember(CONTRIBUTOR_GROUP_ID, _pubSignals[0]);

        totalContributorsVotingPower++;
    }

    function sendFeedback(
        uint256 feedback,
        uint256 merkleTreeRoot,
        uint256 nullifierHash,
        uint256 merkleTreedepth,
        uint256[8] calldata proof
    ) external {
        // SemaphoreProof memory semaphoreProof = SemaphoreProof({
        //     merkleTreeDepth: merkleTreedepth,
        //     merkleTreeRoot: merkleTreeRoot,
        //     nullifier: nullifierHash,
        //     message: feedback,
        //     scope: groupId,
        //     points: proof
        // });
    }
}
