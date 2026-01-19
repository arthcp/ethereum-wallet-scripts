const ethers = require('ethers');

// for (let i = 0; i < 15; i++) {
for (let i = 0; true; i++) {
  console.log(i);
  // All createRandom Wallets are generated from random mnemonics
  let wallet = ethers.Wallet.createRandom();
  let mnemonic = wallet.mnemonic.phrase;

  const node = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, "m/44'/60'/0'/0/0");

  // const publicKey = ethers.computePublicKey(node.privateKey)
  // console.log("public key:", publicKey)

  const address = node.address;
  const add = address.toLowerCase();
  // if (add[2] === 'b' && add[3] === '0' && add[4] === 'b') {
    console.log(address);
    console.log(node.privateKey)
    console.log(mnemonic)
    console.log()
    break;
  // }
}

