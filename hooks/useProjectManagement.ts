import { useState } from "react"
import { toast } from "sonner"
import { KanbanData, Project } from "@/types/kanban"

export function useProjectManagement(
    data: KanbanData,
    setData: React.Dispatch<React.SetStateAction<KanbanData>>
) {
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
    const [newProjectTitle, setNewProjectTitle] = useState("")
    const [newProjectDescription, setNewProjectDescription] = useState("")

    const handleAddProject = async () => {
        if (!newProjectTitle.trim()) return

        try {
            // Simpan proyek ke database melalui API
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newProjectTitle,
                }),
            });

            if (!response.ok) {
                throw new Error('Gagal menambahkan proyek');
            }

            const newProject = await response.json();

            // Update state lokal
            setData((prevData) => ({
                ...prevData,
                projects: {
                    ...prevData.projects,
                    [newProject.id]: newProject
                }
            }));

            // Set proyek baru sebagai proyek aktif jika belum ada proyek aktif
            if (!data.activeProjectId) {
                handleSetActiveProject(newProject.id);
            }

            setNewProjectTitle("");
            setNewProjectDescription("");
            setIsProjectDialogOpen(false);

            toast.success(`Proyek "${newProjectTitle}" telah ditambahkan.`);
        } catch (error) {
            console.error('Error adding project:', error);
            toast.error('Gagal menambahkan proyek. Silakan coba lagi.');
        }
    };

    const handleEditProject = (projectId: string, updatedFields: Partial<Project>) => {
        setData((prevData) => {
            const updatedProject = {
                ...prevData.projects[projectId],
                ...updatedFields,
                updatedAt: Date.now()
            }

            toast.success(`Proyek "${updatedProject.title}" telah diperbarui.`)

            return {
                ...prevData,
                projects: {
                    ...prevData.projects,
                    [projectId]: updatedProject
                }
            }
        })
    }

    const handleDeleteProject = (projectId: string, confirmationText: string) => {
        // Verifikasi konfirmasi
        if (confirmationText !== "HAPUS PROJEK") {
            toast.error("Konfirmasi tidak sesuai. Ketik 'HAPUS PROJEK' untuk menghapus proyek.")
            return
        }

        // Hapus semua task yang terkait dengan proyek ini
        const updatedTasks = { ...data.tasks }
        Object.keys(updatedTasks).forEach((taskId) => {
            if (updatedTasks[taskId].projectId === projectId) {
                delete updatedTasks[taskId]
            }
        })

        // Hapus task dari kolom
        const updatedColumns = { ...data.columns }
        Object.keys(updatedColumns).forEach((columnId) => {
            updatedColumns[columnId] = {
                ...updatedColumns[columnId],
                taskIds: updatedColumns[columnId].taskIds.filter(
                    (taskId) => updatedTasks[taskId]?.projectId !== projectId
                )
            }
        })

        // Hapus proyek
        const updatedProjects = { ...data.projects }
        delete updatedProjects[projectId]

        // Jika proyek yang dihapus adalah proyek aktif, set activeProjectId menjadi null
        // atau pilih proyek lain jika ada
        let newActiveProjectId = data.activeProjectId
        if (projectId === data.activeProjectId) {
            const remainingProjects = Object.keys(updatedProjects)
            newActiveProjectId = remainingProjects.length > 0 ? remainingProjects[0] : null

            // Aktifkan proyek baru jika ada
            if (newActiveProjectId) {
                updatedProjects[newActiveProjectId] = {
                    ...updatedProjects[newActiveProjectId],
                    isActive: true
                }
            }
        }

        setData({
            ...data,
            tasks: updatedTasks,
            columns: updatedColumns,
            projects: updatedProjects,
            activeProjectId: newActiveProjectId
        })

        toast.success(`Proyek "${data.projects[projectId].title}" telah dihapus.`)
    }

    const handleSetActiveProject = async (projectId: string) => {
        try {
            // Panggil API untuk mengatur proyek aktif
            const response = await fetch('/api/projects', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: projectId,
                    isActive: true,
                }),
            });

            if (!response.ok) {
                throw new Error('Gagal mengatur proyek aktif');
            }

            const updatedProject = await response.json();

            setData((prevData) => {
                // Nonaktifkan proyek yang sedang aktif
                const updatedProjects = { ...prevData.projects };
                if (prevData.activeProjectId) {
                    updatedProjects[prevData.activeProjectId] = {
                        ...updatedProjects[prevData.activeProjectId],
                        isActive: false
                    };
                }

                // Aktifkan proyek baru
                updatedProjects[projectId] = updatedProject;

                return {
                    ...prevData,
                    activeProjectId: projectId,
                    projects: updatedProjects
                };
            });

            toast.success(`Proyek "${updatedProject.title}" sekarang aktif.`);
        } catch (error) {
            console.error('Error setting active project:', error);
            toast.error('Gagal mengatur proyek aktif. Silakan coba lagi.');
        }
    };

    const getActiveProject = () => {
        if (!data.activeProjectId) return null
        return data.projects[data.activeProjectId]
    }

    const getProjectTasks = (projectId: string) => {
        return Object.values(data.tasks).filter(task => task.projectId === projectId)
    }

    return {
        isProjectDialogOpen,
        setIsProjectDialogOpen,
        newProjectTitle,
        setNewProjectTitle,
        newProjectDescription,
        setNewProjectDescription,
        handleAddProject,
        handleEditProject,
        handleDeleteProject,
        handleSetActiveProject,
        getActiveProject,
        getProjectTasks
    }
} 