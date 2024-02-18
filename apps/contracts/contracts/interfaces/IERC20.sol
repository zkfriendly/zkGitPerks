//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IERC20 {
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    function totalSupply() external view returns (uint256);

    function decimals() external view returns (uint8);

    function symbol() external view returns (string memory);

    function name() external view returns (string memory);
}

library SafeERC20 {
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        require(token.transfer(to, value), "SafeERC20: transfer failed");
    }

    function safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value
    ) internal {
        require(
            token.transferFrom(from, to, value),
            "SafeERC20: transferFrom failed"
        );
    }

    function safeApprove(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        require(token.approve(spender, value), "SafeERC20: approve failed");
    }
}
