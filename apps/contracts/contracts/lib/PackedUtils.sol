// SPDX-License-Identifier: MIT

// copied from: https://github.com/zkemail/proof-of-twitter/blob/main/packages/contracts/src/ProofOfTwitter.sol

pragma solidity >=0.7.6;

library PackedUtils {
    function removeTrailingZeros(string memory input) public pure returns (string memory) {
        bytes memory inputBytes = bytes(input);
        uint256 endIndex = inputBytes.length;

        for (uint256 i = 0; i < inputBytes.length; i++) {
            if (inputBytes[i] == 0) {
                endIndex = i;
                break;
            }
        }

        bytes memory resultBytes = new bytes(endIndex);
        for (uint256 i = 0; i < endIndex; i++) {
            resultBytes[i] = inputBytes[i];
        }

        return string(resultBytes);
    }

    function convertPackedBytesToString(
        uint256[] memory packedBytes,
        uint256 signals,
        uint256 packSize
    ) public pure returns (string memory extractedString) {
        uint8 state = 0;
        // bytes: 0 0 0 0 y u s h _ g 0 0 0
        // state: 0 0 0 0 1 1 1 1 1 1 2 2 2
        bytes memory nonzeroBytesArray = new bytes(packedBytes.length * packSize);
        uint256 nonzeroBytesArrayIndex = 0;
        for (uint16 i = 0; i < packedBytes.length; i++) {
            uint256 packedByte = packedBytes[i];
            uint8[] memory unpackedBytes = new uint8[](packSize);
            for (uint256 j = 0; j < packSize; j++) {
                unpackedBytes[j] = uint8(packedByte >> (j * 8));
            }
            for (uint256 j = 0; j < packSize; j++) {
                uint256 unpackedByte = unpackedBytes[j]; //unpackedBytes[j];
                if (unpackedByte != 0) {
                    nonzeroBytesArray[nonzeroBytesArrayIndex] = bytes1(uint8(unpackedByte));
                    nonzeroBytesArrayIndex++;
                    if (state % 2 == 0) {
                        state += 1;
                    }
                } else {
                    if (state % 2 == 1) {
                        state += 1;
                    }
                }
                packedByte = packedByte >> 8;
            }
        }
        // TODO: You might want to assert that the state is exactly 1 or 2
        // If not, that means empty bytse have been removed from the middle and things have been concatenated.
        // We removed due to some tests failing, but this is not ideal and the require should be uncommented as soon as tests pass with it.

        // require(state == 1 || state == 2, "Invalid final state of packed bytes in email; more than two non-zero regions found!");
        require(state >= 1, "No packed bytes found! Invalid final state of packed bytes in email; value is likely 0!");
        require(nonzeroBytesArrayIndex <= signals, "Packed bytes more than allowed max number of signals!");
        string memory returnValue = removeTrailingZeros(string(nonzeroBytesArray));
        return returnValue;
        // Have to end at the end of the email -- state cannot be 1 since there should be an email footer
    }

    function convertPackedBytesToUint(
        uint256[] memory packedBytes,
        uint256 signals,
        uint256 packSize
    ) public pure returns (uint256) {
        string memory extractedString = convertPackedBytesToString(packedBytes, signals, packSize);
        uint256 _num;

        for (uint256 i = 0; i < 3; i++) {
            _num = _num * 10 + (uint8(bytes(extractedString)[i]) - 48);
        }

        return _num;
    }
}
