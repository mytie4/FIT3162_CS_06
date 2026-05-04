import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { createEvent } from '../../api/events.api'
import { getAllClubs } from '../../api/clubs.api'
import type { Event, CreateEvent } from '../../types/events.types'
import type { Club } from '../../types/clubs.types'


const EVENT_TYPES = ['Social', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Networking', 'Fundraiser', 'Other']
const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'private',     label: 'Members Only' },
]

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (event: Event) => void;  // callback to refresh list
  predefinedClubId?: string;             // locks club selector when opened from ClubDetailsPage
}


export default function CreateEventModal({ isOpen, onClose, onCreated, predefinedClubId }: Props) {
  const { token } = useAuth()

  // Form state
  const [title, setTitle]           = useState('')
  const [clubId, setClubId]         = useState(predefinedClubId ?? '')
  const [type, setType]             = useState(EVENT_TYPES[0])
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [startDate, setStartDate]   = useState('')
  const [endDate, setEndDate]       = useState('')
  const [location, setLocation]     = useState('')
  const [bannerUrl, setBannerUrl]   = useState('')
  const [description, setDescription] = useState('')

  // UI state
  const [manageableClubs, setManageableClubs] = useState<Club[]>([])
  const [isLoadingClubs, setIsLoadingClubs]   = useState(false)
  const [isSubmitting, setIsSubmitting]       = useState(false)
  const [isGeneratingAi, setIsGeneratingAi]   = useState(false)
  const [error, setError]                     = useState<string | null>(null)

  // Sync predefinedClubId changes
  useEffect(() => {
    setClubId(predefinedClubId ?? '')
  }, [predefinedClubId])
 
  // Load user's manageable clubs when opened without a predefined club
  useEffect(() => {
    if (!isOpen || predefinedClubId || !token) return
 
    let isMounted = true
    setIsLoadingClubs(true)
 
    getAllClubs(token)
      .then((clubs) => {
        if (isMounted) {
          // getAllClubs already returns only the user's clubs (via getAllClubsForUser on backend)
          // We show all of them — the backend's requireClubRole middleware will enforce
          // president/vice_president at submission time
          setManageableClubs(clubs)
          if (clubs.length > 0 && !clubId) {
            setClubId(clubs[0].club_id)
          }
        }
      })
      .catch(() => {
        if (isMounted) setManageableClubs([])
      })
      .finally(() => {
        if (isMounted) setIsLoadingClubs(false)
      })
 
    return () => { isMounted = false }
  }, [isOpen, predefinedClubId, token])
 
  // Reset form when modal opens
  useEffect(() => {
    if (!isOpen) return
    setTitle('')
    setClubId(predefinedClubId ?? '')
    setType(EVENT_TYPES[0])
    setVisibility('public')
    setStartDate('')
    setEndDate('')
    setLocation('')
    setBannerUrl('')
    setDescription('')
    setError(null)
  }, [isOpen, predefinedClubId])
 
  if (!isOpen) return null
 

}