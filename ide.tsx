'use client'

import { useState, useEffect } from 'react'
import { useProjectStore } from '@/store/project-store'
import { FileExplorer } from './file-explorer'
import { CodeEditor } from './code-editor'
import { Preview } from './preview'
import { Header } from './header'
import { ResizeHandle } from './resize-handle'

export function IDE() {
  const { currentProject, activeFileId, setActiveFile, startAutosave, stopAutosave } = useProjectStore()
  const [sidebarWidth, setSidebarWidth] = useState(300)
  const [previewHeight, setPreviewHeight] = useState(400)

  useEffect(() => {
    // Set the first file as active if none is selected
    if (currentProject && !activeFileId && currentProject.files.length > 0) {
      const firstFile = currentProject.files.find(f => f.type === 'file')
      if (firstFile) {
        setActiveFile(firstFile.id)
      }
    }
  }, [currentProject, activeFileId, setActiveFile])

  useEffect(() => {
    // Start autosave when project loads
    if (currentProject?.settings.autosave) {
      startAutosave()
    } else {
      stopAutosave()
    }

    // Cleanup on unmount
    return () => {
      stopAutosave()
    }
  }, [currentProject?.settings.autosave, startAutosave, stopAutosave])

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No project loaded</p>
      </div>
    )
  }

  const activeFile = currentProject.files.find(f => f.id === activeFileId)

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div 
          className="bg-card border-r flex-shrink-0 overflow-hidden"
          style={{ width: sidebarWidth }}
        >
          <FileExplorer />
        </div>

        {/* Resize Handle */}
        <ResizeHandle
          direction="vertical"
          onResize={(delta) => setSidebarWidth(prev => Math.max(200, Math.min(600, prev + delta)))}
        />

        {/* Editor and Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code Editor */}
          <div 
            className="flex-1 overflow-hidden"
            style={{ height: `calc(100% - ${previewHeight}px)` }}
          >
            <CodeEditor file={activeFile} />
          </div>

          {/* Resize Handle */}
          <ResizeHandle
            direction="horizontal"
            onResize={(delta) => setPreviewHeight(prev => Math.max(200, Math.min(600, prev - delta)))}
          />

          {/* Preview */}
          <div 
            className="bg-card border-t overflow-hidden"
            style={{ height: previewHeight }}
          >
            <Preview />
          </div>
        </div>
      </div>
    </div>
  )
}
