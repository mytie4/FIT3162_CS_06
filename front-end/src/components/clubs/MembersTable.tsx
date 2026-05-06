import { useState } from 'react'
import { Mail, Shield, Users, Calendar, MoreHorizontal, Trash2 } from 'lucide-react'
import type { ClubRole, ClubMember } from '../../types/clubs.types'
import './MembersTable.css'

// Re-export for backward compat
export type { ClubRole }
export type Member = ClubMember

interface MembersTableProps {
  members: Member[]
  currentUserRole: ClubRole | null
  onRoleChange?: (userId: string, newRole: ClubRole) => void
  onRemove?: (userId: string) => void
}

const ROLE_LABELS: Record<ClubRole, string> = {
  president: 'President',
  vice_president: 'Vice President',
  member: 'Member',
}

const ROLE_BADGE_CLASS: Record<ClubRole, string> = {
  president: 'role-badge--president',
  vice_president: 'role-badge--vice_president',
  member: 'role-badge--member',
}

export default function MembersTable({
  members,
  currentUserRole,
  onRoleChange,
  onRemove,
}: MembersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const canManage = currentUserRole === 'president' || currentUserRole === 'vice_president'
  const canSeeEmails = currentUserRole === 'president' || currentUserRole === 'vice_president'

  return (
    <div className="members-table-wrapper">
      <table className="members-table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.user_id}>
              <td>
                <div className="member-info">
                  <img
                    src={member.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0f766e&color=fff`}
                    alt={member.name}
                    className="member-avatar"
                  />
                  <div>
                    <p className="member-name">{member.name}</p>
                    {canSeeEmails && (
                      <p className="member-email">
                        <Mail size={12} /> {member.email}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <span className={`role-badge ${ROLE_BADGE_CLASS[member.role]}`}>
                  {member.role === 'president' && <Shield size={10} />}
                  {ROLE_LABELS[member.role]}
                </span>
              </td>
              <td>
                {canManage && (() => {
                  const blockedByVp =
                    currentUserRole === 'vice_president' && member.role === 'president'
                  const blockedTitle = "Only the President can change this member's role"
                  return (
                    <>
                      <button
                        className="member-action-btn"
                        aria-label={`Actions for ${member.name}`}
                        onClick={() => setOpenMenuId(openMenuId === member.user_id ? null : member.user_id)}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openMenuId === member.user_id && (
                        <>
                          <div
                            className="member-action-overlay"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="member-action-menu">
                            <div className="member-action-menu-label">Change Role</div>
                            <button
                              className="member-action-menu-item"
                              disabled={blockedByVp}
                              title={blockedByVp ? blockedTitle : undefined}
                              onClick={() => {
                                onRoleChange?.(member.user_id, 'president')
                                setOpenMenuId(null)
                              }}
                            >
                              <Shield size={14} /> Make President
                            </button>
                            <button
                              className="member-action-menu-item member-action-menu-item--vp"
                              disabled={blockedByVp}
                              title={blockedByVp ? blockedTitle : undefined}
                              onClick={() => {
                                onRoleChange?.(member.user_id, 'vice_president')
                                setOpenMenuId(null)
                              }}
                            >
                              <Calendar size={14} /> Make Vice President
                            </button>
                            <button
                              className="member-action-menu-item member-action-menu-item--member"
                              disabled={blockedByVp}
                              title={blockedByVp ? blockedTitle : undefined}
                              onClick={() => {
                                onRoleChange?.(member.user_id, 'member')
                                setOpenMenuId(null)
                              }}
                            >
                              <Users size={14} /> Make Member
                            </button>
                            <div className="member-action-menu-divider" />
                            <button
                              className="member-action-menu-item member-action-menu-item--danger"
                              disabled={blockedByVp}
                              title={blockedByVp ? blockedTitle : undefined}
                              onClick={() => {
                                onRemove?.(member.user_id)
                                setOpenMenuId(null)
                              }}
                            >
                              <Trash2 size={14} /> Remove from Club
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
