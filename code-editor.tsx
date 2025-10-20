'use client'

import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useProjectStore } from '@/store/project-store'
import { useTheme } from 'next-themes'

interface CodeEditorProps {
  file: any
}

export function CodeEditor({ file }: CodeEditorProps) {
  const { updateFile } = useProjectStore()
  const { theme } = useTheme()
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 1.5,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      tabSize: 2,
      insertSpaces: true,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      }
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save functionality will be handled by the parent component
      console.log('Save triggered')
    })
  }

  const handleEditorChange = (value: string | undefined) => {
    if (file && value !== undefined) {
      updateFile(file.id, value)
    }
  }

  const getLanguage = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript'
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'css':
        return 'css'
      case 'html':
        return 'html'
      case 'json':
        return 'json'
      case 'md':
        return 'markdown'
      default:
        return 'javascript'
    }
  }

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No file selected</p>
          <p className="text-sm text-muted-foreground">
            Select a file from the explorer to start editing
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{file.name}</span>
          <span className="text-xs text-muted-foreground">
            {getLanguage(file.name)}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {file.content.length} characters
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(file.name)}
          value={file.content}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            fontLigatures: true,
            fontFamily: "'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, 'Roboto Mono', Consolas, 'Courier New', monospace"
          }}
        />
      </div>
    </div>
  )
}
