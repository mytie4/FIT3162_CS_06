import { LogOut } from 'lucide-react'
import './LeaveClubModal.css'

interface LeaveClubModalProps {
  isOpen: boolean
  onClose: () => void
  onLeave: () => void
  clubName: string
}

export default function LeaveClubModal({
  isOpen,
  onClose,
  onLeave,
  clubName,
}: LeaveClubModalProps) {
  if (!isOpen) return null

  return (
    <div className="leave-modal-overlay">
      <div className="leave-modal">
        <div className="leave-modal-icon">
          <LogOut size={24} />
        </div>
        <h2>Leave Club?</h2>
        <p>
          Are you sure you want to leave <strong>{clubName}</strong>? You will
          lose access to all internal events and tasks.
        </p>
        <div className="leave-modal-actions">
          <button className="leave-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="leave-modal-confirm" onClick={onLeave}>
            Leave Club
          </button>
        </div>
      </div>
    </div>
  )
}
