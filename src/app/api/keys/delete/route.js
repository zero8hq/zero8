import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function DELETE(request) {
    try {
        // Get the key ID from the request URL
        const { searchParams } = new URL(request.url);
        const keyId = searchParams.get('id');
        
        if (!keyId) {
            return NextResponse.json(
                { error: 'API key ID is required' },
                { status: 400 }
            );
        }

        // Get the session from NextAuth
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Use the user ID directly from the session
        const userId = session.user.id;

        // Check if the API key belongs to the user
        const { data: keyData, error: keyError } = await supabase
            .from('api_keys')
            .select('id')
            .eq('id', keyId)
            .eq('user_id', userId)
            .single();

        if (keyError || !keyData) {
            return NextResponse.json(
                { error: 'API key not found or you do not have permission to delete it' },
                { status: 403 }
            );
        }

        // Delete the API key
        const { error: deleteError } = await supabase
            .from('api_keys')
            .delete()
            .eq('id', keyId)
            .eq('user_id', userId); // Double check user_id for extra security

        if (deleteError) {
            console.error('Error deleting API key:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete API key' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'API key deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting API key:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 