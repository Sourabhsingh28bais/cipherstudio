import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ProjectFile {
  id: string
  name: string
  content: string
  type: 'file' | 'folder'
  parentId?: string
  children?: ProjectFile[]
}

export interface Project {
  id: string
  name: string
  files: ProjectFile[]
  createdAt: Date
  updatedAt: Date
  settings: {
    theme: 'light' | 'dark'
    autosave: boolean
  }
}

interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  activeFileId: string | null
  isDirty: boolean
  
  // Project actions
  createNewProject: () => string
  loadProject: (id: string) => void
  saveProject: (project: Project) => void
  deleteProject: (id: string) => void
  loadProjects: () => void
  
  // File actions
  createFile: (name: string, content?: string, parentId?: string) => void
  createFolder: (name: string, parentId?: string) => void
  updateFile: (fileId: string, content: string) => void
  deleteFile: (fileId: string) => void
  renameFile: (fileId: string, newName: string) => void
  setActiveFile: (fileId: string | null) => void
  
  // Settings
  updateSettings: (settings: Partial<Project['settings']>) => void
  setDirty: (dirty: boolean) => void
  
  // Autosave
  startAutosave: () => void
  stopAutosave: () => void
}

const defaultFiles: ProjectFile[] = [
  {
    id: '1',
    name: 'App.js',
    content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to CipherStudio!</h1>
        <p>Start editing your React components here.</p>
      </header>
    </div>
  );
}

export default App;`,
    type: 'file'
  },
  {
    id: '2',
    name: 'App.css',
    content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

h1 {
  margin-bottom: 20px;
}

p {
  font-size: 18px;
  opacity: 0.8;
}`,
    type: 'file'
  },
  {
    id: '3',
    name: 'index.js',
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    type: 'file'
  }
]

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      activeFileId: null,
      isDirty: false,

      createNewProject: () => {
        const id = Date.now().toString()
        const newProject: Project = {
          id,
          name: `Project ${id}`,
          files: [...defaultFiles],
          createdAt: new Date(),
          updatedAt: new Date(),
          settings: {
            theme: 'light',
            autosave: true
          }
        }
        
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
          activeFileId: '1', // Set App.js as active
          isDirty: false
        }))
        
        return id
      },

      loadProject: (id: string) => {
        const project = get().projects.find(p => p.id === id)
        if (project) {
          set({
            currentProject: project,
            activeFileId: project.files[0]?.id || null,
            isDirty: false
          })
        }
      },

      saveProject: (project: Project) => {
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === project.id ? { ...project, updatedAt: new Date() } : p
          ),
          currentProject: project,
          isDirty: false
        }))
      },

      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter(p => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
          activeFileId: state.currentProject?.id === id ? null : state.activeFileId
        }))
      },

      loadProjects: () => {
        // This will be called on app initialization
        // The persist middleware handles loading from localStorage
      },

      createFile: (name: string, content = '', parentId?: string) => {
        const { currentProject } = get()
        if (!currentProject) return

        const newFile: ProjectFile = {
          id: Date.now().toString(),
          name,
          content,
          type: 'file',
          parentId
        }

        const updatedProject = {
          ...currentProject,
          files: [...currentProject.files, newFile],
          updatedAt: new Date()
        }

        set({
          currentProject: updatedProject,
          isDirty: true
        })
      },

      createFolder: (name: string, parentId?: string) => {
        const { currentProject } = get()
        if (!currentProject) return

        const newFolder: ProjectFile = {
          id: Date.now().toString(),
          name,
          content: '',
          type: 'folder',
          parentId,
          children: []
        }

        const updatedProject = {
          ...currentProject,
          files: [...currentProject.files, newFolder],
          updatedAt: new Date()
        }

        set({
          currentProject: updatedProject,
          isDirty: true
        })
      },

      updateFile: (fileId: string, content: string) => {
        const { currentProject } = get()
        if (!currentProject) return

        const updatedProject = {
          ...currentProject,
          files: currentProject.files.map(file =>
            file.id === fileId ? { ...file, content } : file
          ),
          updatedAt: new Date()
        }

        set({
          currentProject: updatedProject,
          isDirty: true
        })
      },

      deleteFile: (fileId: string) => {
        const { currentProject } = get()
        if (!currentProject) return

        const updatedProject = {
          ...currentProject,
          files: currentProject.files.filter(file => file.id !== fileId),
          updatedAt: new Date()
        }

        set({
          currentProject: updatedProject,
          activeFileId: get().activeFileId === fileId ? null : get().activeFileId,
          isDirty: true
        })
      },

      renameFile: (fileId: string, newName: string) => {
        const { currentProject } = get()
        if (!currentProject) return

        const updatedProject = {
          ...currentProject,
          files: currentProject.files.map(file =>
            file.id === fileId ? { ...file, name: newName } : file
          ),
          updatedAt: new Date()
        }

        set({
          currentProject: updatedProject,
          isDirty: true
        })
      },

      setActiveFile: (fileId: string | null) => {
        set({ activeFileId: fileId })
      },

      updateSettings: (settings: Partial<Project['settings']>) => {
        const { currentProject } = get()
        if (!currentProject) return

        const updatedProject = {
          ...currentProject,
          settings: { ...currentProject.settings, ...settings },
          updatedAt: new Date()
        }

        set({
          currentProject: updatedProject,
          isDirty: true
        })
      },

      setDirty: (dirty: boolean) => {
        set({ isDirty: dirty })
      },

      startAutosave: () => {
        const { currentProject } = get()
        if (currentProject?.settings.autosave) {
          const interval = setInterval(() => {
            const { currentProject, isDirty } = get()
            if (currentProject && isDirty) {
              get().saveProject(currentProject)
            }
          }, 5000) // Autosave every 5 seconds
          
          // Store interval ID for cleanup
          ;(window as any).autosaveInterval = interval
        }
      },

      stopAutosave: () => {
        const interval = (window as any).autosaveInterval
        if (interval) {
          clearInterval(interval)
          ;(window as any).autosaveInterval = null
        }
      }
    }),
    {
      name: 'cipherstudio-projects',
      partialize: (state) => ({ projects: state.projects })
    }
  )
)
