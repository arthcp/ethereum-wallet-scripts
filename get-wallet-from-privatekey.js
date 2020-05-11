const ethers = require('ethers');

const privateKey = "0xb96e9ccb774cc33213cbcb2c69d3cdae17b0fe4888a1ccd343cbd1a17fd98b18";

const publicKey = ethers.utils.computePublicKey(privateKey)
console.log("public key:", publicKey)

const address = ethers.utils.computeAddress(privateKey);
console.log("address:", address);
