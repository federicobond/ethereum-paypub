pragma solidity ^0.4.2;

import "./zeppelin/Rejector.sol";
import "./zeppelin/PullPayment.sol";

contract PayPub is PullPayment, Rejector {
  mapping(bytes32 => Chunk) public chunks;

  struct Chunk {
      bytes32 hash;
      bytes password;
      uint256 value;
  }

  function PayPub(bytes32[] hashes) {
      for (uint32 i = 0; i < hashes.length; i++) {
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
}
