const ethers = require('ethers');

const mnemonic = "radar blur cabbage chef fix engine embark joy scheme fiction master release";

const hdnode = ethers.utils.HDNode.fromMnemonic(mnemonic);
const node = hdnode.derivePath("m/44'/60'/0'/0/0");
console.log("private key:", node.privateKey)
console.log("public key:", node.publicKey)

const wallet = new ethers.Wallet(node.privateKey);
console.log("address:", wallet.address);
