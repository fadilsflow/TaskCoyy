import { prisma } from './prisma';

export async function getAllColumns() {
    // Pastikan kolom default ada
    await ensureDefaultColumns();

    return prisma.column.findMany({
        orderBy: {
            position: 'asc',
        },
        include: {
            tasks: {
                orderBy: {
                    position: 'asc',
                },
            },
        },
    });
}

export async function getColumnById(id: string) {
    return prisma.column.findUnique({
        where: {
            id,
        },
        include: {
            tasks: {
                orderBy: {
                    position: 'asc',
                },
            },
        },
    });
}

export async function createColumn(title: string, position: number) {
    return prisma.column.create({
        data: {
            title,
            position,
        },
    });
}

export async function updateColumn(id: string, data: { title?: string; position?: number }) {
    return prisma.column.update({
        where: {
            id,
        },
        data,
    });
}

export async function deleteColumn(id: string) {
    return prisma.column.delete({
        where: {
            id,
        },
    });
}

export async function reorderColumns(columnIds: string[]) {
    const updates = columnIds.map((id, index) => {
        return prisma.column.update({
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

// Fungsi untuk memastikan kolom default ada
async function ensureDefaultColumns() {
    const defaultColumns = [
        { title: 'To Do', position: 0 },
        { title: 'In Progress', position: 1 },
        { title: 'Done', position: 2 }
    ];

    // Cek apakah kolom sudah ada
    const existingColumns = await prisma.column.findMany();

    if (existingColumns.length === 0) {
        // Buat kolom default jika belum ada
        for (const column of defaultColumns) {
            await prisma.column.create({
                data: column
            });
        }
        console.log('Default columns created');
    }
} 