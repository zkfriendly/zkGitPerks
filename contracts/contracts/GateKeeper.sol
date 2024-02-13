//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract GateKeeper {
    address public semaphore;
    uint256 public groupId;

    constructor(address _semaphore, uint256 _groupId) {
        semaphore = _semaphore;
        groupId = _groupId;

        ISemaphore(semaphore).createGroup(groupId, address(this));
    }

    function joinGroup(uint256 identityCommitment) external {
        ISemaphore(semaphore).addMember(groupId, identityCommitment);
    }

    function sendFeedback(
        uint256 feedback,
        uint256 merkleTreeRoot,
        uint256 nullifierHash,
        uint256 merkleTreedepth,
        uint256[8] calldata proof
    ) external {
        ISemaphore.SemaphoreProof memory semaphoreProof = ISemaphore
            .SemaphoreProof({
                merkleTreeDepth: merkleTreedepth,
                merkleTreeRoot: merkleTreeRoot,
                nullifier: nullifierHash,
                message: feedback,
                scope: groupId,
                points: proof
            });

        ISemaphore(semaphore).validateProof(groupId, semaphoreProof);
    }
}
