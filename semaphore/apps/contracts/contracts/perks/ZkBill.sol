//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "../interfaces/IGateKeeperMeta.sol";
import "../interfaces/IZkBillVerifier.sol";
import "../lib/PackedUtils.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function decimals() external view returns (uint8);
}

/// @title Zk Bill reimbursement contract
/// @author zkfriendly
/// @notice This is a demo contract to show how to reimburse a bill once a month based on a given gatekeeper
contract ZkBill {
    address public gateKeeper;
    address public token; // reimbursement are paid in this token
    uint256 public maxRefund; // max price that will be refunded
    address public groth16verifier;

    uint256 public scopeSeed;
    uint256 public lastScopeRefreshTimestamp;

    struct GateKeeperProof {
        uint256 merkleTreeRoot;
        uint256 nullifierHash;
        uint256[8] proof;
    }

    struct Proof {
        uint[2] _pA;
        uint[2][2] _pB;
        uint[2] _pC;
        uint[4] _pubSignals;
    }

    event Claimed(address indexed contributor, uint256 amount);
    event ScopeRefreshed(uint256 newScopeSeed);

    error InvalidProof();

    constructor(address _gateKeeper, address _token, uint256 _maxRefund, address _verifier) {
        gateKeeper = _gateKeeper;
        token = _token;
        maxRefund = _maxRefund;
        groth16verifier = _verifier;

        scopeSeed = uint256(keccak256(abi.encodePacked(address(this), blockhash(block.number))));
        lastScopeRefreshTimestamp = block.timestamp;
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
        if (!IZkBillVerifier(groth16verifier).verifyProof(proof._pA, proof._pB, proof._pC, proof._pubSignals))
            revert InvalidProof();

        uint256[] memory packedBytes = new uint256[](1);
        packedBytes[0] = proof._pubSignals[3];
        uint256 billAmount = PackedUtils.convertPackedBytesToUint(packedBytes, 32, 32);
        billAmount = billAmount * (10 ** IERC20(token).decimals());
        uint256 refund = billAmount > maxRefund ? maxRefund : billAmount;

        require(IERC20(token).transfer(msg.sender, refund));
        emit Claimed(msg.sender, billAmount);
    }

    function getScope() public view returns (uint256) {
        return uint(keccak256(abi.encodePacked(scopeSeed)));
    }

    function refreshScope() external {
        // require(
        //     block.timestamp - lastScopeRefreshTimestamp > 30 days,
        //     "ZkBill: scope can only be refreshed once a month"
        // ); for testing convenience we comment this line
        scopeSeed = uint256(keccak256(abi.encodePacked(scopeSeed, blockhash(block.number))));
        lastScopeRefreshTimestamp = block.timestamp;

        emit ScopeRefreshed(scopeSeed);
    }

    // for testing purpose

    function setMaxRefund(uint256 _maxRefund) external {
        maxRefund = _maxRefund;
    }

    function setGateKeeper(address _gateKeeper) external {
        gateKeeper = _gateKeeper;
    }

    function setVerifier(address _verifier) external {
        groth16verifier = _verifier;
    }

    function setToken(address _token) external {
        token = _token;
    }

    function setScopeSeed(uint256 _scopeSeed) external {
        scopeSeed = _scopeSeed;
    }
}
