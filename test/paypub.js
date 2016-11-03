function Chunk(val) {
  this.present = val[0];
  this.value = val[1];
  this.password = val[2];
}

contract('PayPub', function(accounts) {
  var hashes = [
    '0x185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969',
    '0x1cbec737f863e4922cee63cc2ebbfaafcd1cff8b790d8cfd2e6a5d550b648afa',
    '0x95d64cacce0f0e5b0d1b843862f0accfadb787a4cabb8a88f7f1694ea232a5fc',
  ];

  it("should store hashes in array", async function() {
    var pp = await PayPub.new(hashes);

    var hash = await pp.hashes(2);
    assert.equal(hash, hashes[2]);
  });

  it("should allow paying to a hash", async function() {
    var pp = await PayPub.new(hashes);

    await pp.pay(hashes[2], { value: 100 });
    var chunk = await pp.chunks(hashes[2]);

    assert.equal(new Chunk(chunk).value, 100);
  });

  it("should allow releasing a chunk password and claiming its value", async function() {

    var password = 'foo';
    var hash = '0x2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae';

    var pp = await PayPub.new([hash]);

    await pp.pay(hash, { from: accounts[0], value: 100 })
    await pp.release(password, { from: accounts[1] })

    var received = await pp.payments(accounts[1])
    assert.equal(received, 100);
  })

  it ("should use sha256 for computeHash", async function() {

    var expected = '0x2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae';

    var pp = await PayPub.new();
    var hash = await pp.computeHash("foo");

    assert.equal(hash, expected);
  })
});
