#!/usr/bin/env node

const ethers = require('ethers');
const StellarSdk = require('@stellar/stellar-sdk');
const bitcoin = require('bitcoinjs-lib');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');
const { Secp256k1Keypair } = require('@mysten/sui/keypairs/secp256k1');
const { decodeSuiPrivateKey } = require('@mysten/sui/cryptography');
const { toBase64 } = require('@mysten/bcs');

const bip32 = BIP32Factory(ecc);

// Standard derivation paths
const DERIVATION_PATHS = {
  evm: "m/44'/60'/0'/0/0",
  stellar: "m/44'/148'/0'",
  bitcoin: "m/84'/0'/0'/0/0", // Native SegWit (bech32)
  sui: "m/54'/784'/0'/0/0" // Secp256k1
};

function deriveEVM(mnemonic) {
  const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, DERIVATION_PATHS.evm);

  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey
  };
}

function deriveStellar(mnemonic) {
  const seedHex = ethers.Mnemonic.fromPhrase(mnemonic).computeSeed();
  const seed = Buffer.from(seedHex.slice(2), 'hex');
  const root = bip32.fromSeed(seed);
  const child = root.derivePath(DERIVATION_PATHS.stellar);

  const keypair = StellarSdk.Keypair.fromRawEd25519Seed(child.privateKey);

  return {
    address: keypair.publicKey(),
    publicKey: keypair.publicKey(),
    privateKey: keypair.secret()
  };
}

function deriveBitcoin(mnemonic, network = 'mainnet') {
  const networkConfig = network === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  const seedHex = ethers.Mnemonic.fromPhrase(mnemonic).computeSeed();
  const seed = Buffer.from(seedHex.slice(2), 'hex');
  const root = bip32.fromSeed(seed, networkConfig);
  const child = root.derivePath(DERIVATION_PATHS.bitcoin);

  const { address } = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network: networkConfig
  });

  return {
    address: address,
    publicKey: child.publicKey.toString('hex'),
    privateKey: child.toWIF()
  };
}

function deriveSui(mnemonic) {
  const seedHex = ethers.Mnemonic.fromPhrase(mnemonic).computeSeed();
  const seed = Buffer.from(seedHex.slice(2), 'hex');
  const root = bip32.fromSeed(seed);
  const child = root.derivePath(DERIVATION_PATHS.sui);

  const keypair = Secp256k1Keypair.fromSecretKey(child.privateKey);

  // Get bech32 private key and decode to raw bytes
  const bech32PrivateKey = keypair.getSecretKey();
  const { secretKey } = decodeSuiPrivateKey(bech32PrivateKey);

  // Create CLI format: flag (0x01 for Secp256k1) + private key
  const flag = new Uint8Array([1]);
  const combined = new Uint8Array(flag.length + secretKey.length);
  combined.set(flag);
  combined.set(secretKey, flag.length);

  // Encode to base64 (Sui CLI format)
  const base64PrivateKey = toBase64(combined);

  return {
    address: keypair.getPublicKey().toSuiAddress(),
    publicKey: keypair.getPublicKey().toBase64(),
    privateKey: base64PrivateKey
  };
}

function deriveKeys(mnemonic, chain) {
  try {
    ethers.Mnemonic.fromPhrase(mnemonic);
  } catch (error) {
    throw new Error('Invalid mnemonic phrase');
  }

  switch (chain.toLowerCase()) {
    case 'evm':
    case 'ethereum':
    case 'eth':
      return deriveEVM(mnemonic);

    case 'stellar':
    case 'xlm':
      return deriveStellar(mnemonic);

    case 'bitcoin':
    case 'btc':
      return deriveBitcoin(mnemonic);

    case 'sui':
      return deriveSui(mnemonic);

    default:
      throw new Error(`Unsupported chain: ${chain}. Supported chains: evm, stellar, bitcoin, sui`);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node derive-keys.js "<mnemonic>" <chain>');
    console.error('Chains: evm, stellar, bitcoin, sui');
    process.exit(1);
  }

  const mnemonic = args[0];
  const chain = args[1];

  try {
    const keys = deriveKeys(mnemonic, chain);
    console.log(`address ${keys.address}`)
    console.log(`publicKey ${keys.publicKey}`)
    console.log(`privateKey ${keys.privateKey}`)
    // console.log(JSON.stringify(keys, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = { deriveKeys, DERIVATION_PATHS };
