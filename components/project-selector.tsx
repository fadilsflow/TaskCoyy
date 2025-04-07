import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Plus, Edit, Trash, Check } from "lucide-react"
import { Project } from "@/types/kanban"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

interface ProjectSelectorProps {
    projects: Record<string, Project>
    activeProjectId: string | null
    onSetActiveProject: (projectId: string) => void
    onAddProject: () => void
    onEditProject: (projectId: string, updatedFields: Partial<Project>) => void
    onDeleteProject: (projectId: string, confirmationText: string) => void
    isProjectDialogOpen: boolean
    setIsProjectDialogOpen: (open: boolean) => void
    newProjectTitle: string
    setNewProjectTitle: (title: string) => void
    newProjectDescription: string
    setNewProjectDescription: (description: string) => void
}

export function ProjectSelector({
    projects,
    activeProjectId,
    onSetActiveProject,
    onAddProject,
    onEditProject,
    onDeleteProject,
    isProjectDialogOpen,
    setIsProjectDialogOpen,
    newProjectTitle,
    setNewProjectTitle,
    newProjectDescription,
    setNewProjectDescription
}: ProjectSelectorProps) {
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState("")
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

    const activeProject = activeProjectId ? projects[activeProjectId] : null

    const handleEditProject = (project: Project) => {
        setEditingProject(project)
        setIsEditDialogOpen(true)
    }

    const handleSaveEdit = (updatedFields: Partial<Project>) => {
        if (editingProject) {
            onEditProject(editingProject.id, updatedFields)
            setIsEditDialogOpen(false)
            setEditingProject(null)
        }
    }

    const handleDeleteClick = (projectId: string) => {
        setProjectToDelete(projectId)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (projectToDelete) {
            onDeleteProject(projectToDelete, deleteConfirmation)
            setIsDeleteDialogOpen(false)
            setDeleteConfirmation("")
            setProjectToDelete(null)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        {activeProject ? activeProject.title : "Pilih Proyek"}
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    {Object.values(projects).map((project) => (
                        <DropdownMenuItem
                            key={project.id}
                            className="flex items-center justify-between"
                            onClick={() => onSetActiveProject(project.id)}
                        >
                            <span>{project.title}</span>
                            {project.id === activeProjectId && (
                                <Check className="h-4 w-4" />
                            )}
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem
                        className="flex items-center gap-2 text-primary"
                        onClick={() => setIsProjectDialogOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Proyek</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {activeProject && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="flex items-center gap-2"
                            onClick={() => handleEditProject(activeProject)}
                        >
                            <Edit className="h-4 w-4" />
                            <span>Edit Proyek</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex items-center gap-2 text-destructive"
                            onClick={() => handleDeleteClick(activeProject.id)}
                        >
                            <Trash className="h-4 w-4" />
                            <span>Hapus Proyek</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Dialog untuk menambah proyek baru */}
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Proyek Baru</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="project-title">Judul Proyek</Label>
                            <Input
                                id="project-title"
                                value={newProjectTitle}
                                onChange={(e) => setNewProjectTitle(e.target.value)}
                                placeholder="Masukkan judul proyek"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={onAddProject}>Tambah Proyek</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog untuk mengedit proyek */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Proyek</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-project-title">Judul Proyek</Label>
                            <Input
                                id="edit-project-title"
                                value={editingProject?.title || ""}
                                onChange={(e) => setEditingProject(prev => prev ? { ...prev, title: e.target.value } : null)}
                                placeholder="Masukkan judul proyek"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => handleSaveEdit({
                            title: editingProject?.title
                        })}>
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog untuk konfirmasi penghapusan proyek */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Hapus Proyek</DialogTitle>
                        <DialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Semua task dalam proyek ini akan dihapus.
                            Ketik <span className="font-bold">HAPUS PROJEK</span> untuk mengkonfirmasi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="delete-confirmation">Konfirmasi</Label>
                            <Input
                                id="delete-confirmation"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="Ketik HAPUS PROJEK"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={deleteConfirmation !== "HAPUS PROJEK"}
                        >
                            Hapus Proyek
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 