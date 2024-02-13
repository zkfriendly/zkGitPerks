//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import "./interfaces/IGroth16Verifier.sol";
import "./interfaces/IERC20.sol";

// holds repository name packed
struct Repository {
    uint chunk1;
    uint chunk2;
}

struct Proof {
    uint[2] _pA;
    uint[2][2] _pB;
    uint[2] _pC;
    uint[5] _pubSignals;
}

contract GateKeeper {
    using SafeERC20 for IERC20;

    uint256 public immutable CONTRIBUTOR_GROUP_ID;
    uint256 public immutable DONATORS_GROUP_ID;
    address public immutable semaphore;
    address public immutable groth16verifier;
    address public immutable token;
    uint public immutable donationAmount;

    Repository public repository;
    mapping(uint => bool) public emailNullifier;
    // group id => commitment => isMember
    mapping(uint => mapping(uint => bool)) public isMember;

    uint public totalContributors;
    uint public totalDonators;

    error InvalidProof();
    error EmailAlreadyRegistered();
    error InvalidRepository();
    error CommitmentExists();

    constructor(
        address _semaphore,
        address _groth16verifier,
        address _token,
        uint _donationAmount,
        uint _repoNameChunk1,
        uint _repoNameChunk2
    ) {
        semaphore = _semaphore;
        groth16verifier = _groth16verifier;
        repository = Repository(_repoNameChunk1, _repoNameChunk2);
        token = _token;
        donationAmount = _donationAmount;

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

    function joinContributors(Proof calldata proof) external {
        uint commitment = _validateProof(proof);
        if (isMember[CONTRIBUTOR_GROUP_ID][commitment])
            revert CommitmentExists();
        isMember[CONTRIBUTOR_GROUP_ID][commitment] = true;
        totalContributors++;
        ISemaphore(semaphore).addMember(CONTRIBUTOR_GROUP_ID, commitment);
    }

    function joinDonators(uint commitment) external {
        if (isMember[DONATORS_GROUP_ID][commitment]) revert CommitmentExists();
        isMember[DONATORS_GROUP_ID][commitment] = true;
        totalDonators++;
        ISemaphore(semaphore).addMember(DONATORS_GROUP_ID, commitment);
        IERC20(token).safeTransferFrom(
            msg.sender,
            address(this),
            donationAmount
        );
    }

    function _validateProof(Proof memory proof) internal returns (uint) {
        if (
            !IGroth16Verifier(groth16verifier).verifyProof(
                proof._pA,
                proof._pB,
                proof._pC,
                proof._pubSignals
            )
        ) revert InvalidProof();

        if (emailNullifier[proof._pubSignals[1]])
            revert EmailAlreadyRegistered();

        if (
            repository.chunk1 != proof._pubSignals[3] ||
            repository.chunk2 != proof._pubSignals[4]
        ) revert InvalidRepository();
        emailNullifier[proof._pubSignals[1]] = true;
        // todo: verify email sender

        return proof._pubSignals[0];
    }
}
