//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "../interfaces/IGateKeeperMeta.sol";
import "../interfaces/ICoworkVerifier.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @title Devconnect Coworking Space ticket reimbursement contract
/// @author zkfriendly
/// @notice This contract is used to reimburse the ticket of the coworking space based on a given gatekeeper
/// this contract allows for a one time reimbursement of the ticket price in the token
contract Cowork {
    address public gateKeeper;
    address public token; // reimbursement are paid in this token
    uint256 public ticketPrice; // price of the ticket in token
    address public groth16verifier;

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

    event Claimed(address indexed contributor, uint256 amount);

    error InvalidProof();

    constructor(address _gateKeeper, address _token, uint256 _ticketPrice, address _verifier) {
        gateKeeper = _gateKeeper;
        token = _token;
        ticketPrice = _ticketPrice;
        groth16verifier = _verifier;
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
        if (!ICoworkVerifier(groth16verifier).verifyProof(proof._pA, proof._pB, proof._pC, proof._pubSignals))
            revert InvalidProof();

        require(IERC20(token).transfer(msg.sender, ticketPrice));
        emit Claimed(msg.sender, ticketPrice);
    }

    function getScope() public view returns (uint256) {
        return uint(keccak256(abi.encodePacked(address(this))));
    }
}
