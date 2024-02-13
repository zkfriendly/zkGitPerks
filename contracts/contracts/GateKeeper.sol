//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import "./interfaces/IPrVerifier.sol";

contract GateKeeper {
    uint256 public immutable CONTRIBUTOR_GROUP_ID;
    uint256 public immutable INVESTOR_GROUP_ID;
    address public immutable semaphore;
    address public immutable prVerifier;

    error InvalidProof();

    constructor(address _semaphore, address _prVerifier) {
        semaphore = _semaphore;
        prVerifier = _prVerifier;

        // generate random group ids
        uint256 contributorGroupId = uint256(
            keccak256(abi.encodePacked(address(this), "CONTRIBUTOR"))
        );
        uint256 investorsGroupId = uint256(
            keccak256(abi.encodePacked(address(this), "INVESTOR"))
        );

        CONTRIBUTOR_GROUP_ID = contributorGroupId;
        INVESTOR_GROUP_ID = investorsGroupId;

        // create groups
        ISemaphore(_semaphore).createGroup(
            contributorGroupId,
            20,
            address(this)
        );
        ISemaphore(_semaphore).createGroup(investorsGroupId, 20, address(this));
    }

    function joinContributorsGroup(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[5] calldata _pubSignals
    ) external {
        if (!IPrVerifier(prVerifier).verifyProof(_pA, _pB, _pC, _pubSignals))
            revert InvalidProof();

        // ISemaphore(semaphore).addMember(CONTRIBUTOR_GROUP_ID, msg.sender);
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
