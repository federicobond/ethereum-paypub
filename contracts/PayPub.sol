pragma solidity ^0.4.2;

import "./zeppelin/PullPayment.sol";

contract PayPub is PullPayment {

    struct Chunk {
        bool present;
        uint256 value;
        bytes password;
    }

    mapping(bytes32 => Chunk) public chunks;
    bytes32[] public hashes;

    function PayPub(bytes32[] _hashes) {
        for (uint32 i = 0; i < _hashes.length; i++) {
            bytes32 hash = _hashes[i];

            hashes.push(hash);
            chunks[hash].present = true;
        }
    }

    function pay(bytes32 hash) payable {
        Chunk chunk = chunks[hash];

        if (!chunk.present || chunk.password.length > 0) throw;

        chunk.value += msg.value;
    }

    function release(bytes password) {
        bytes32 hash = computeHash(password);

        Chunk chunk = chunks[hash];
        if (!chunk.present) throw;

        chunk.password = password;

        uint256 value = chunk.value;

        if (value > 0) {
            chunk.value = 0;
            asyncSend(msg.sender, value);
        }
    }

    function computeHash(bytes password) constant returns(bytes32) {
        return sha256(password);
    }
}
