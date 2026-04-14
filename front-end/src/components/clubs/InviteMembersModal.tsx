import { useState } from 'react'
import { X, Search, Plus, Mail } from 'lucide-react'
import './InviteMembersModal.css'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface InviteMembersModalProps {
  isOpen: boolean
  onClose: () => void
  clubName: string
  joinCode?: string
  onSendInvites?: (userIds: string[]) => void
}

// TODO: Replace with real API search
const MOCK_PLATFORM_USERS: User[] = [
  { id: '101', name: 'Alice Smith', email: 'asmith@student.monash.edu', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: '102', name: 'Bob Jones', email: 'bjones@student.monash.edu', avatar: 'https://i.pravatar.cc/150?img=13' },
  { id: '103', name: 'Charlie Brown', email: 'cbrown@student.monash.edu', avatar: 'https://i.pravatar.cc/150?img=33' },
  { id: '104', name: 'Diana Prince', email: 'dprince@student.monash.edu', avatar: 'https://i.pravatar.cc/150?img=41' },
]

export default function InviteMembersModal({
  isOpen,
  onClose,
  clubName,
  joinCode,
  onSendInvites,
}: InviteMembersModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  if (!isOpen) return null

  const searchResults = MOCK_PLATFORM_USERS.filter(
    (user) =>
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !selectedUsers.find((su) => su.id === user.id),
  )

  const handleSelectUser = (user: User) => {
    setSelectedUsers([...selectedUsers, user])
    setSearchQuery('')
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId))
  }

  const handleSend = () => {
    onSendInvites?.(selectedUsers.map((u) => u.id))
    setSelectedUsers([])
    onClose()
  }

  const displayCode = joinCode || clubName.substring(0, 4).toUpperCase() + '-2025'

  return (
    <div className="invite-modal-overlay">
      <div className="invite-modal">
        <div className="invite-modal-header">
          <div>
            <h2>Invite to {clubName}</h2>
            <p>Search for students or share a link.</p>
          </div>
          <button className="invite-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="invite-modal-body">
          {/* Join Code */}
          <div>
            <div className="invite-code-label">Share Join Code</div>
            <div className="invite-code-row">
              <div className="invite-code-display">{displayCode}</div>
              <button
                className="invite-code-copy-btn"
                onClick={() => navigator.clipboard.writeText(displayCode)}
              >
                Copy
              </button>
            </div>
            <p className="invite-code-hint">Anyone with this code can request to join the club.</p>
          </div>

          {/* Divider */}
          <div className="invite-divider">
            <div className="invite-divider-line" />
            <span className="invite-divider-text">OR</span>
            <div className="invite-divider-line" />
          </div>

          {/* Search */}
          <div>
            <div className="invite-code-label">Search Directory</div>
            <div className="invite-search-wrapper">
              <Search className="invite-search-icon" size={16} />
              <input
                type="text"
                placeholder="Search by name or @student.monash.edu..."
                className="invite-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery.length > 0 && (
                <div className="invite-search-dropdown">
                  {searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="invite-search-result"
                        onClick={() => handleSelectUser(user)}
                      >
                        <img src={user.avatar} alt="avatar" />
                        <div>
                          <p className="invite-search-result-name">{user.name}</p>
                          <p className="invite-search-result-email">{user.email}</p>
                        </div>
                        <Plus size={16} className="invite-search-add-icon" />
                      </div>
                    ))
                  ) : (
                    <div className="invite-search-empty">
                      No users found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected chips */}
          {selectedUsers.length > 0 && (
            <div className="invite-selected-area">
              <div className="invite-selected-label">
                Selected to Invite ({selectedUsers.length})
              </div>
              <div className="invite-selected-chips">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="invite-chip">
                    <img src={user.avatar} alt="avatar" />
                    <span className="invite-chip-name">{user.name}</span>
                    <button
                      className="invite-chip-remove"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="invite-modal-footer">
          <button className="invite-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="invite-send-btn"
            disabled={selectedUsers.length === 0}
            onClick={handleSend}
          >
            <Mail size={16} /> Send Invites
          </button>
        </div>
      </div>
    </div>
  )
}
