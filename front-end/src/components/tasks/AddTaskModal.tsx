import { useState } from 'react'
import { X } from 'lucide-react'
import './AddTaskModal.css'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (taskData: TaskFormData) => void
}

export interface TaskFormData {
  title: string
  description: string
  status: string
  dueDate: string
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
]

export default function AddTaskModal({ isOpen, onClose, onSubmit }: AddTaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: STATUS_OPTIONS[0].value,
    dueDate: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async () => {
    setError(null)

    if (!formData.title.trim()) {
      setError('Task title is required.')
      return
    }

    setIsSubmitting(true)
    try {
      onSubmit?.(formData)
      setFormData({
        title: '',
        description: '',
        status: STATUS_OPTIONS[0].value,
        dueDate: '',
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose()
  }

  return (
    <div className="atm-overlay" onClick={handleOverlayClick}>
      <div className="atm-card" role="dialog" aria-modal="true" aria-labelledby="atm-title">
        
        {/* Header */}
        <div className="atm-header">
          <h2 className="atm-title" id="atm-title">Add New Task</h2>
          <button
            className="atm-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="atm-body">
          
          {/* Task Title */}
          <div className="atm-field">
            <label className="atm-label" htmlFor="atm-title-input">
              Task Title <span className="atm-required">*</span>
            </label>
            <input
              id="atm-title-input"
              className="atm-input"
              type="text"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="atm-field">
            <label className="atm-label" htmlFor="atm-description">
              Description <span className="atm-label-hint">(optional)</span>
            </label>
            <textarea
              id="atm-description"
              className="atm-textarea"
              placeholder="Add details, instructions, etc."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={isSubmitting}
              rows={4}
            />
          </div>

          <div className="atm-field">
            <label className="atm-label" htmlFor="atm-status-select">
              Column / Status
            </label>
            <select
              id="atm-status-select"
              className="atm-select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              disabled={isSubmitting}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="atm-field">
            <label className="atm-label" htmlFor="atm-due-date">
              Due Date <span className="atm-label-hint">(optional)</span>
            </label>
            <input
              id="atm-due-date"
              className="atm-input"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Error */}
          {error && <div className="atm-error">{error}</div>}

        </div>

        {/* Footer */}
        <div className="atm-footer">
          <button
            className="atm-cancel-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="atm-submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </button>
        </div>

      </div>
    </div>
  )
}
