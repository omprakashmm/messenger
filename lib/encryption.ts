import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import CryptoJS from 'crypto-js';

/**
 * End-to-End Encryption Utility
 * Uses TweetNaCl for asymmetric encryption (key exchange)
 * and AES for symmetric encryption (message encryption)
 */

export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

export interface EncryptedMessage {
    ciphertext: string;
    nonce: string;
    ephemeralPublicKey: string;
}

/**
 * Generate a new key pair for the user
 */
export function generateKeyPair(): KeyPair {
    const keyPair = nacl.box.keyPair();
    return {
        publicKey: naclUtil.encodeBase64(keyPair.publicKey),
        privateKey: naclUtil.encodeBase64(keyPair.secretKey),
    };
}

/**
 * Encrypt a message for a recipient
 * @param message - The plaintext message
 * @param recipientPublicKey - The recipient's public key (base64)
 * @param senderPrivateKey - The sender's private key (base64)
 */
export function encryptMessage(
    message: string,
    recipientPublicKey: string,
    senderPrivateKey: string
): EncryptedMessage {
    // Generate ephemeral key pair for this message
    const ephemeralKeyPair = nacl.box.keyPair();

    // Create nonce
    const nonce = nacl.randomBytes(nacl.box.nonceLength);

    // Convert message to Uint8Array
    const messageUint8 = naclUtil.decodeUTF8(message);

    // Decode keys
    const recipientPubKey = naclUtil.decodeBase64(recipientPublicKey);
    const senderPrivKey = naclUtil.decodeBase64(senderPrivateKey);

    // Encrypt the message
    const encrypted = nacl.box(
        messageUint8,
        nonce,
        recipientPubKey,
        senderPrivKey
    );

    return {
        ciphertext: naclUtil.encodeBase64(encrypted),
        nonce: naclUtil.encodeBase64(nonce),
        ephemeralPublicKey: naclUtil.encodeBase64(ephemeralKeyPair.publicKey),
    };
}

/**
 * Decrypt a message
 * @param encryptedMessage - The encrypted message object
 * @param senderPublicKey - The sender's public key (base64)
 * @param recipientPrivateKey - The recipient's private key (base64)
 */
export function decryptMessage(
    encryptedMessage: EncryptedMessage,
    senderPublicKey: string,
    recipientPrivateKey: string
): string | null {
    try {
        // Decode everything
        const ciphertext = naclUtil.decodeBase64(encryptedMessage.ciphertext);
        const nonce = naclUtil.decodeBase64(encryptedMessage.nonce);
        const senderPubKey = naclUtil.decodeBase64(senderPublicKey);
        const recipientPrivKey = naclUtil.decodeBase64(recipientPrivateKey);

        // Decrypt
        const decrypted = nacl.box.open(
            ciphertext,
            nonce,
            senderPubKey,
            recipientPrivKey
        );

        if (!decrypted) {
            throw new Error('Decryption failed');
        }

        return naclUtil.encodeUTF8(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

/**
 * Encrypt file data
 * @param fileData - The file data as ArrayBuffer
 * @param password - Encryption password (derived from shared secret)
 */
export function encryptFile(fileData: ArrayBuffer, password: string): string {
    const wordArray = CryptoJS.lib.WordArray.create(fileData as any);
    const encrypted = CryptoJS.AES.encrypt(wordArray, password);
    return encrypted.toString();
}

/**
 * Decrypt file data
 * @param encryptedData - The encrypted file data
 * @param password - Decryption password
 */
export function decryptFile(encryptedData: string, password: string): ArrayBuffer | null {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedData, password);
        const typedArray = convertWordArrayToUint8Array(decrypted);
        return typedArray.buffer as ArrayBuffer;
    } catch (error) {
        console.error('File decryption error:', error);
        return null;
    }
}

/**
 * Generate a shared secret between two users
 * Used for file encryption
 */
export function generateSharedSecret(
    myPrivateKey: string,
    theirPublicKey: string
): string {
    const myPrivKey = naclUtil.decodeBase64(myPrivateKey);
    const theirPubKey = naclUtil.decodeBase64(theirPublicKey);

    const sharedSecret = nacl.box.before(theirPubKey, myPrivKey);
    return naclUtil.encodeBase64(sharedSecret);
}

/**
 * Hash a password for local storage (never send to server)
 */
export function hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
}

/**
 * Verify message integrity
 */
export function signMessage(message: string, privateKey: string): string {
    const privKey = naclUtil.decodeBase64(privateKey);
    const messageUint8 = naclUtil.decodeUTF8(message);
    const signature = nacl.sign.detached(messageUint8, privKey);
    return naclUtil.encodeBase64(signature);
}

/**
 * Verify message signature
 */
export function verifySignature(
    message: string,
    signature: string,
    publicKey: string
): boolean {
    try {
        const pubKey = naclUtil.decodeBase64(publicKey);
        const messageUint8 = naclUtil.decodeUTF8(message);
        const sig = naclUtil.decodeBase64(signature);
        return nacl.sign.detached.verify(messageUint8, sig, pubKey);
    } catch (error) {
        return false;
    }
}

// Helper function to convert WordArray to Uint8Array
function convertWordArrayToUint8Array(wordArray: any): Uint8Array {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    const u8 = new Uint8Array(sigBytes);

    for (let i = 0; i < sigBytes; i++) {
        u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    return u8;
}

/**
 * Store keys securely in localStorage (encrypted with user password)
 */
export function storeKeysSecurely(keyPair: KeyPair, userPassword: string): void {
    const encryptedPrivateKey = CryptoJS.AES.encrypt(
        keyPair.privateKey,
        userPassword
    ).toString();

    localStorage.setItem('publicKey', keyPair.publicKey);
    localStorage.setItem('privateKey', encryptedPrivateKey);
}

/**
 * Retrieve keys from localStorage
 */
export function retrieveKeys(userPassword: string): KeyPair | null {
    try {
        const publicKey = localStorage.getItem('publicKey');
        const encryptedPrivateKey = localStorage.getItem('privateKey');

        if (!publicKey || !encryptedPrivateKey) {
            return null;
        }

        const privateKey = CryptoJS.AES.decrypt(
            encryptedPrivateKey,
            userPassword
        ).toString(CryptoJS.enc.Utf8);

        return { publicKey, privateKey };
    } catch (error) {
        console.error('Key retrieval error:', error);
        return null;
    }
}

/**
 * Clear stored keys (on logout)
 */
export function clearKeys(): void {
    localStorage.removeItem('publicKey');
    localStorage.removeItem('privateKey');
}
