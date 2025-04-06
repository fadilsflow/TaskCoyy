"use client"

import { useState } from "react"
import { KanbanBoard } from "@/components/kanban-board"
// import { ExplanationSection } from "@/components/explanation-section"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"


export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSettingsClick={() => setIsSettingsOpen(true)} />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <KanbanBoard isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} />
          {/* <ExplanationSection /> */}
        </div>
      </main>
      <Footer />
    </div>
  )
}

