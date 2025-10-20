'use client'

import { useState } from 'react'
import { useProjectStore } from '@/store/project-store'
import { Button } from '@/components/ui/button'
import { 
  File, 
  Folder, 
  FolderOpen, 
  Plus, 
  MoreHorizontal,
  FileText,
  FileCode,
  FileImage,
  Palette
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileTreeItemProps {
  file: any
  level: number
}

function FileTreeItem({ file, level }: FileTreeItemProps) {
  const { activeFileId, setActiveFile, deleteFile, createFile, createFolder } = useProjectStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(file.name)

  const isActive = activeFileId === file.id
  const isFolder = file.type === 'folder'

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <FileCode className="h-4 w-4" />
      case 'css':
        return <Palette className="h-4 w-4" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <FileImage className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded)
    } else {
      setActiveFile(file.id)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteFile(file.id)
  }

  const handleCreateFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    const fileName = prompt('Enter file name:')
    if (fileName) {
      createFile(fileName, '', file.id)
    }
  }

  const handleCreateFolder = (e: React.MouseEvent) => {
    e.stopPropagation()
    const folderName = prompt('Enter folder name:')
    if (folderName) {
      createFolder(folderName, file.id)
    }
  }

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRenaming(true)
  }

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName && newName !== file.name) {
      // TODO: Implement rename functionality
      console.log('Rename file:', file.id, 'to:', newName)
    }
    setIsRenaming(false)
  }

  return (
    <div>
      <div
        className={cn(
          'file-tree-item group',
          isActive && 'active',
          'pl-4'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center gap-2 flex-1">
          {isFolder ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500" />
            )
          ) : (
            getFileIcon(file.name)
          )}
          
          {isRenaming ? (
            <form onSubmit={handleRenameSubmit} className="flex-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-transparent border-none outline-none text-sm flex-1"
                autoFocus
                onBlur={() => setIsRenaming(false)}
              />
            </form>
          ) : (
            <span className="text-sm flex-1 truncate">{file.name}</span>
          )}
        </div>

        {showActions && !isRenaming && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isFolder && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleCreateFile}
                >
                  <File className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleCreateFolder}
                >
                  <Folder className="h-3 w-3" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleRename}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              ×
            </Button>
          </div>
        )}
      </div>

      {/* Children */}
      {isFolder && isExpanded && file.children && (
        <div>
          {file.children.map((child: any) => (
            <FileTreeItem key={child.id} file={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileExplorer() {
  const { currentProject, createFile, createFolder } = useProjectStore()

  if (!currentProject) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground text-sm">No project loaded</p>
      </div>
    )
  }

  const rootFiles = currentProject.files.filter(file => !file.parentId)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Files</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                const fileName = prompt('Enter file name:')
                if (fileName) {
                  createFile(fileName)
                }
              }}
            >
              <File className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                const folderName = prompt('Enter folder name:')
                if (folderName) {
                  createFolder(folderName)
                }
              }}
            >
              <Folder className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto p-2">
        {rootFiles.map((file) => (
          <FileTreeItem key={file.id} file={file} level={0} />
        ))}
      </div>
    </div>
  )
}
