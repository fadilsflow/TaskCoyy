"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TimerSettings } from "@/components/kanban-board"
import { Clock, TimerReset } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: TimerSettings
  onSave: (settings: TimerSettings) => void
}

export function SettingsDialog({ open, onOpenChange, settings, onSave }: SettingsDialogProps) {
  const [pomodoroMinutes, setPomodoroMinutes] = useState(Math.floor(settings.pomodoroTime / 60))
  const [shortBreakMinutes, setShortBreakMinutes] = useState(Math.floor(settings.shortBreakTime / 60))
  const [longBreakMinutes, setLongBreakMinutes] = useState(Math.floor(settings.longBreakTime / 60))

  const handleSave = () => {
    onSave({
      pomodoroTime: pomodoroMinutes * 60,
      shortBreakTime: shortBreakMinutes * 60,
      longBreakTime: longBreakMinutes * 60,
    })
  }

  const handleReset = () => {
    setPomodoroMinutes(25)
    setShortBreakMinutes(5)
    setLongBreakMinutes(15)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timer Settings
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="pomodoro-time" className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              Pomodoro (minutes)
            </Label>
            <Input
              id="pomodoro-time"
              type="number"
              min={1}
              max={60}
              value={pomodoroMinutes}
              onChange={(e) => setPomodoroMinutes(Number.parseInt(e.target.value) || 25)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="short-break-time" className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              Short Break (minutes)
            </Label>
            <Input
              id="short-break-time"
              type="number"
              min={1}
              max={30}
              value={shortBreakMinutes}
              onChange={(e) => setShortBreakMinutes(Number.parseInt(e.target.value) || 5)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="long-break-time" className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-secondary"></div>
              Long Break (minutes)
            </Label>
            <Input
              id="long-break-time"
              type="number"
              min={1}
              max={60}
              value={longBreakMinutes}
              onChange={(e) => setLongBreakMinutes(Number.parseInt(e.target.value) || 15)}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleReset} type="button">
            <TimerReset className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

