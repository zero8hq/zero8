import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET() {
    try {
        // Get the session using authOptions
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Use the user ID directly from the session
        const userId = session.user.id;

        // Fetch API keys for this user
        const { data: apiKeys, error } = await supabase
            .from('api_keys')
            .select(`
                id,
                name,
                last_four,
                created_at,
                last_used,
                is_active
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching API keys:', error);
            return NextResponse.json(
                { error: 'Failed to fetch API keys' },
                { status: 500 }
            );
        }

        return NextResponse.json({ apiKeys });

    } catch (error) {
        console.error('Error in API keys route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 