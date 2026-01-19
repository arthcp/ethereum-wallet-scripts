const ethUtil = require('ethereumjs-util');

const publicKeyHex = 'c90026fa49afa98aed5d692c37b85a58389502e23b6cba9483e0440079382344cacb25db3646b1aa63ea8a9f8493f630e95dc741c78eeb7134de8c887493fb58';

function getEthereumAddressFromPublicKey(publicKeyHex) {
  try {
    const address = ethUtil.bufferToHex(ethUtil.pubToAddress(Buffer.from(publicKeyHex, 'hex')));
    console.log(address);
  } catch (error) {
    console.error("Error converting public key to Ethereum address:", error);
    return undefined;
  }
}
getEthereumAddressFromPublicKey(publicKeyHex);
