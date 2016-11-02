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

  it("should store hashes in array", function(done) {
    var pp;

    PayPub.new(hashes)
      .then(_pp => pp = _pp)
      .then(() => pp.hashes(2))
      .then(hash => assert.equal(hash, hashes[2]))
      .then(done);
  });

  it("should allow paying to a hash", function(done) {
    var pp;

    PayPub.new(hashes)
      .then(_pp => pp = _pp)
      .then(() => pp.pay(hashes[2], { value: 100 }))
      .then(() => pp.chunks(hashes[2]))
      .then(chunk => assert.equal(new Chunk(chunk).value, 100))
      .then(done);
  });

  it("should allow releasing a chunk password and claiming its value", function(done) {
    var pp;

    var password = 'foo';
    var hash = '0x2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae';

    PayPub.new([hash])
      .then(_pp => pp = _pp)
      .then(() => pp.pay(hash, { from: accounts[0], value: 100 }))
      .then(() => pp.release(password, { from: accounts[1] }))
      .then(() => pp.payments(accounts[1]))
      .then(received => assert.equal(received, 100))
      .then(done);
  })

  it ("should use sha256 for computeHash", function(done) {
    var expected = '0x2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae';

    PayPub.new()
      .then(pp => pp.computeHash("foo"))
      .then(hash => assert.equal(hash, expected))
      .then(done);
  })
});

  /*
var sendReward = function(sender, receiver, value){
  web3.eth.sendTransaction({
    from:sender,
    to:receiver,
    value: value
  })
}

contract('Bounty', function(accounts) {
  it("creates bounty contract with factory address", function(done){
    var target = SecureTargetMock.deployed();

    Bounty.new(target.address).
      then(function(bounty){
        return bounty.factoryAddress.call()
      }).
      then(function(address){
        assert.equal(address, target.address)
      }).
      then(done);
  })

  it("sets reward", function(done){
    var target = SecureTargetMock.deployed();
    var owner = accounts[0];
    var reward = web3.toWei(1, "ether");

    Bounty.new(target.address).
      then(function(bounty){
        sendReward(owner, bounty.address, reward);
        assert.equal(reward, web3.eth.getBalance(bounty.address).toNumber())
      }).
      then(done);
  })

  it("cannot create bounty without address", function(done){
    var target = SecureTargetMock.deployed();
    Bounty.new().
      then(function(bounty){
        throw {name : "NoThrowError", message : "should not come here"};
      }).
      catch(function(error){
        assert.notEqual(error.name, "NoThrowError");
      }).
      then(done);
  })

  it("empties itself when killed", function(done){
    var target = SecureTargetMock.deployed();
    var owner = accounts[0];
    var reward = web3.toWei(1, "ether");
    var bounty;
    Bounty.new(target.address).
      then(function(_bounty){
        bounty = _bounty;
        sendReward(owner, bounty.address, reward);
        assert.equal(reward, web3.eth.getBalance(bounty.address).toNumber())
        return bounty.kill()
      }).
      then(function(){
        assert.equal(0, web3.eth.getBalance(bounty.address).toNumber())
      }).
      then(done);
  })

  describe("Against secure contract", function(){
    it("checkInvariant returns true", function(done){
      var targetFactory = SecureTargetFactory.deployed();
      var bounty;
      Bounty.new(targetFactory.address).
        then(function(_bounty) {
          bounty = _bounty;
          return bounty.createTarget();
        }).
        then(function() {
          return bounty.checkInvariant.call()
        }).
        then(function(result) {
          assert.isTrue(result);
        }).
        then(done);
    })

    it("cannot claim reward", function(done){
      var targetFactory = SecureTargetFactory.deployed();
      var owner = accounts[0];
      var researcher = accounts[1];
      var reward = web3.toWei(1, "ether");

      Bounty.new(targetFactory.address).
        then(function(bounty) {
          var event = bounty.TargetCreated({});
          event.watch(function(err, result) {
            event.stopWatching();
            if (err) { throw err }
            var targetAddress = result.args.createdAddress;
            sendReward(owner, bounty.address, reward);
            assert.equal(reward, web3.eth.getBalance(bounty.address).toNumber())
            bounty.claim(targetAddress, {from:researcher}).
              then(function(){ throw("should not come here")}).
              catch(function() {
                return bounty.claimed.call();
              }).
              then(function(result) {
                assert.isFalse(result);
                bounty.withdrawPayments({from:researcher}).
                  then(function(){ throw("should not come here")}).
                  catch(function() {
                    assert.equal(reward, web3.eth.getBalance(bounty.address).toNumber())
                    done();
                  })
              })
          })
          bounty.createTarget({from:researcher});
        })
    })
  })

  describe("Against broken contract", function(){
    it("checkInvariant returns false", function(done){
      var targetFactory = InsecureTargetFactory.deployed();
      var bounty;
      Bounty.new(targetFactory.address).
        then(function(_bounty) {
          bounty = _bounty;
          return bounty.createTarget();
        }).
        then(function() {
          return bounty.checkInvariant.call()
        }).
        then(function(result) {
          assert.isFalse(result);
        }).
        then(done);
    })

    it("claims reward", function(done){
      var targetFactory = InsecureTargetFactory.deployed();
      var owner = accounts[0];
      var researcher = accounts[1];
      var reward = web3.toWei(1, "ether");

      Bounty.new(targetFactory.address).
        then(function(bounty) {
          var event = bounty.TargetCreated({});
          event.watch(function(err, result) {
            event.stopWatching();
            if (err) { throw err }
            var targetAddress = result.args.createdAddress;
            sendReward(owner, bounty.address, reward);
            assert.equal(reward, web3.eth.getBalance(bounty.address).toNumber())
            bounty.claim(targetAddress, {from:researcher}).
              then(function() {
                return bounty.claimed.call();
              }).
              then(function(result) {
                assert.isTrue(result);
                return bounty.withdrawPayments({from:researcher})
              }).
              then(function() {
                assert.equal(0, web3.eth.getBalance(bounty.address).toNumber())
              }).then(done);
          })
          bounty.createTarget({from:researcher});
        })
    })
  })
});
*/
