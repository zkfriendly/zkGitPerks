//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title Devconnect Coworking Space ticket reimbursement contract
/// @author zkfriendly
/// @notice This contract is used to reimburse the ticket of the coworking space based on a given gatekeeper

contract Cowork {
    address public gateKeeper;

    constructor(address _gateKeeper) {
        gateKeeper = _gateKeeper;
    }
}
