import { isValidApiKeyFormat, hashApiKey } from '@/utils/apiKeys';
import { supabase } from '@/utils/supabase';

/**
 * Validates an API key and returns minimal validation information
 * @param {string} apiKey - The API key to validate
 * @returns {Promise<Object>} - Object containing validation result
 */
export async function validateApiKey(apiKey) {
  try {
    // Check if API key is provided and has valid format
    if (!apiKey || !isValidApiKeyFormat(apiKey)) {
      return { 
        valid: false, 
        status: 401, 
        error: 'Invalid API key format' 
      };
    }

    // Hash the provided API key
    const keyHash = hashApiKey(apiKey);

    // Check if API key exists and is active
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id, user_id')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      return { 
        valid: false, 
        status: 401, 
        error: 'Invalid or inactive API key' 
      };
    }

    // Update last_used timestamp without blocking the response
    updateKeyUsageTimestamp(keyData.id).catch(error => {
      console.error('Error updating last_used timestamp:', error);
    });

    // Return success with minimal information
    return {
      valid: true,
      keyId: keyData.id,
      userId: keyData.user_id
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { 
      valid: false, 
      status: 500, 
      error: 'Internal server error during API key validation' 
    };
  }
}

/**
 * Updates the last_used timestamp for an API key
 * @param {string} keyId - The ID of the API key
 * @returns {Promise<void>}
 */
async function updateKeyUsageTimestamp(keyId) {
  const timestamp = new Date().toISOString();
  
  const { error } = await supabase
    .from('api_keys')
    .update({ 
      last_used: timestamp,
      updated_at: timestamp
    })
    .eq('id', keyId);
    
  if (error) {
    throw error;
  }
}

/**
 * Higher-order function that wraps an API handler with API key authentication
 * @param {Function} handler - The API route handler function
 * @returns {Function} - Wrapped handler with API key authentication
 */
export function withApiAuth(handler) {
  return async (req, context) => {
    try {
      // Get API key from header
      const apiKey = req.headers.get('x-api-key');
      
      // Validate the API key
      const authResult = await validateApiKey(apiKey);
      
      if (!authResult.valid) {
        return Response.json(
          { error: authResult.error },
          { status: authResult.status }
        );
      }
      
      // Add auth info to the request object for the handler to use
      req.auth = authResult;
      
      // Call the original handler
      return handler(req, context);
    } catch (error) {
      console.error('API authentication error:', error);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
} 