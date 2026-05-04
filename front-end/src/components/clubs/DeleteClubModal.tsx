import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import './DeleteClubModal.css'

interface DeleteClubModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: () => Promise<void>
  clubName: string
}

export default function DeleteClubModal({
  isOpen,
  onClose,
  onDelete,
  clubName,
}: DeleteClubModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <div className="delete-modal-icon">
          <Trash2 size={24} />
        </div>
        <h2>Delete Club?</h2>
        <p>
          Are you sure you want to delete <strong>{clubName}</strong>? This
          action cannot be undone. All events, tasks, and member data will be
          permanently removed.
        </p>
        <div className="delete-modal-actions">
          <button
            className="delete-modal-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="delete-modal-confirm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Club'}
          </button>
        </div>
      </div>
    </div>
  )
}
