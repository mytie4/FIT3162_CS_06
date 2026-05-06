import { useEffect, useRef, useState } from 'react'
import { X, Search, Plus, Mail, Loader2 } from 'lucide-react'
import { searchPlatformUsers, type PlatformUser } from '../../api/users.api'
import './InviteMembersModal.css'

interface InviteMembersModalProps {
  isOpen: boolean
  onClose: () => void
  clubId: string
  clubName: string
  joinCode?: string
  /** Auth token for the search API. */
  token: string
  /** Optional callback fired with the user_ids of selected invitees. */
  onSendInvites?: (userIds: string[]) => Promise<void> | void
}

const SEARCH_DEBOUNCE_MS = 250
const MIN_QUERY_LEN = 2

function avatarFor(user: PlatformUser): string {
  if (user.profile_pic_url) return user.profile_pic_url
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0f766e&color=fff`
}

export default function InviteMembersModal({
  isOpen,
  onClose,
  clubId,
  clubName,
  joinCode,
  token,
  onSendInvites,
}: InviteMembersModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<PlatformUser[]>([])
  const [results, setResults] = useState<PlatformUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Reset transient state whenever the modal is reopened so we don't
  // surface stale results from a previous club.
  useEffect(() => {
    if (!isOpen) return
    setSearchQuery('')
    setSelectedUsers([])
    setResults([])
    setSearchError(null)
  }, [isOpen])

  // Debounced search. Cancels in-flight requests on every keystroke so the
  // dropdown only ever reflects the latest query.
  useEffect(() => {
    if (!isOpen) return

    const trimmed = searchQuery.trim()
    if (trimmed.length < MIN_QUERY_LEN) {
      setResults([])
      setIsSearching(false)
      setSearchError(null)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const handle = window.setTimeout(async () => {
      try {
        setIsSearching(true)
        setSearchError(null)
        const users = await searchPlatformUsers(trimmed, token, {
          excludeClubId: clubId,
          signal: controller.signal,
        })
        if (!controller.signal.aborted) {
          // Hide users already chosen in this session.
          const selectedIds = new Set(selectedUsers.map((u) => u.user_id))
          setResults(users.filter((u) => !selectedIds.has(u.user_id)))
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setSearchError(err instanceof Error ? err.message : 'Search failed')
        setResults([])
      } finally {
        if (!controller.signal.aborted) setIsSearching(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(handle)
      controller.abort()
    }
  }, [searchQuery, isOpen, clubId, token, selectedUsers])

  if (!isOpen) return null

  const handleSelectUser = (user: PlatformUser) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.user_id === user.user_id) ? prev : [...prev, user],
    )
    setSearchQuery('')
    setResults([])
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.user_id !== userId))
  }

  const handleSend = async () => {
    if (!onSendInvites || selectedUsers.length === 0) {
      onClose()
      return
    }

    try {
      setIsSending(true)
      await onSendInvites(selectedUsers.map((u) => u.user_id))
      setSelectedUsers([])
      onClose()
    } catch (err) {
      console.error('Failed to send invites:', err)
      setSearchError(err instanceof Error ? err.message : 'Failed to send invites')
    } finally {
      setIsSending(false)
    }
  }

  const displayCode = joinCode || clubName.substring(0, 4).toUpperCase() + '-2025'
  const trimmedQuery = searchQuery.trim()
  const showDropdown = trimmedQuery.length > 0
  const showTooShortHint = trimmedQuery.length > 0 && trimmedQuery.length < MIN_QUERY_LEN

  return (
    <div className="invite-modal-overlay">
      <div className="invite-modal">
        <div className="invite-modal-header">
          <div>
            <h2>Invite to {clubName}</h2>
            <p>Search for students or share a link.</p>
          </div>
          <button
            className="invite-modal-close"
            onClick={onClose}
            aria-label="Close invite dialog"
          >
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
                aria-label="Copy join code"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(displayCode)
                  } catch {
                    console.warn('Clipboard copy failed')
                  }
                }}
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
                placeholder="Search by name or email..."
                className="invite-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search platform directory"
              />
              {showDropdown && (
                <div className="invite-search-dropdown">
                  {showTooShortHint ? (
                    <div className="invite-search-empty">
                      Type at least {MIN_QUERY_LEN} characters to search.
                    </div>
                  ) : isSearching ? (
                    <div className="invite-search-empty">
                      <Loader2 size={14} className="invite-search-spinner" /> Searching…
                    </div>
                  ) : searchError ? (
                    <div className="invite-search-empty">{searchError}</div>
                  ) : results.length > 0 ? (
                    results.map((user) => (
                      <div
                        key={user.user_id}
                        className="invite-search-result"
                        onClick={() => handleSelectUser(user)}
                      >
                        <img src={avatarFor(user)} alt={user.name} />
                        <div>
                          <p className="invite-search-result-name">{user.name}</p>
                          <p className="invite-search-result-email">{user.email}</p>
                        </div>
                        <Plus size={16} className="invite-search-add-icon" />
                      </div>
                    ))
                  ) : (
                    <div className="invite-search-empty">
                      No users found matching "{trimmedQuery}"
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
                  <div key={user.user_id} className="invite-chip">
                    <img src={avatarFor(user)} alt={user.name} />
                    <span className="invite-chip-name">{user.name}</span>
                    <button
                      className="invite-chip-remove"
                      aria-label={`Remove ${user.name}`}
                      onClick={() => handleRemoveUser(user.user_id)}
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
          <button className="invite-cancel-btn" onClick={onClose} disabled={isSending}>
            Cancel
          </button>
          <button
            className="invite-send-btn"
            disabled={selectedUsers.length === 0 || isSending}
            onClick={handleSend}
          >
            {isSending ? (
              <>
                <Loader2 size={16} className="invite-search-spinner" /> Sending…
              </>
            ) : (
              <>
                <Mail size={16} /> Send Invites
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
