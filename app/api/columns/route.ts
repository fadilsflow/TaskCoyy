import { NextRequest, NextResponse } from 'next/server';
import { getAllColumns, createColumn, updateColumn, deleteColumn, reorderColumns } from '@/lib/columns';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const columns = await getAllColumns();
        return NextResponse.json(columns);
    } catch (error) {
        console.error('Error fetching columns:', error);
        return NextResponse.json({ error: 'Failed to fetch columns' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, position } = body;

        if (!title || position === undefined) {
            return NextResponse.json({ error: 'Title and position are required' }, { status: 400 });
        }

        const column = await createColumn(title, position);
        return NextResponse.json(column);
    } catch (error) {
        console.error('Error creating column:', error);
        return NextResponse.json({ error: 'Failed to create column' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, title, position, columnIds } = body;

        if (columnIds) {
            await reorderColumns(columnIds);
            return NextResponse.json({ success: true });
        }

        if (!id) {
            return NextResponse.json({ error: 'Column ID is required' }, { status: 400 });
        }

        const column = await updateColumn(id, { title, position });
        return NextResponse.json(column);
    } catch (error) {
        console.error('Error updating column:', error);
        return NextResponse.json({ error: 'Failed to update column' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Column ID is required' }, { status: 400 });
        }

        await deleteColumn(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting column:', error);
        return NextResponse.json({ error: 'Failed to delete column' }, { status: 500 });
    }
} 