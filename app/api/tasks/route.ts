import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, getTasksByProjectId, getTasksByColumnId, createTask, updateTask, deleteTask, reorderTasks, moveTaskToColumn } from '@/lib/tasks';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const columnId = searchParams.get('columnId');

        if (projectId) {
            const tasks = await getTasksByProjectId(projectId);
            return NextResponse.json(tasks);
        }

        if (columnId) {
            const tasks = await getTasksByColumnId(columnId);
            return NextResponse.json(tasks);
        }

        const tasks = await getAllTasks();
        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, totalPomodoros, projectId, columnId, position } = body;

        if (!title || !projectId || !columnId || position === undefined) {
            return NextResponse.json({ error: 'Title, project ID, column ID, and position are required' }, { status: 400 });
        }

        const task = await createTask({
            title,
            description: description || '',
            totalPomodoros: totalPomodoros || 1,
            projectId,
            columnId,
            position,
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, taskIds, columnId, position } = body;

        if (taskIds) {
            await reorderTasks(taskIds);
            return NextResponse.json({ success: true });
        }

        if (columnId && position !== undefined) {
            const task = await moveTaskToColumn(id, columnId, position);
            return NextResponse.json(task);
        }

        if (!id) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        const task = await updateTask(id, body);
        return NextResponse.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
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
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        await deleteTask(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
} 