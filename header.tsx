'use client'

import { useProjectStore } from '@/store/project-store'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { 
  Sun, 
  Moon, 
  Monitor, 
  Settings, 
  Save,
  Download,
  Upload
} from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { currentProject, updateSettings, settings } = useProjectStore()
  const { theme, setTheme } = useTheme()
  const [showSettings, setShowSettings] = useState(false)

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    updateSettings({ theme: newTheme as 'light' | 'dark' })
  }

  const handleExport = () => {
    if (!currentProject) return
    
    const dataStr = JSON.stringify(currentProject, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${currentProject.name}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const project = JSON.parse(e.target?.result as string)
            // TODO: Implement project import
            console.log('Import project:', project)
          } catch (error) {
            console.error('Error importing project:', error)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  if (!currentProject) return null

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left side - Project info */}
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-sm font-medium">{currentProject.name}</h2>
              <p className="text-xs text-muted-foreground">
                {currentProject.files.length} files
              </p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={theme === 'light' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 rounded-r-none"
                onClick={() => handleThemeChange('light')}
              >
                <Sun className="h-3 w-3" />
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 rounded-none border-x"
                onClick={() => handleThemeChange('dark')}
              >
                <Moon className="h-3 w-3" />
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 rounded-l-none"
                onClick={() => handleThemeChange('system')}
              >
                <Monitor className="h-3 w-3" />
              </Button>
            </div>

            {/* Import/Export */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
            >
              <Upload className="h-3 w-3 mr-1" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 border rounded-lg bg-card">
            <h3 className="text-sm font-medium mb-3">Project Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm">Autosave</label>
                <input
                  type="checkbox"
                  checked={currentProject.settings.autosave}
                  onChange={(e) => updateSettings({ autosave: e.target.checked })}
                  className="rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
