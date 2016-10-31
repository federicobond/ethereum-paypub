pragma solidity ^0.4.2;

import "./zeppelin/Rejector.sol";
import "./zeppelin/PullPayment.sol";

contract PayPub2 is PullPayment, Rejector {

    struct Chunk {
        bytes32 hash;
        bytes password;
        uint256 value;
    }

    mapping(bytes32 => Chunk) public chunks;
    uint proved;

    bytes32[] public hashes;
    uint public height;
    uint public count;

    function PayPub2(uint _height, uint _count, bytes32[] _hashes) {
        if (_height <= block.number) throw;
    
        height = _height;
        count  = _count;
        hashes = _hashes;

        proved = 0;

        for (uint i = 0; i < hashes.length; i++) {
            bytes32 hash = hashes[i];
            chunks[hash].hash = hash;
        }
    }

    function pay(bytes32 hash) payable {
        Chunk chunk = chunks[hash];
        if (chunk.hash == 0) throw;
        if (chunk.password.length == 0) throw;

        chunk.value += msg.value;
    }

    function release(bytes password) {
        bytes32 hash = sha256(password);
        Chunk chunk = chunks[hash];
        if (chunk.hash != hash) throw;

        chunk.password = password;

        uint256 value = chunk.value;

        if (value > 0) {
            chunk.value = 0;
            asyncSend(msg.sender, value);
        }
    }

    function shouldProve(uint index) constant returns (bytes32) {
        if (block.number <= height) throw;
        if (index >= count) throw;

        bytes32 blockhash = block.blockhash(height);
        for (uint i = 0; i < index; i++) {
            blockhash = sha3(blockhash);
        }

        return hashes[uint(blockhash) % hashes.length];
    }

    function prove(uint index, bytes password) {
        bytes32 proof = shouldProve(index);

        Chunk chunk = chunks[proof];

        bytes32 hash = sha256(password);
        if (chunk.hash != hash) throw;

        proved += 1;
        chunk.password = password;
    }

    function proofValid() constant returns(bool) {
        return proved >= count;
    }
}
