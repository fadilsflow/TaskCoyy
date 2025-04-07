import { prisma } from './prisma';

export async function getAllProjects(userId: string) {
    return prisma.project.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

export async function getActiveProject(userId: string) {
    try {
        const project = await prisma.project.findFirst({
            where: {
                userId,
                isActive: true
            }
        });
        return project;
    } catch (error) {
        console.error('Error getting active project:', error);
        throw error;
    }
}

export async function getProjectById(id: string) {
    return prisma.project.findUnique({
        where: {
            id,
        },
    });
}

export async function createProject(title: string, userId: string) {
    return prisma.project.create({
        data: {
            title,
            userId,
        },
    });
}

export async function updateProject(id: string, data: { title?: string; isActive?: boolean }) {
    return prisma.project.update({
        where: {
            id,
        },
        data,
    });
}

export async function deleteProject(id: string) {
    return prisma.project.delete({
        where: {
            id,
        },
    });
}

export async function setActiveProject(id: string, userId: string) {
    // First, deactivate all projects for this user
    await prisma.project.updateMany({
        where: {
            isActive: true,
            userId,
        },
        data: {
            isActive: false,
        },
    });

    // Then, activate the selected project
    return prisma.project.update({
        where: {
            id,
        },
        data: {
            isActive: true,
        },
    });
} 