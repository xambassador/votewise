const algorithm = "AES-GCM";
/**
 * Converts a string to a CryptoKey for use with Web Crypto API
 *
 * @param key - The raw key string (must be 32 characters)
 * @returns A Promise resolving to a CryptoKey
 */
async function stringToKey(key: string): Promise<CryptoKey> {
  if (key.length !== 32) {
    throw new Error("Key length must be 32 characters");
  }
  const keyBuffer = new TextEncoder().encode(key);
  return await crypto.subtle.importKey("raw", keyBuffer, { name: algorithm, length: 256 }, false, [
    "encrypt",
    "decrypt"
  ]);
}

/**
 * Encrypts a string using Web Crypto API with AES-GCM
 *
 * @param data - The string to be encrypted
 * @param key - The key to use for encryption
 * @returns A Promise resolving to the base64 encrypted string
 */
export async function symmetricEncrypt(data: string, key: string): Promise<string> {
  const cryptoKey = await stringToKey(key);

  // 12 bytes is standard for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(data);
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: algorithm,
      iv
    },
    cryptoKey,
    encodedData
  );

  const combinedBuffer = new Uint8Array(iv.length + encryptedContent.byteLength);
  combinedBuffer.set(iv);
  combinedBuffer.set(new Uint8Array(encryptedContent), iv.length);
  return btoa(String.fromCharCode.apply(null, Array.from(combinedBuffer)));
}

/**
 * Decrypts a string using Web Crypto API with AES-GCM
 *
 * @param data - The base64 encrypted string to be decrypted
 * @param key - The key to use for decryption
 * @returns A Promise resolving to the decrypted string
 */
export async function symmetricDecrypt(data: string, key: string): Promise<string> {
  const cryptoKey = await stringToKey(key);
  const combinedBuffer = new Uint8Array(
    atob(data)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
  const iv = combinedBuffer.slice(0, 12);
  const encryptedContent = combinedBuffer.slice(12);
  const decryptedContent = await crypto.subtle.decrypt(
    {
      name: algorithm,
      iv
    },
    cryptoKey,
    encryptedContent
  );
  return new TextDecoder().decode(decryptedContent);
}
