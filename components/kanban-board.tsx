"use client"

import { useState, useEffect } from "react"
import { DragDropContext } from "@hello-pangea/dnd"
import { KanbanColumn } from "@/components/kanban-column"
import { ActiveTasksTracker } from "@/components/active-tasks-tracker"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { ProjectSelector } from "@/components/project-selector"
import { useTimer } from "@/hooks/useTimer"
import { useDragAndDrop } from "@/hooks/useDragAndDrop"
import { useTaskManagement } from "@/hooks/useTaskManagement"
import { useProjectManagement } from "@/hooks/useProjectManagement"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { KanbanData, Task, TimerSettings, Project, Column } from "@/types/kanban"

interface KanbanBoardProps {
    isSettingsOpen?: boolean;
    setIsSettingsOpen?: (open: boolean) => void;
}

export function KanbanBoard({ isSettingsOpen: externalIsSettingsOpen, setIsSettingsOpen: externalSetIsSettingsOpen }: KanbanBoardProps = {}) {
    const [data, setData] = useState<KanbanData>({
        tasks: {},
        columns: {},
        columnOrder: [],
        projects: {} as Record<string, Project>,
        activeProjectId: null
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [newTaskPomodoros, setNewTaskPomodoros] = useState(2);
    const [activeTasks, setActiveTasks] = useState<Task[]>([]);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [timerSettings, setTimerSettings] = useState<TimerSettings>({
        pomodoroTime: 25 * 60,
        shortBreakTime: 5 * 60,
        longBreakTime: 15 * 60,
        longBreakInterval: 4,
    });
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Use external state if provided
    const effectiveIsSettingsOpen = externalIsSettingsOpen !== undefined ? externalIsSettingsOpen : isSettingsOpen;
    const effectiveSetIsSettingsOpen = externalSetIsSettingsOpen || setIsSettingsOpen;

    // Set isClient to true after component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch projects
                const projectsResponse = await fetch('/api/projects');
                const projectsData: Project[] = await projectsResponse.json();
                console.log('Projects fetched:', projectsData);

                // Convert projects array to object
                const projectsObject: Record<string, Project> = projectsData.reduce((acc, project) => {
                    acc[project.id] = project;
                    return acc;
                }, {} as Record<string, Project>);

                // Fetch active project
                const activeProjectResponse = await fetch('/api/projects/active');
                const activeProjectData = await activeProjectResponse.json();
                console.log('Active project fetched:', activeProjectData);

                // Fetch columns
                const columnsResponse = await fetch('/api/columns');
                const columnsData = await columnsResponse.json();
                console.log('Columns fetched:', columnsData);

                // Fetch tasks for active project
                let tasksData: Record<string, Task> = {};
                if (activeProjectData) {
                    const tasksResponse = await fetch(`/api/tasks?projectId=${activeProjectData.id}`);
                    const tasks = await tasksResponse.json();
                    console.log('Tasks fetched:', tasks);

                    // Convert tasks array to object
                    tasksData = tasks.reduce((acc: Record<string, Task>, task: Task) => {
                        acc[task.id] = task;
                        return acc;
                    }, {});
                }

                // Convert columns array to object
                const columnsObject = columnsData.reduce((acc: Record<string, any>, column: any) => {
                    acc[column.id] = {
                        ...column,
                        taskIds: column.tasks.map((task: any) => task.id)
                    };
                    return acc;
                }, {});

                // Get column order
                const columnOrder = columnsData
                    .sort((a: any, b: any) => a.position - b.position)
                    .map((column: any) => column.id);

                console.log('Setting data with:', {
                    tasksCount: Object.keys(tasksData).length,
                    columnsCount: Object.keys(columnsObject).length,
                    columnOrder,
                    projectsCount: Object.keys(projectsObject).length,
                    activeProjectId: activeProjectData?.id || null
                });

                setData({
                    tasks: tasksData,
                    columns: columnsObject,
                    columnOrder,
                    projects: projectsObject,
                    activeProjectId: activeProjectData?.id || null
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isClient) {
            fetchData();
        }
    }, [isClient]);

    // Update active tasks whenever data changes
    useEffect(() => {
        if (!data.activeProjectId) return;

        const inProgressColumn = Object.values(data.columns).find(col => col.title === 'In Progress');
        if (!inProgressColumn) return;

        const activeTasksList = inProgressColumn.taskIds
            .map((taskId) => data.tasks[taskId])
            .filter((task) => task && task.isActive && task.projectId === data.activeProjectId);

        setActiveTasks(activeTasksList);
    }, [data]);

    const updateTask = (taskId: string, updates: Partial<Task>) => {
        setData((prevData) => ({
            ...prevData,
            tasks: {
                ...prevData.tasks,
                [taskId]: {
                    ...prevData.tasks[taskId],
                    ...updates,
                },
            },
        }));
    };

    const {
        globalTimer,
        globalTimerMode,
        isGlobalTimerPaused,
        isGlobalBreakTime,
        handleGlobalStartPause,
        handleGlobalShortBreak,
        handleGlobalLongBreak,
        handleGlobalPomodoro,
        handleSkipTimer,
    } = useTimer(timerSettings, activeTasks, updateTask);

    const { onDragEnd } = useDragAndDrop(data, setData, globalTimerMode, isGlobalBreakTime);

    const {
        handleAddTask,
        toggleTaskTimer,
        startBreak,
        skipBreak,
        resetTask,
        handleSaveEditedTask,
        completeTask,
    } = useTaskManagement(data, setData);

    const {
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
    } = useProjectManagement(data, setData);

    useLocalStorage(
        isClient,
        data,
        setData,
        timerSettings,
        setTimerSettings,
        globalTimer,
        () => { }, // setGlobalTimer is handled by useTimer
        globalTimerMode,
        () => { }, // setGlobalTimerMode is handled by useTimer
        isGlobalTimerPaused,
        () => { }, // setIsGlobalTimerPaused is handled by useTimer
        isGlobalBreakTime,
        () => { }, // setIsGlobalBreakTime is handled by useTimer
        null, // globalTimerStartTime is handled by useTimer
        () => { } // setGlobalTimerStartTime is handled by useTimer
    );

    const editTask = (taskId: string) => {
        const task = data.tasks[taskId];
        if (task) {
            setEditingTask(task);
            setIsEditDialogOpen(true);
        }
    };

    // Filter tasks by active project
    const getFilteredTasks = (columnId: string) => {
        if (!data.activeProjectId) return [];

        const column = data.columns[columnId];
        if (!column) return [];

        return column.taskIds
            .map(taskId => data.tasks[taskId])
            .filter(task => task && task.projectId === data.activeProjectId);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <ProjectSelector
                    projects={data.projects}
                    activeProjectId={data.activeProjectId}
                    onSetActiveProject={handleSetActiveProject}
                    onAddProject={handleAddProject}
                    onEditProject={handleEditProject}
                    onDeleteProject={handleDeleteProject}
                    isProjectDialogOpen={isProjectDialogOpen}
                    setIsProjectDialogOpen={setIsProjectDialogOpen}
                    newProjectTitle={newProjectTitle}
                    setNewProjectTitle={setNewProjectTitle}
                    newProjectDescription={newProjectDescription}
                    setNewProjectDescription={setNewProjectDescription}
                />

                {data.activeProjectId && (
                    <div className="flex gap-2">
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Task
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex justify-center">
                {isClient && (
                    <ActiveTasksTracker
                        activeTasks={activeTasks}
                        globalTimer={globalTimer}
                        timerSettings={timerSettings}
                        onStartPause={handleGlobalStartPause}
                        onShortBreak={handleGlobalShortBreak}
                        onLongBreak={handleGlobalLongBreak}
                        onPomodoro={handleGlobalPomodoro}
                        onSkipTimer={handleSkipTimer}
                        isPaused={isGlobalTimerPaused}
                        timerMode={globalTimerMode}
                        isBreakTime={isGlobalBreakTime}
                    />
                )}
            </div>

            {data.activeProjectId ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.columnOrder.map((columnId) => {
                            const column = data.columns[columnId];
                            if (!column) return null;

                            const tasks = getFilteredTasks(columnId);
                            const count = tasks.length;

                            return (
                                <KanbanColumn
                                    key={column.id}
                                    column={column}
                                    tasks={tasks}
                                    count={count}
                                    isInProgress={column.title === "In Progress"}
                                    toggleTaskTimer={toggleTaskTimer}
                                    startBreak={startBreak}
                                    skipBreak={skipBreak}
                                    resetTask={resetTask}
                                    editTask={editTask}
                                    completeTask={completeTask}
                                    timerSettings={timerSettings}
                                />
                            );
                        })}
                    </div>
                </DragDropContext>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    <p className="text-lg text-muted-foreground mb-4">Pilih atau buat proyek untuk memulai</p>
                    <Button onClick={() => setIsProjectDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Buat Proyek Baru
                    </Button>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Task Baru</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input
                                id="title"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="Judul task"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                                placeholder="Deskripsi task"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pomodoros">Jumlah Pomodoro</Label>
                            <Input
                                id="pomodoros"
                                type="number"
                                min={1}
                                value={newTaskPomodoros}
                                onChange={(e) => setNewTaskPomodoros(Number.parseInt(e.target.value) || 2)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={async () => {
                            await handleAddTask(newTaskTitle, newTaskDescription, newTaskPomodoros);
                            setIsDialogOpen(false);
                        }}>
                            Tambah Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={effectiveIsSettingsOpen} onOpenChange={effectiveSetIsSettingsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pengaturan Timer</DialogTitle>
                        <DialogDescription>
                            Sesuaikan pengaturan timer Anda di bawah ini.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="pomodoroTime">Waktu Pomodoro (menit)</Label>
                            <Input
                                id="pomodoroTime"
                                type="number"
                                min={1}
                                value={Math.floor(timerSettings.pomodoroTime / 60)}
                                onChange={(e) => setTimerSettings({ ...timerSettings, pomodoroTime: (Number.parseInt(e.target.value) || 1) * 60 })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="shortBreakTime">Waktu Istirahat Pendek (menit)</Label>
                            <Input
                                id="shortBreakTime"
                                type="number"
                                min={1}
                                value={Math.floor(timerSettings.shortBreakTime / 60)}
                                onChange={(e) => setTimerSettings({ ...timerSettings, shortBreakTime: (Number.parseInt(e.target.value) || 1) * 60 })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="longBreakTime">Waktu Istirahat Panjang (menit)</Label>
                            <Input
                                id="longBreakTime"
                                type="number"
                                min={1}
                                value={Math.floor(timerSettings.longBreakTime / 60)}
                                onChange={(e) => setTimerSettings({ ...timerSettings, longBreakTime: (Number.parseInt(e.target.value) || 1) * 60 })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="longBreakInterval">Interval Istirahat Panjang (pomodoros)</Label>
                            <Input
                                id="longBreakInterval"
                                type="number"
                                min={1}
                                value={timerSettings.longBreakInterval}
                                onChange={(e) => setTimerSettings({ ...timerSettings, longBreakInterval: Number.parseInt(e.target.value) || 1 })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => effectiveSetIsSettingsOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={() => {
                            effectiveSetIsSettingsOpen(false)
                        }}>Simpan Pengaturan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EditTaskDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                task={editingTask}
                onSave={(updatedFields) => {
                    if (editingTask) {
                        handleSaveEditedTask(editingTask.id, updatedFields)
                    }
                }}
            />
        </div>
    )
}

