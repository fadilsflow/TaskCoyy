import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getActiveProject } from '@/lib/projects';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const activeProject = await getActiveProject(userId);
        console.log('Active project found:', activeProject);

        return NextResponse.json(activeProject);
    } catch (error) {
        console.error('Error in GET /api/projects/active:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 