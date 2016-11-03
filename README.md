ethereum-paypub (UNTESTED)
==========================

An ethereum implementation of the PayPub protocol for trustless payments for
information publishing.

Two contracts are included:

 * `PayPub` is a very simple preimage disclosure contract
 * `PayPub2` includes the commitment to release N chunks by a certain block
    height

I didn't have time to test these contracts, I just wanted to get the idea out
there and commit myself to keep improving them.

## Installation

You will need to install [Zeppelin](https://openzeppelin.org/), which is listed
as a dependency, before compiling these contracts.

```
git clone https://github.com/federicobond/ethereum-paypub.git
npm install
```

## License

Code is licensed under MIT.

## Author

Made with love by [Federico Bond](https://github.com/federicobond).
