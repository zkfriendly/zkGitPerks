//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract GateKeeper {
    uint256 public immutable CONTRIBUTOR_GROUP_ID;
    uint256 public immutable INVESTOR_GROUP_ID;

    address public semaphore;

    constructor(uint256 _maxDepth) {
        address _this = address(this);

        // generate random group ids
        uint256 contributorGroupId = uint256(
            keccak256(abi.encodePacked(_this, "CONTRIBUTOR"))
        );
        uint256 investorsGroupId = uint256(
            keccak256(abi.encodePacked(_this, "INVESTOR"))
        );

        CONTRIBUTOR_GROUP_ID = contributorGroupId;
        INVESTOR_GROUP_ID = investorsGroupId;

        // create groups
        ISemaphore(semaphore).createGroup(contributorGroupId, _maxDepth, _this);
        ISemaphore(semaphore).createGroup(investorsGroupId, _maxDepth, _this);
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
