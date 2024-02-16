//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title Devconnect Coworking Space ticket reimbursement contract
/// @author zkfriendly
/// @notice This contract is used to reimburse the ticket of the coworking space based on a given gatekeeper
/// this contract allows for a one time reimbursement of the ticket price in the token
contract Cowork {
    address public gateKeeper;
    address public token; // reimbursement are paid in this token
    uint256 public ticketPrice; // price of the ticket in token

    constructor(address _gateKeeper, address _token, uint256 _ticketPrice) {
        gateKeeper = _gateKeeper;
        token = _token;
        ticketPrice = _ticketPrice;
    }
}
