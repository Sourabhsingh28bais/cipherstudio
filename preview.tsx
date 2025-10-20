'use client'

import { Sandpack } from '@codesandbox/sandpack-react'
import { useProjectStore } from '@/store/project-store'
import { useTheme } from 'next-themes'
import { Play, Square, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function Preview() {
  const { currentProject } = useProjectStore()
  const { theme } = useTheme()
  const [isRunning, setIsRunning] = useState(true)

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No project loaded</p>
      </div>
    )
  }

  // Convert project files to Sandpack format
  const files = currentProject.files.reduce((acc, file) => {
    if (file.type === 'file') {
      acc[`/${file.name}`] = {
        code: file.content,
        readOnly: false
      }
    }
    return acc
  }, {} as Record<string, any>)

  // Find the main entry point
  const entryFile = currentProject.files.find(f => 
    f.name === 'index.js' || f.name === 'index.jsx' || f.name === 'App.js'
  )

  const handleRestart = () => {
    setIsRunning(false)
    setTimeout(() => setIsRunning(true), 100)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Preview</h3>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleRestart}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Sandpack Preview */}
      <div className="flex-1">
        {isRunning && (
          <Sandpack
            template="react"
            theme={theme === 'dark' ? 'dark' : 'light'}
            files={files}
            options={{
              showNavigator: false,
              showRefreshButton: false,
              showInlineErrors: true,
              showConsoleButton: true,
              showConsole: false,
              showTabs: false,
              closableTabs: false,
              initMode: 'lazy',
              bundlerURL: 'https://bundler.ecmascript.org/',
              logLevel: 'error'
            }}
            customSetup={{
              dependencies: {
                'react': '^18.2.0',
                'react-dom': '^18.2.0'
              }
            }}
            style={{
              height: '100%',
              width: '100%'
            }}
          />
        )}
      </div>
    </div>
  )
}
