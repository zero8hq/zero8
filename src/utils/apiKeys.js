import crypto from 'crypto';

// Prefix for API keys to make them easily identifiable
const API_KEY_PREFIX = 'z8k_';

/**
 * Generates a secure random API key with prefix
 * @returns {{ apiKey: string, lastFour: string }} The generated API key and its last 4 characters
 */
export function generateApiKey() {
    const randomBytes = crypto.randomBytes(24); // 24 bytes = 48 hex characters
    const key = randomBytes.toString('hex');
    const fullKey = `${API_KEY_PREFIX}${key}`;
    const lastFour = key.slice(-4); // Get last 4 characters of the hex string
    
    return {
        apiKey: fullKey,
        lastFour
    };
}

/**
 * Hashes an API key for storage
 * @param {string} apiKey - The API key to hash
 * @returns {string} The hashed API key
 */
export function hashApiKey(apiKey) {
    return crypto
        .createHash('sha256')
        .update(apiKey)
        .digest('hex');
}

/**
 * Validates API key format
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} Whether the API key format is valid
 */
export function isValidApiKeyFormat(apiKey) {
    return typeof apiKey === 'string' && 
           apiKey.startsWith(API_KEY_PREFIX) && 
           apiKey.length === API_KEY_PREFIX.length + 48; // prefix + 48 hex chars
} 