const ethers = require('ethers');

for (let i = 0; i < 15; i++) {
  // All createRandom Wallets are generated from random mnemonics
  let wallet = ethers.Wallet.createRandom();
  let mnemonic = wallet.mnemonic;
  
  const hdnode = ethers.utils.HDNode.fromMnemonic(mnemonic);
  const node = hdnode.derivePath("m/44'/60'/0'/0/0");
  
  const publicKey = ethers.utils.computePublicKey(node.privateKey)
  // console.log("public key:", publicKey)
  
  const address = ethers.utils.computeAddress(node.privateKey);
  console.log(address);
  console.log(node.privateKey)
  console.log(mnemonic)
  console.log()
}

