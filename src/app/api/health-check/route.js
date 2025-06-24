import { NextResponse } from 'next/server';
import { withApiAuth } from '@/utils/apiAuth';

/**
 * API Health Check endpoint
 * Validates API key and returns health status
 */
async function handleGet(req) {
  // Auth data is available in req.auth
  const { keyId, userId } = req.auth;
  
  return NextResponse.json({
    status: 'healthy',
    api_version: '1.0',
    authenticated: true,
    timestamp: new Date().toISOString(),
    // Include minimal auth info for verification purposes
    auth: {
      keyId,
      userId
    }
  });
}

// Export the handler with API key authentication
export const GET = withApiAuth(handleGet);