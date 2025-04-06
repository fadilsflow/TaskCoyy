"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Task } from "@/components/kanban-board"

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onSave: (updatedTask: Partial<Task>) => void
}

export function EditTaskDialog({ open, onOpenChange, task, onSave }: EditTaskDialogProps) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [totalPomodoros, setTotalPomodoros] = useState(task?.totalPomodoros || 2)

  // Update state when task changes
  useState(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setTotalPomodoros(task.totalPomodoros)
    }
  })

  const handleSave = () => {
    if (!title.trim()) return

    onSave({
      title,
      description,
      totalPomodoros,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-pomodoros">Number of Pomodoros</Label>
            <Input
              id="edit-pomodoros"
              type="number"
              min={1}
              value={totalPomodoros}
              onChange={(e) => setTotalPomodoros(Number.parseInt(e.target.value) || 2)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

