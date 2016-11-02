pragma solidity ^0.4.2;

import "./PayPub.sol";

contract PayPub2 is PayPub {

    uint public height;
    uint public count;
    uint proved;

    function PayPub2(uint _height, uint _count, bytes32[] _hashes) PayPub(_hashes) {
        if (_height <= block.number) throw;
    
        height = _height;
        count  = _count;
    }

    function hashToProve(uint index) constant returns (bytes32) {
        if (block.number <= height) throw;
        if (index >= count) throw;

        bytes32 blockhash = block.blockhash(height);
        for (uint i = 0; i < index; i++) {
            blockhash = sha3(blockhash);
        }

        return hashes[uint(blockhash) % hashes.length];
    }

    function prove(uint index, bytes password) {
        bytes32 hash = computeHash(password);

        if (hash != hashToProve(index)) throw;

        Chunk chunk = chunks[hash];
        if (!chunk.present || chunk.password.length > 0) throw;

        chunk.password = password;
        proved += 1;
    }

    function proofValid() constant returns(bool) {
        return proved == count;
    }
}
