module.exports = function(deployer) {
  deployer.deploy(PayPub, [
    '0x185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969',
    '0x1cbec737f863e4922cee63cc2ebbfaafcd1cff8b790d8cfd2e6a5d550b648afa',
    '0x95d64cacce0f0e5b0d1b843862f0accfadb787a4cabb8a88f7f1694ea232a5fc',
  ]);
  deployer.deploy(PayPub2, 2399000, 1, [
    '0x185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969',
    '0x1cbec737f863e4922cee63cc2ebbfaafcd1cff8b790d8cfd2e6a5d550b648afa',
    '0x95d64cacce0f0e5b0d1b843862f0accfadb787a4cabb8a88f7f1694ea232a5fc',
  ]);
};
