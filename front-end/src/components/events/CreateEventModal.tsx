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

