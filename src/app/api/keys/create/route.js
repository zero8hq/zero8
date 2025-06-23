import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { generateApiKey, hashApiKey } from '@/utils/apiKeys';
import { supabase } from '@/utils/supabase';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function POST(request) {
    try {
        // Get the session from NextAuth
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the request body
        const { name = 'Default Key' } = await request.json();

        // Generate new API key with last four characters
        const { apiKey, lastFour } = generateApiKey();
        const keyHash = hashApiKey(apiKey);

        // Store the hashed key in the database
        const { error: insertError } = await supabase
            .from('api_keys')
            .insert({
                user_id: session.user.id,
                key_hash: keyHash,
                last_four: lastFour,
                name: name,
                updated_at: new Date().toISOString()
            });

        if (insertError) {
            console.error('Error creating API key:', insertError);
            return NextResponse.json(
                { error: 'Failed to create API key' },
                { status: 500 }
            );
        }

        // Return the API key (this is the only time it will be shown)
        return NextResponse.json({
            message: 'API key created successfully',
            apiKey: apiKey,
            lastFour: lastFour,
            name: name
        });

    } catch (error) {
        console.error('Error creating API key:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}