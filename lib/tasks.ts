import { prisma } from './prisma';

export async function getAllTasks() {
    return prisma.task.findMany({
        orderBy: {
            position: 'asc',
        },
    });
}

export async function getTasksByProjectId(projectId: string) {
    return prisma.task.findMany({
        where: {
            projectId,
        },
        orderBy: {
            position: 'asc',
        },
    });
}

export async function getTasksByColumnId(columnId: string) {
    return prisma.task.findMany({
        where: {
            columnId,
        },
        orderBy: {
            position: 'asc',
        },
    });
}

export async function getTaskById(id: string) {
    return prisma.task.findUnique({
        where: {
            id,
        },
    });
}

export async function createTask(data: {
    title: string;
    description: string;
    totalPomodoros: number;
    projectId: string;
    columnId: string;
    position: number;
}) {
    return prisma.task.create({
        data: {
            ...data,
            isPaused: true,
            isActive: false,
            isBreakTime: false,
            isCompleted: false,
            timerMode: 'pomodoro',
        },
    });
}

export async function updateTask(id: string, data: {
    title?: string;
    description?: string;
    totalPomodoros?: number;
    completedPomodoros?: number;
    isActive?: boolean;
    isPaused?: boolean;
    startTime?: Date | null;
    timerMode?: string;
    isBreakTime?: boolean;
    isCompleted?: boolean;
    columnId?: string;
    position?: number;
}) {
    return prisma.task.update({
        where: {
            id,
        },
        data,
    });
}

export async function deleteTask(id: string) {
    return prisma.task.delete({
        where: {
            id,
        },
    });
}

export async function reorderTasks(taskIds: string[]) {
    const updates = taskIds.map((id, index) => {
        return prisma.task.update({
            where: {
                id,
            },
            data: {
                position: index,
            },
        });
    });

    return prisma.$transaction(updates);
}

export async function moveTaskToColumn(taskId: string, columnId: string, position: number) {
    return prisma.task.update({
        where: {
            id: taskId,
        },
        data: {
            columnId,
            position,
        },
    });
} 