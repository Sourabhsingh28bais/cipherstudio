import mongoose, { Document, Schema } from 'mongoose'

export interface IProjectFile {
  id: string
  name: string
  content: string
  type: 'file' | 'folder'
  parentId?: string
  children?: IProjectFile[]
}

export interface IProjectSettings {
  theme: 'light' | 'dark'
  autosave: boolean
}

export interface IProject extends Document {
  _id: string
  name: string
  description?: string
  files: IProjectFile[]
  settings: IProjectSettings
  owner: string
  isPublic: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const ProjectFileSchema = new Schema<IProjectFile>({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['file', 'folder'],
    required: true
  },
  parentId: {
    type: String,
    default: null
  },
  children: [{
    type: Object,
    default: []
  }]
}, { _id: false })

const ProjectSettingsSchema = new Schema<IProjectSettings>({
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  autosave: {
    type: Boolean,
    default: true
  }
}, { _id: false })

const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  files: [ProjectFileSchema],
  settings: {
    type: ProjectSettingsSchema,
    default: () => ({
      theme: 'light',
      autosave: true
    })
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }]
}, {
  timestamps: true
})

// Index for better query performance
ProjectSchema.index({ owner: 1, createdAt: -1 })
ProjectSchema.index({ isPublic: 1, createdAt: -1 })
ProjectSchema.index({ tags: 1 })

// Update the updatedAt field before saving
ProjectSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.model<IProject>('Project', ProjectSchema)
