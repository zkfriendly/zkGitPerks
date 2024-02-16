//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "../interfaces/IGateKeeperMeta.sol";

import "hardhat/console.sol";

/// @title Devconnect Coworking Space ticket reimbursement contract
/// @author zkfriendly
/// @notice This contract is used to reimburse the ticket of the coworking space based on a given gatekeeper
/// this contract allows for a one time reimbursement of the ticket price in the token
contract Cowork {
    address public gateKeeper;
    address public token; // reimbursement are paid in this token
    uint256 public ticketPrice; // price of the ticket in token

    struct GateKeeperProof {
        uint256 merkleTreeRoot;
        uint256 nullifierHash;
        uint256[8] proof;
    }

    struct Proof {
        uint[2] _pA;
        uint[2][2] _pB;
        uint[2] _pC;
        uint[3] _pubSignals;
    }

    constructor(address _gateKeeper, address _token, uint256 _ticketPrice) {
        gateKeeper = _gateKeeper;
        token = _token;
        ticketPrice = _ticketPrice;
    }

    function claim(GateKeeperProof calldata gateKeeperProof, Proof calldata proof) external {
        IGateKeeper(gateKeeper).validateContributorSignal( // reverts if not contributor
            IGateKeeper.Signal(
                uint256(keccak256(abi.encodePacked(address(this)))),
                getScope(),
                gateKeeperProof.merkleTreeRoot,
                gateKeeperProof.nullifierHash,
                gateKeeperProof.proof
            )
        );
    }

    function getScope() public view returns (uint256) {
        return uint(keccak256(abi.encodePacked(address(this))));
    }
}
