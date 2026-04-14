import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CheckSquare, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  MoreHorizontal,
  Bell,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ArrowUpDown,
  UserPlus,
  Edit,
  Sparkles,
  X,
  Image as ImageIcon,
  CalendarCheck2,
  ArrowLeft,
  Mail,
  Shield,
  Trash2,
  Globe,
  Instagram,
  MessageSquare,
  CheckCircle2,
  Paperclip,
  MoreVertical,
  ListFilter,
  FileText,
  Download,
  DollarSign,
  PieChart,
  AlignLeft,
  File,
  ExternalLink,
  Folder,
  Check,
  LogOut
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_USER = {
  name: "Quan",
  avatar: "https://i.pravatar.cc/150?img=11"
};

const MOCK_EVENTS = [
  {
    id: 1, title: "Annual Tech Summit 2025", club: "Monash Tech Club", date: "Nov 12-14, 2025",
    location: "Caulfield Campus, Building H", status: "In Progress", attendees: 124,
    color: "bg-blue-500", badge: "bg-blue-100 text-blue-700"
  },
  {
    id: 2, title: "End of Year Gala", club: "Business Society", date: "Dec 5, 2025",
    location: "Crown Palladium", status: "Planning", attendees: 350,
    color: "bg-purple-500", badge: "bg-purple-100 text-purple-700"
  },
  {
    id: 3, title: "Code to Create Hackathon", club: "Monash Tech Club", date: "Oct 20, 2025",
    location: "Clayton Woodside Building", status: "Published", attendees: 85,
    color: "bg-teal-500", badge: "bg-teal-100 text-teal-700"
  },
  {
    id: 4, title: "Weekly Chess Meetup", club: "Monash Chess Club", date: "Every Thursday",
    location: "Campus Center, Level 2", status: "Ongoing", attendees: 24,
    color: "bg-orange-500", badge: "bg-orange-100 text-orange-700"
  }
];

const MOCK_TASKS = [
  { id: 101, title: "Finalize stage, booth, and seating arrangement", event: "Annual Tech Summit", due: "Oct 15", priority: "High", color: "border-red-400" },
  { id: 102, title: "Send reminder to registered attendees", event: "End of Year Gala", due: "Nov 1", priority: "Medium", color: "border-yellow-400" },
  { id: 103, title: "Catering order confirmation", event: "Annual Tech Summit", due: "Oct 25", priority: "High", color: "border-red-400" },
  { id: 104, title: "Design badges for speakers", event: "Code to Create Hackathon", due: "Oct 10", priority: "Low", color: "border-green-400" },
];

const MOCK_CLUBS = [
  { id: 1, name: "Monash Tech Club", type: "Technology", banner: "bg-[#0f172a]", event: "Annual Tech Summit 2025", members: "124", badgeColors: "bg-blue-100 text-blue-600", isLogo: true, socials: { discord: "https://discord.gg/example", instagram: "https://instagram.com/example", website: "https://monashtech.club" } },
  { id: 2, name: "Business Society", type: "Academic", banner: "bg-blue-600", event: "End of Year Gala", members: "350", badgeColors: "bg-indigo-100 text-indigo-600", socials: { instagram: "https://instagram.com/example" } },
  { id: 3, name: "MEGA", type: "Hobby", banner: "bg-[#2d1b4e]", event: "Ongoing event name", members: "45", badgeColors: "bg-orange-100 text-orange-600", isLogo: true, socials: { discord: "https://discord.gg/example" } },
  { id: 4, name: "Monash Chess Club", type: "Social", banner: "bg-amber-700", event: "Weekly Chess Meetup", members: "24", badgeColors: "bg-orange-100 text-orange-800" },
  { id: 5, name: "Monash Thai Club", type: "Cultural", banner: "bg-blue-50", event: "Welcome Dinner", members: "80", badgeColors: "bg-red-100 text-red-600", isLogoPattern: true },
  { id: 6, name: "Data Science Society", type: "Academic", banner: "bg-purple-600", event: "Python Workshop", members: "112", badgeColors: "bg-purple-100 text-purple-600" },
  { id: 7, name: "Debating Society", type: "Social", banner: "bg-emerald-600", event: "Inter-uni Tournament", members: "55", badgeColors: "bg-emerald-100 text-emerald-600" },
  { id: 8, name: "Robotics Club", type: "Technology", banner: "bg-slate-700", event: "Robot Wars 2025", members: "40", badgeColors: "bg-blue-100 text-blue-600" },
];

const MOCK_MEMBERS = [
  { id: 1, name: "Quan", role: "Admin", email: "quan@student.monash.edu", avatar: "https://i.pravatar.cc/150?img=11", joined: "Mar 2024" },
  { id: 2, name: "Sarah Connor", role: "Event Manager", email: "sconnor@student.monash.edu", avatar: "https://i.pravatar.cc/150?img=5", joined: "Apr 2024" },
  { id: 3, name: "David Chen", role: "Member", email: "dchen@student.monash.edu", avatar: "https://i.pravatar.cc/150?img=12", joined: "Jul 2024" },
  { id: 4, name: "Emily Rogers", role: "Member", email: "erogers@student.monash.edu", avatar: "https://i.pravatar.cc/150?img=9", joined: "Aug 2024" },
  { id: 5, name: "Michael Chang", role: "Member", email: "mchang@student.monash.edu", avatar: "https://i.pravatar.cc/150?img=14", joined: "Sep 2024" },
];

const MOCK_PLATFORM_USERS = [
  { id: 101, name: "Alice Smith", email: "asmith@student.monash.edu", avatar: "https://i.pravatar.cc/150?img=47" },
  { id: 102, name: "Bob Jones", email: "bjones@student.monash.edu", avatar: "https://i.pravatar.cc/150?img=13" },
  { id: 103, name: "Charlie Brown", email: "cbrown@student.monash.edu", avatar: "https://i.pravatar.cc/150?img=33" },
  { id: 104, name: "Diana Prince", email: "dprince@student.monash.edu", avatar: "https://i.pravatar.cc/150?img=41" },
];

const MOCK_KANBAN = {
  backlog: [
    { id: 1, tag: "Design", tagColor: "bg-purple-100 text-purple-700", title: "Event banner & social assets", desc: "Create banner for all social media platforms", avatars: ["11", "5"], due: "Oct 20", colorMark: "bg-purple-500" },
    { id: 2, tag: "Finance", tagColor: "bg-orange-100 text-orange-700", title: "Sponsorship proposal deck", desc: "Prepare slide deck for potential sponsors", avatars: ["12"], due: "Oct 15", colorMark: "bg-orange-500" },
    { id: 3, tag: "Operations", tagColor: "bg-pink-100 text-pink-700", title: "Volunteer onboarding guide", desc: "Document roles & responsibilities for day-of volunteers", avatars: ["14", "9"], due: "Oct 25", colorMark: "bg-pink-500", progress: "0 3" },
    { id: 4, tag: "Tech", tagColor: "bg-blue-100 text-blue-700", title: "Registration form QR codes", desc: "Generate QR for check-in stations", avatars: ["11"], colorMark: "bg-blue-500" }
  ],
  inProgress: [
    { id: 5, tag: "Logistics", tagColor: "bg-green-100 text-green-700", title: "Venue floor plan & layout", desc: "Finalize stage, booth, and seating arrangement", avatars: ["5"], due: "2 3", colorMark: "bg-green-500" },
    { id: 6, tag: "Marketing", tagColor: "bg-red-100 text-red-700", title: "Email campaign - Week 2", desc: "Send reminder to registered attendees", avatars: ["9"], due: "Nov 1", colorMark: "bg-red-500", progress: "15 Nov" },
    { id: 7, tag: "Tech", tagColor: "bg-blue-100 text-blue-700", title: "Livestream setup & testing", desc: "Configure OBS, cameras, and streaming to YouTube", avatars: ["11", "12"], due: "1 5", colorMark: "bg-blue-500" },
    { id: 8, tag: "Logistics", tagColor: "bg-green-100 text-green-700", title: "Catering order confirmation", desc: "Confirm dietary requirements & quantities", avatars: ["14"], colorMark: "bg-orange-500" },
    { id: 9, tag: "Design", tagColor: "bg-purple-100 text-purple-700", title: "Name badge & lanyard design", desc: "Design badges for speakers, attendees, staff", avatars: ["5", "11"], colorMark: "bg-green-500" }
  ],
  review: [
    { id: 10, tag: "Marketing", tagColor: "bg-red-100 text-red-700", title: "Speaker announcement posts", desc: "4 posts ready for approval before publishing", avatars: ["9"], due: "0 2", colorMark: "bg-green-500" },
    { id: 11, tag: "Finance", tagColor: "bg-orange-100 text-orange-700", title: "Budget reconciliation - Q3", desc: "Awaiting treasurer sign-off", avatars: ["12"], colorMark: "bg-red-500" },
    { id: 12, tag: "Tech", tagColor: "bg-blue-100 text-blue-700", title: "Eventure event page publish", desc: "Final check of event page copy and links", avatars: ["11"], due: "0 1", colorMark: "bg-orange-500" }
  ],
  done: [
    { id: 13, tag: "Logistics", tagColor: "bg-green-100 text-green-700", title: "Venue booking confirmed", avatars: ["5"], done: true },
    { id: 14, tag: "Marketing", tagColor: "bg-red-100 text-red-700", title: "Event page copy written", avatars: ["9"], done: true },
    { id: 15, tag: "Tech", tagColor: "bg-blue-100 text-blue-700", title: "Registration system setup", avatars: ["11", "12"], done: true },
    { id: 16, tag: "Design", tagColor: "bg-purple-100 text-purple-700", title: "Logo & branding kit", avatars: ["5"], done: true },
    { id: 17, tag: "Finance", tagColor: "bg-orange-100 text-orange-700", title: "Initial budget approved", avatars: ["12"], done: true },
    { id: 18, tag: "Operations", tagColor: "bg-pink-100 text-pink-700", title: "Speaker invites sent", avatars: ["14"], done: true }
  ]
};

const MOCK_BUDGET = [
  { id: 1, item: "Venue Booking", category: "Logistics", amount: 1500, status: "Paid", date: "Oct 1" },
  { id: 2, item: "Catering Deposit", category: "Logistics", amount: 800, status: "Paid", date: "Oct 5" },
  { id: 3, item: "Social Media Ads", category: "Marketing", amount: 300, status: "Pending", date: "Oct 15" },
  { id: 4, item: "Lanyards & Badges", category: "Design", amount: 250, status: "Pending", date: "Oct 18" }
];

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'invite', sender: 'Sarah Connor', club: 'Data Science Society', time: '10 mins ago', read: false },
  { id: 2, type: 'task', title: 'Upload venue floorplan', event: 'Annual Tech Summit 2025', time: '2 hours ago', read: false },
  { id: 3, type: 'reminder', title: 'Event reminder: Weekly Chess Meetup starts in 1 hour', time: '1 day ago', read: true },
  { id: 4, type: 'task', title: 'Finalize catering budget', event: 'End of Year Gala', time: '2 days ago', read: true },
  { id: 5, type: 'invite', sender: 'Quan', club: 'Monash Tech Club', time: '3 days ago', read: true },
];

// --- COMPONENTS ---

const BrandLogo = () => (
  <div className="flex items-center gap-2 px-6 py-8">
    <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
      E
    </div>
    <span className="text-white font-bold text-xl tracking-wide">Eventure</span>
  </div>
);

const Sidebar = ({ activePage, setActivePage }) => {
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clubs', label: 'Clubs', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  ];

  return (
    <aside className="w-[260px] bg-[#0a3d3d] flex flex-col h-screen fixed left-0 top-0 text-white z-20">
      <BrandLogo />
      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                isActive 
                  ? 'bg-[#155758] text-white shadow-sm' 
                  : 'text-teal-100 hover:bg-[#114a4a] hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-teal-400' : 'opacity-70'} />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-[#155758]">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <img src={MOCK_USER.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-teal-500" />
          <div className="text-left">
            <p className="text-sm font-semibold">{MOCK_USER.name}</p>
            <p className="text-xs text-teal-200">Monash University</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

// --- MODALS ---

const CreateClubModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({ name: '', type: 'Social', description: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateDescription = async () => {
    if (!formData.name) return;
    setIsGenerating(true);
    
    // Gemini API Setup
    const apiKey = ""; 
    const prompt = `Write a short, engaging description (max 2 sentences) for a university student club named "${formData.name}" of type "${formData.type}". Make it sound welcoming.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: "You are a helpful assistant writing catchy university club descriptions." }] }
        })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        setFormData(prev => ({ ...prev, description: text }));
      }
    } catch (error) {
      console.error("Error generating text:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Create a Club</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
            <input 
              type="text" 
              placeholder="Enter name" 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-600"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
            <select 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-600"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option>Social</option>
              <option>Academic</option>
              <option>Cultural</option>
              <option>Fitness</option>
              <option>Hobby</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Add members</label>
            <div className="border border-gray-200 rounded-lg px-3 py-2 flex gap-2">
              <span className="bg-gray-100 text-xs px-2 py-1 rounded flex items-center gap-1">New Member 1 <X size={12}/></span>
              <span className="bg-gray-100 text-xs px-2 py-1 rounded flex items-center gap-1">Jane Doe <X size={12}/></span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Set banner</label>
            <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
              <Plus className="text-gray-500" />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-600">Description</label>
              <button 
                onClick={handleGenerateDescription}
                disabled={!formData.name || isGenerating}
                className="text-xs text-teal-600 flex items-center gap-1 hover:text-teal-700 disabled:opacity-50"
              >
                <Sparkles size={12} />
                {isGenerating ? "Generating..." : "Generate with AI"}
              </button>
            </div>
            <textarea 
              rows={3} 
              placeholder="Enter description" 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-600"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={() => onCreate(formData)}
            className="bg-[#1a6b6e] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#155758] transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

const JoinClubModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-center p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Join a club with a code</h2>
        <input 
          type="text" 
          placeholder="Enter join code" 
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-600 mb-4 text-center tracking-widest uppercase"
        />
        <button className="w-full bg-[#1a6b6e] text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-[#155758] transition-colors">
          Join Club
        </button>
      </div>
    </div>
  );
}

const InviteMembersModal = ({ isOpen, onClose, clubName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  if (!isOpen) return null;

  // Filter out users that are already selected
  const searchResults = MOCK_PLATFORM_USERS.filter(user => 
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
    !selectedUsers.find(su => su.id === user.id)
  );

  const handleSelectUser = (user) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchQuery('');
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Invite to {clubName}</h2>
            <p className="text-xs text-gray-500">Search for students or share a link.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-white p-1.5 rounded-md border border-gray-200 shadow-sm"><X size={18}/></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Share Link Section */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Share Join Code</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-700 tracking-widest text-center font-bold">
                {clubName.substring(0, 4).toUpperCase()}-2025
              </div>
              <button className="bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Copy
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">Anyone with this code can request to join the club.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs font-semibold text-gray-400 uppercase">OR</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* Database Search Section */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Directory</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by name or @student.monash.edu..." 
                className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {/* Search Dropdown */}
              {searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(user => (
                      <div 
                        key={user.id} 
                        onClick={() => handleSelectUser(user)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0"
                      >
                        <img src={user.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Plus size={16} className="ml-auto text-teal-600" />
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">No users found matching "{searchQuery}"</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Users Chips */}
          {selectedUsers.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Selected to Invite ({selectedUsers.length})</label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div key={user.id} className="bg-white border border-gray-200 rounded-full pl-1 pr-3 py-1 flex items-center gap-2 shadow-sm">
                    <img src={user.avatar} className="w-6 h-6 rounded-full" alt="avatar" />
                    <span className="text-xs font-semibold text-gray-700">{user.name}</span>
                    <button onClick={() => handleRemoveUser(user.id)} className="text-gray-400 hover:text-red-500 transition-colors ml-1">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={selectedUsers.length === 0}
            className="bg-[#1a6b6e] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#155758] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Mail size={16} /> Send Invites
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateEventModal = ({ isOpen, onClose, onCreate, predefinedClub }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    club: predefinedClub || '', 
    date: '', 
    location: '', 
    type: 'Public', 
    description: '' 
  });
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateDescription = async () => {
    if (!formData.title) return;
    setIsGenerating(true);
    
    // Gemini API Setup
    const apiKey = ""; 
    const prompt = `Write a short, engaging description (max 2 sentences) for a university club event named "${formData.title}" hosted by "${formData.club || 'a club'}". Make it sound exciting and inviting for students.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: "You are a helpful assistant writing catchy university event descriptions." }] }
        })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        setFormData(prev => ({ ...prev, description: text }));
      }
    } catch (error) {
      console.error("Error generating text:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (onCreate) onCreate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Create a New Event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Event Title</label>
            <input 
              type="text" 
              placeholder="E.g., Welcome Pizza Night" 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-600"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hosting Club</label>
              <select 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-600 bg-white"
                value={formData.club}
                onChange={e => {
                  const newClub = e.target.value;
                  setFormData({...formData, club: newClub, type: 'Public'});
                }}
                disabled={!!predefinedClub}
              >
                <option value="">None (Personal Event)</option>
                {MOCK_CLUBS.map(club => (
                  <option key={club.id} value={club.name}>{club.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Visibility</label>
              <select 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-600 bg-white"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option>Public</option>
                {formData.club ? (
                  <option>Members Only</option>
                ) : (
                  <option>Invite Only / Private</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-600"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
              <input 
                type="text" 
                placeholder="E.g., Campus Center" 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-600"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Event Banner (Optional)</label>
            <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
              <span className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                <ImageIcon size={18} /> Upload Image
              </span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-600">Event Description</label>
              <button 
                onClick={handleGenerateDescription}
                disabled={!formData.title || isGenerating}
                className="text-xs text-teal-600 flex items-center gap-1 hover:text-teal-700 disabled:opacity-50"
              >
                <Sparkles size={12} />
                {isGenerating ? "Generating..." : "Generate with AI"}
              </button>
            </div>
            <textarea 
              rows={3} 
              placeholder="Tell attendees what to expect..." 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-600"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="bg-[#1a6b6e] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#155758] transition-colors shadow-sm"
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
};

const LeaveClubModal = ({ isOpen, onClose, onLeave, clubName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-center p-6 relative">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogOut size={24} />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Leave Club?</h2>
        <p className="text-sm text-gray-500 mb-6">Are you sure you want to leave <b>{clubName}</b>? You will lose access to all internal events and tasks.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={onLeave} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm">Leave Club</button>
        </div>
      </div>
    </div>
  );
};

const CreateTaskModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({ title: '', desc: '', tag: 'Design', due: '', column: 'backlog' });
  
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.title) return;
    onCreate(formData);
    setFormData({ title: '', desc: '', tag: 'Design', due: '', column: 'backlog' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Add New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Task Title</label>
            <input type="text" placeholder="What needs to be done?" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-600" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <textarea rows={3} placeholder="Add details, instructions, etc." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-600" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category Tag</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})}>
                <option>Design</option>
                <option>Tech</option>
                <option>Logistics</option>
                <option>Marketing</option>
                <option>Finance</option>
                <option>Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Column / Status</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={formData.column} onChange={e => setFormData({...formData, column: e.target.value})}>
                <option value="backlog">Backlog</option>
                <option value="inProgress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date</label>
            <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={formData.due} onChange={e => setFormData({...formData, due: e.target.value})} />
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="bg-[#1a6b6e] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#155758] transition-colors shadow-sm">Add Task</button>
        </div>
      </div>
    </div>
  );
};

// --- PAGES ---

const DashboardPage = () => {
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {MOCK_USER.name}!</h1>
          <p className="text-gray-600">Here's what's happening across your clubs today.</p>
        </div>
        <button 
          onClick={() => setIsCreateEventOpen(true)}
          className="bg-[#1a6b6e] hover:bg-[#155758] text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> New Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Events", value: "4", icon: Calendar, trend: "+2 this month", color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Pending Tasks", value: "12", icon: CheckSquare, trend: "3 due today", color: "text-orange-600", bg: "bg-orange-100" },
          { label: "Club Memberships", value: "3", icon: Users, trend: "Admin in 2 clubs", color: "text-teal-600", bg: "bg-teal-100" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <TrendingUp size={12} className={stat.color} /> {stat.trend}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <Icon size={24} className={stat.color} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
            <button className="text-[#1a6b6e] text-sm font-semibold hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {MOCK_EVENTS.slice(0, 3).map((event) => (
              <div key={event.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow cursor-pointer group">
                <div className={`w-16 h-16 rounded-lg ${event.color} flex flex-col items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                  <span className="text-xs font-bold uppercase opacity-90">{event.date.split(' ')[0]}</span>
                  <span className="text-xl font-bold">{event.date.split(' ')[1].replace(',', '')}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1a6b6e] transition-colors">{event.title}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${event.badge}`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{event.club}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                    <span className="flex items-center gap-1"><Users size={14} /> {event.attendees} Attending</span>
                  </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-[#1a6b6e] transition-colors" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Tasks Due Soon</span>
              <span className="text-xs font-medium text-[#1a6b6e] bg-teal-50 px-2 py-1 rounded">4 Pending</span>
            </div>
            <div className="divide-y divide-gray-50">
              {MOCK_TASKS.map((task) => (
                <div key={task.id} className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${task.color} cursor-pointer`}>
                  <h4 className="text-sm font-semibold text-gray-800 mb-1 leading-snug">{task.title}</h4>
                  <p className="text-xs text-gray-500 mb-3">{task.event}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> Due {task.due}
                    </span>
                    <div className="w-6 h-6 rounded-full border border-gray-200 overflow-hidden">
                      <img src={MOCK_USER.avatar} alt="assignee" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-3 text-sm font-semibold text-[#1a6b6e] hover:bg-gray-50 transition-colors">
              Go to Task Board
            </button>
          </div>
        </div>
      </div>
      
      <CreateEventModal isOpen={isCreateEventOpen} onClose={() => setIsCreateEventOpen(false)} />
    </div>
  );
};

const MyTasksPage = () => {
  const [filter, setFilter] = useState('To Do');
  
  const [tasks, setTasks] = useState([
    { id: 101, title: "Finalize stage, booth, and seating arrangement", event: "Annual Tech Summit 2025", club: "Monash Tech Club", due: "Today", priority: "High", completed: false },
    { id: 102, title: "Send reminder to registered attendees", event: "End of Year Gala", club: "Business Society", due: "Tomorrow", priority: "Medium", completed: false },
    { id: 103, title: "Catering order confirmation", event: "Annual Tech Summit 2025", club: "Monash Tech Club", due: "Oct 25", priority: "High", completed: false },
    { id: 104, title: "Design badges for speakers", event: "Code to Create Hackathon", club: "Monash Tech Club", due: "Oct 10", priority: "Low", completed: true },
    { id: 105, title: "Draft budget proposal for Q1", event: "Committee Meeting", club: "Data Science Society", due: "Nov 2", priority: "Medium", completed: false },
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const filteredTasks = tasks.filter(t => 
    filter === 'All' ? true : 
    filter === 'Completed' ? t.completed : 
    !t.completed
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">My Tasks</h1>
          <p className="text-gray-600 text-sm">Manage your assignments across all your clubs and events.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-colors">
             <Filter size={16} /> Filter
           </button>
           <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-colors">
             <ArrowUpDown size={16} /> Sort
           </button>
        </div>
      </div>

      <div className="flex gap-6 border-b border-gray-200">
        {['To Do', 'Completed', 'All'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setFilter(tab)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${filter === tab ? 'border-[#1a6b6e] text-[#1a6b6e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab} 
            <span className={`py-0.5 px-2 rounded-full text-xs ${filter === tab ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>
              {tasks.filter(t => tab === 'All' ? true : tab === 'Completed' ? t.completed : !t.completed).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3 pt-2">
         {filteredTasks.length > 0 ? filteredTasks.map(task => (
            <div 
              key={task.id} 
              className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4 transition-all hover:shadow-md group ${task.completed ? 'border-gray-100 opacity-60 bg-gray-50/50' : 'border-gray-200'}`}
            >
               <button 
                 onClick={() => toggleTask(task.id)} 
                 className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-300 text-transparent hover:border-teal-500'}`}
               >
                  <Check size={14} strokeWidth={3} />
               </button>
               
               <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm truncate transition-colors ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900 group-hover:text-[#1a6b6e]'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-gray-500">
                     <span className="flex items-center gap-1.5"><Calendar size={13} className="text-gray-400"/> {task.event}</span>
                     <span className="text-gray-300">•</span>
                     <span className="flex items-center gap-1.5"><Users size={13} className="text-gray-400"/> {task.club}</span>
                  </div>
               </div>

               <div className="flex items-center gap-6 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${
                     task.priority === 'High' ? 'bg-red-100 text-red-700' :
                     task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                     'bg-green-100 text-green-700'
                  }`}>
                     {task.priority}
                  </span>

                  <div className={`flex items-center gap-1.5 text-xs font-bold w-24 justify-end ${
                     task.completed ? 'text-gray-400' :
                     task.due === 'Today' || task.due === 'Tomorrow' ? 'text-orange-600' : 
                     'text-gray-600'
                  }`}>
                     <Clock size={14} />
                     {task.due}
                  </div>
                  
                  <button className="text-gray-300 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical size={18} />
                  </button>
               </div>
            </div>
         )) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
               <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare size={28} className="text-teal-600" />
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-1">No tasks found</h3>
               <p className="text-sm text-gray-500">You're all caught up for now!</p>
            </div>
         )}
      </div>
    </div>
  );
};

const NotificationsPage = () => {
  const [filter, setFilter] = useState('All');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const filteredNotifs = filter === 'All' 
    ? notifications 
    : notifications.filter(n => n.type === filter.toLowerCase());

  const markRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? {...n, read: true} : n));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated on your club activities and task assignments.</p>
        </div>
        <button 
          onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
          className="text-sm font-semibold text-[#1a6b6e] hover:underline flex items-center gap-1.5"
        >
          <Check size={16} /> Mark all as read
        </button>
      </div>

      <div className="flex gap-4">
        {['All', 'Invite', 'Task', 'Reminder'].map(t => (
          <button 
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === t ? 'bg-[#1a6b6e] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {t}s
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredNotifs.length > 0 ? filteredNotifs.map(notif => (
          <div 
            key={notif.id} 
            onClick={() => markRead(notif.id)}
            className={`bg-white rounded-xl p-5 border transition-all flex gap-5 items-start cursor-pointer group ${notif.read ? 'border-gray-100 opacity-80' : 'border-teal-200 bg-teal-50/20 ring-1 ring-teal-50 shadow-sm'}`}
          >
            <div className="flex-shrink-0">
               {notif.type === 'invite' && <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><UserPlus size={24}/></div>}
               {notif.type === 'task' && <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><CheckSquare size={24}/></div>}
               {notif.type === 'reminder' && <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center"><Calendar size={24}/></div>}
            </div>
            
            <div className="flex-1">
               <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notif.type === 'invite' ? 'Club Invitation' : notif.type === 'task' ? 'Task Assignment' : 'Event Reminder'}
                  </h3>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{notif.time}</span>
               </div>
               
               <div className="text-sm text-gray-600 leading-relaxed">
                  {notif.type === 'invite' && <><span className="font-bold text-gray-800">{notif.sender}</span> has invited you to join the <span className="font-bold text-gray-800">{notif.club}</span> committee.</>}
                  {notif.type === 'task' && <>You have been assigned to: <span className="font-bold text-gray-800">"{notif.title}"</span> in <span className="italic">{notif.event}</span>.</>}
                  {notif.type === 'reminder' && <>{notif.title}</>}
               </div>

               {notif.type === 'invite' && !notif.read && (
                 <div className="mt-4 flex gap-3">
                    <button className="bg-[#1a6b6e] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#155758] transition-colors shadow-sm">Accept Invitation</button>
                    <button className="bg-white text-gray-600 border border-gray-200 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">Decline</button>
                 </div>
               )}
            </div>

            {!notif.read && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#1a6b6e] mt-2 group-hover:scale-125 transition-transform"></div>
            )}
          </div>
        )) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-20 flex flex-col items-center justify-center text-center opacity-60">
             <Bell size={48} className="text-gray-300 mb-4" />
             <p className="text-gray-500 font-medium">No {filter.toLowerCase()}s to show right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ClubsPage = ({ onClubSelect }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [clubs, setClubs] = useState(MOCK_CLUBS);

  const handleCreateClub = (data) => {
    const newClub = {
      id: clubs.length + 1,
      name: data.name,
      type: data.type,
      banner: "bg-teal-500",
      event: "No events yet",
      members: "1/50",
      badgeColors: "bg-gray-100 text-gray-700"
    };
    setClubs([newClub, ...clubs]);
    setIsCreateOpen(false);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-[#1f2937]">Club Management</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 p-2 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="search a club" 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a6b6e] focus:ring-1 focus:ring-[#1a6b6e] text-sm shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <ArrowUpDown size={16} /> Sort by
          </button>
          <button 
            onClick={() => setIsJoinOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <UserPlus size={16} /> Join club
          </button>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Edit size={16} /> Create club
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {clubs.map(club => (
          <div 
            key={club.id} 
            onClick={() => onClubSelect(club.id)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all flex flex-col h-[180px] cursor-pointer"
          >
            <div className={`h-[80px] w-full ${club.banner} flex items-center justify-center relative overflow-hidden`}>
              {club.isLogo && (
                 <div className="text-white text-3xl font-black italic tracking-tighter drop-shadow-md">
                   {club.name === "MEGA" ? "MEGA" : club.name.split(' ')[0]} 
                   {club.name === "MEGA" && <span className="text-2xl ml-1">🎮</span>}
                 </div>
              )}
              {club.isLogoPattern && (
                <div className="absolute inset-0 opacity-20 flex flex-wrap text-4xl leading-none">
                  🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘
                </div>
              )}
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 truncate pr-2">{club.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0 ${club.badgeColors}`}>
                  {club.type}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium mt-auto pt-2">
                <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                  <CalendarCheck2 size={14} className="flex-shrink-0" />
                  <span className="truncate">{club.event}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Users size={14} />
                  <span>{club.members}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateClubModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreateClub} />
      <JoinClubModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
}

const ClubDetailsPage = ({ clubId, onBack, onEventSelect }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  
  const club = MOCK_CLUBS.find(c => c.id === clubId);
  const clubEvents = MOCK_EVENTS.filter(e => e.club === club?.name);

  if (!club) return null;

  return (
    <div className="animate-in fade-in duration-300 pb-12">
      <div className={`h-48 w-full ${club.banner} relative overflow-hidden`}>
        {club.isLogoPattern && (
          <div className="absolute inset-0 opacity-20 flex flex-wrap text-6xl leading-none pt-4">
            🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘🐘
          </div>
        )}
        <div className="absolute top-6 left-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <ArrowLeft size={18} /> Back to Clubs
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 -mt-12 relative z-10 space-y-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{club.name}</h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${club.badgeColors}`}>
                {club.type}
              </span>
            </div>
            <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
              We are the official {club.name} at Monash University. Dedicated to bringing together students passionate about {club.type.toLowerCase()} activities, networking, and building lifelong friendships.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{club.members}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Members</p>
            </div>
            <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
            <button 
              onClick={() => setIsLeaveModalOpen(true)}
              className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Leave Club</span>
            </button>
          </div>
        </div>

        <div className="flex gap-8 border-b border-gray-200 px-2">
          {['Overview', 'Events', 'Members', 'Settings'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#1a6b6e] text-[#1a6b6e]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">About the Club</h3>
                <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                  <p>Welcome to {club.name}! We are a student-run organization at Monash University dedicated to fostering a community around {club.type.toLowerCase()} interests.</p>
                  <p>Our weekly meetups provide a platform for students to share ideas, collaborate on projects, and expand their horizons outside the classroom. Whether you are an absolute beginner or an experienced veteran, there is a place for you here.</p>
                  <p>Join our Discord server to stay up to date with the latest announcements and chat with fellow members!</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">External Links</h3>
                <div className="space-y-3">
                  {club.socials?.discord && (
                    <a href={club.socials.discord} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                      <MessageSquare size={18} className="text-[#5865F2]" /> Discord Server
                    </a>
                  )}
                  {club.socials?.instagram && (
                    <a href={club.socials.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                      <Instagram size={18} className="text-[#E1306C]" /> Instagram
                    </a>
                  )}
                  {club.socials?.website && (
                    <a href={club.socials.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                      <Globe size={18} className="text-gray-500" /> Club Website
                    </a>
                  )}
                  {(!club.socials || (!club.socials.discord && !club.socials.instagram && !club.socials.website)) && (
                    <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      No external links provided yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Events' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Club Events</h2>
              <button 
                onClick={() => setIsCreateEventOpen(true)}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm text-sm"
              >
                <Plus size={16} /> New Event
              </button>
            </div>

            {clubEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubEvents.map(event => (
                  <div 
                    key={event.id} 
                    onClick={() => onEventSelect(event.id)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col cursor-pointer"
                  >
                    <div className={`h-24 ${event.color} relative p-4 flex flex-col justify-between`}>
                      <div className="flex justify-end">
                        <button className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1 rounded transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-[#1a6b6e] transition-colors mb-4">
                        {event.title}
                      </h3>
                      <div className="space-y-2 mb-6 flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Calendar size={16} className="text-gray-400" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${event.badge}`}>
                          {event.status}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                          <Users size={14} />
                          {event.attendees}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">No events yet</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                  This club hasn't created any events. Create the first event to kick things off!
                </p>
                <button 
                  onClick={() => setIsCreateEventOpen(true)}
                  className="bg-[#1a6b6e] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#155758] transition-colors shadow-sm text-sm"
                >
                  Create First Event
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Members' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Search members..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-600 text-sm w-64 shadow-sm bg-white" />
              </div>
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-[#1a6b6e] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#155758] transition-colors shadow-sm text-sm"
              >
                <UserPlus size={16} /> Invite Members
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full border border-gray-200" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12}/> {member.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                          member.role === 'Admin' ? 'bg-teal-100 text-teal-700' : 
                          member.role === 'Event Manager' ? 'bg-purple-100 text-purple-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role === 'Admin' && <Shield size={10} />} {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={() => setOpenActionMenuId(openActionMenuId === member.id ? null : member.id)}
                          className="text-gray-400 hover:text-teal-600 p-1 transition-colors relative z-10"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        
                        {openActionMenuId === member.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenActionMenuId(null)}
                            ></div>
                            <div className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1 flex flex-col text-left animate-in fade-in zoom-in-95 duration-100">
                              <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Change Role</div>
                              <button 
                                onClick={() => {
                                  setMembers(members.map(m => m.id === member.id ? { ...m, role: 'Admin' } : m));
                                  setOpenActionMenuId(null);
                                }}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 text-left w-full transition-colors flex items-center gap-2"
                              >
                                <Shield size={14} /> Make Admin
                              </button>
                              <button 
                                onClick={() => {
                                  setMembers(members.map(m => m.id === member.id ? { ...m, role: 'Event Manager' } : m));
                                  setOpenActionMenuId(null);
                                }}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 text-left w-full transition-colors flex items-center gap-2"
                              >
                                <Calendar size={14} /> Make Event Manager
                              </button>
                              <button 
                                onClick={() => {
                                  setMembers(members.map(m => m.id === member.id ? { ...m, role: 'Member' } : m));
                                  setOpenActionMenuId(null);
                                }}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left w-full transition-colors flex items-center gap-2"
                              >
                                <Users size={14} /> Make Member
                              </button>
                              <div className="h-px bg-gray-100 my-1"></div>
                              <button 
                                onClick={() => {
                                  setMembers(members.filter(m => m.id !== member.id));
                                  setOpenActionMenuId(null);
                                }}
                                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left w-full transition-colors flex items-center gap-2 font-medium"
                              >
                                <Trash2 size={14} /> Remove from Club
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">General Information</h3>
                  <p className="text-sm text-gray-500">Update your club's profile details and banner.</p>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Club Name</label>
                    <input type="text" defaultValue={club.name} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Club Category</label>
                    <select defaultValue={club.type} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-600 bg-white">
                      <option>Social</option>
                      <option>Academic</option>
                      <option>Cultural</option>
                      <option>Technology</option>
                      <option>Hobby</option>
                      <option>Activist</option>
                      <option>Religious</option>
                      <option>Fitness</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Club Banner <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <div className={`w-full h-32 ${club.banner} rounded-lg flex items-center justify-center border-2 border-transparent hover:border-gray-300 transition-colors cursor-pointer relative group`}>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
                         <span className="text-white opacity-0 group-hover:opacity-100 font-semibold flex items-center gap-2 transition-opacity">
                           <ImageIcon size={18} /> Change Cover
                         </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <h4 className="text-sm font-bold text-gray-900">External Links & Socials</h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shared Drive Link <span className="text-gray-400 font-normal">(Internal)</span></label>
                    <input type="url" placeholder="https://drive.google.com/..." className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-600" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><MessageSquare size={14} className="text-[#5865F2]" /> Discord Invite Link</label>
                      <input type="url" defaultValue={club.socials?.discord || ""} placeholder="https://discord.gg/..." className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><Instagram size={14} className="text-[#E1306C]" /> Instagram Link</label>
                      <input type="url" defaultValue={club.socials?.instagram || ""} placeholder="https://instagram.com/..." className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><Globe size={14} className="text-gray-500" /> Website URL</label>
                    <input type="url" defaultValue={club.socials?.website || ""} placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-600" />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                <button className="bg-[#1a6b6e] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#155758] transition-colors shadow-sm">Save Changes</button>
              </div>
            </div>

            <div className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-red-800 mb-1">Danger Zone</h3>
                <p className="text-sm text-red-600 mb-4">Deleting a club is irreversible. All associated events, tasks, and member data will be permanently removed.</p>
                <button className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm">
                  <Trash2 size={16} /> Delete Club
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateEventModal 
        isOpen={isCreateEventOpen} 
        onClose={() => setIsCreateEventOpen(false)} 
        predefinedClub={club.name} 
      />
      <InviteMembersModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        clubName={club.name}
      />
      <LeaveClubModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onLeave={() => {
          setIsLeaveModalOpen(false);
          onBack(); 
        }}
        clubName={club.name}
      />
    </div>
  );
};

const EventTaskBoardPage = ({ eventId, clubId, onBack }) => {
  const [activeTab, setActiveTab] = useState('Board');
  const [kanbanData, setKanbanData] = useState(MOCK_KANBAN);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [filterTag, setFilterTag] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const event = MOCK_EVENTS.find(e => e.id === eventId);
  const club = MOCK_CLUBS.find(c => c.id === clubId);

  if (!event) return null;

  const handleCreateTask = (data) => {
    const tagStyles = {
      Design: "bg-purple-100 text-purple-700",
      Finance: "bg-orange-100 text-orange-700",
      Operations: "bg-pink-100 text-pink-700",
      Tech: "bg-blue-100 text-blue-700",
      Logistics: "bg-green-100 text-green-700",
      Marketing: "bg-red-100 text-red-700"
    };

    const newTask = {
      id: Date.now(),
      title: data.title,
      desc: data.desc,
      tag: data.tag,
      tagColor: tagStyles[data.tag] || "bg-gray-100 text-gray-700",
      avatars: ["11"],
      due: data.due ? new Date(data.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "No Date",
      colorMark: "bg-[#1a6b6e]",
      done: data.column === 'done'
    };

    setKanbanData(prev => ({
      ...prev,
      [data.column]: [newTask, ...prev[data.column]]
    }));
  };

  const getFilteredTasks = (tasks) => {
    if (filterTag === 'All') return tasks;
    return tasks.filter(t => t.tag === filterTag);
  };

  const allTasks = [
    ...kanbanData.backlog.map(t => ({...t, status: 'Backlog'})),
    ...kanbanData.inProgress.map(t => ({...t, status: 'In Progress'})),
    ...kanbanData.review.map(t => ({...t, status: 'Review'})),
    ...kanbanData.done.map(t => ({...t, status: 'Done'}))
  ];

  const renderTaskCard = (task) => {
    if (task.done) {
      return (
        <div key={task.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-gray-300 transition-colors mb-3">
           <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${task.tagColor}`}>{task.tag}</span>
           <div className="mt-2 text-sm font-semibold text-gray-500 line-through decoration-gray-300">{task.title}</div>
           <div className="mt-3 flex items-center justify-between">
              <div className="flex -space-x-1.5">
                {task.avatars.map((av, i) => (
                  <img key={i} src={`https://i.pravatar.cc/150?img=${av}`} className="w-5 h-5 rounded-full border border-white" alt="avatar"/>
                ))}
              </div>
              <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 size={12}/> Done</span>
           </div>
        </div>
      );
    }

    return (
      <div key={task.id} className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group mb-3">
         <div className="flex justify-between items-start mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${task.tagColor}`}>{task.tag}</span>
         </div>
         <h4 className="text-sm font-bold text-gray-800 leading-snug mb-1 group-hover:text-[#1a6b6e] transition-colors">{task.title}</h4>
         {task.desc && <p className="text-xs text-gray-500 leading-snug mb-3 line-clamp-2">{task.desc}</p>}
         
         <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-2">
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${task.colorMark}`}></div>
               {task.progress ? (
                  <span className="text-xs font-semibold text-gray-600 flex items-center gap-1"><CheckSquare size={12} className="text-gray-400"/> {task.progress}</span>
               ) : (
                 <span className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Calendar size={12}/> {task.due}</span>
               )}
            </div>
            <div className="flex -space-x-1.5">
              {task.avatars.map((av, i) => (
                <img key={i} src={`https://i.pravatar.cc/150?img=${av}`} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" alt="avatar"/>
              ))}
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f0eb] animate-in slide-in-from-right-4 duration-300">
      <div className="bg-[#174646] text-white px-8 py-5 flex-shrink-0">
         <div className="flex items-center gap-2 mb-4">
            <button onClick={onBack} className="text-teal-200 hover:text-white transition-colors flex items-center text-sm font-semibold">
              <ArrowLeft size={16} className="mr-1"/> Back
            </button>
         </div>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-2xl font-bold">{event.title}</h1>
                 <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Task Board • {club?.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-teal-100 font-medium">
                 <span className="flex items-center gap-1.5"><Calendar size={14}/> {event.date}</span>
                 <span className="flex items-center gap-1.5"><Users size={14}/> 24 members</span>
                 <span className="flex items-center gap-1.5"><CheckSquare size={14}/> {allTasks.length} tasks</span>
              </div>
            </div>
            <div className="flex items-center gap-3 relative">
               <button 
                 onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                 className={`bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-white/20 ${filterTag !== 'All' ? 'bg-white/30 border-white/50' : ''}`}
               >
                 <ListFilter size={16}/> {filterTag === 'All' ? 'Filter' : filterTag}
               </button>
               
               {showFilterDropdown && (
                 <>
                   <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)}></div>
                   <div className="absolute top-full right-[104px] mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1 flex flex-col text-left animate-in fade-in zoom-in-95 duration-100">
                     <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Filter by Tag</div>
                     {['All', 'Design', 'Finance', 'Logistics', 'Marketing', 'Operations', 'Tech'].map(tag => (
                       <button 
                         key={tag}
                         onClick={() => { setFilterTag(tag); setShowFilterDropdown(false); }}
                         className={`px-4 py-2 text-sm text-left w-full transition-colors hover:bg-gray-50 ${filterTag === tag ? 'text-[#1a6b6e] font-bold bg-teal-50' : 'text-gray-700'}`}
                       >
                         {tag}
                       </button>
                     ))}
                   </div>
                 </>
               )}

               <button 
                 onClick={() => setIsCreateTaskOpen(true)}
                 className="bg-white text-[#174646] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-teal-50 transition-colors shadow-sm"
               >
                 <Plus size={16}/> Add task
               </button>
            </div>
         </div>
      </div>

      <div className="bg-white px-8 border-b border-gray-200 flex gap-6 flex-shrink-0">
          {['Board', 'List', 'Budget', 'Files'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab ? 'border-[#1a6b6e] text-[#1a6b6e]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
             <div className="w-32 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 w-[62%] h-full rounded-full"></div>
             </div>
             <span className="text-xs font-bold text-green-600">62% complete</span>
          </div>
      </div>

      {activeTab === 'Board' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 animate-in fade-in duration-300">
          <div className="flex gap-6 h-full items-start min-w-max pb-4">
             
             {/* Backlog */}
             <div className="w-[300px] flex flex-col gap-3 max-h-full">
                <div className="flex items-center justify-between px-1 mb-1">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Backlog</h3>
                      <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{getFilteredTasks(kanbanData.backlog).length}</span>
                   </div>
                   <button onClick={() => setIsCreateTaskOpen(true)} className="text-gray-400 hover:text-gray-600"><Plus size={16}/></button>
                </div>
                <div className="flex-1 overflow-y-auto pr-1 pb-2">
                   {getFilteredTasks(kanbanData.backlog).map(renderTaskCard)}
                   <button onClick={() => setIsCreateTaskOpen(true)} className="w-full mt-2 py-2.5 text-sm font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl border border-dashed border-gray-300 transition-colors flex items-center justify-center gap-1">
                     <Plus size={16}/> Add task
                   </button>
                </div>
             </div>

             {/* In Progress */}
             <div className="w-[300px] flex flex-col gap-3 max-h-full">
                <div className="flex items-center justify-between px-1 mb-1">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">In progress</h3>
                      <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">{getFilteredTasks(kanbanData.inProgress).length}</span>
                   </div>
                   <button onClick={() => setIsCreateTaskOpen(true)} className="text-gray-400 hover:text-gray-600"><Plus size={16}/></button>
                </div>
                <div className="flex-1 overflow-y-auto pr-1 pb-2">
                   {getFilteredTasks(kanbanData.inProgress).map(renderTaskCard)}
                   <button onClick={() => setIsCreateTaskOpen(true)} className="w-full mt-2 py-2.5 text-sm font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl border border-dashed border-gray-300 transition-colors flex items-center justify-center gap-1">
                     <Plus size={16}/> Add task
                   </button>
                </div>
             </div>

             {/* Review */}
             <div className="w-[300px] flex flex-col gap-3 max-h-full">
                <div className="flex items-center justify-between px-1 mb-1">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Review</h3>
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{getFilteredTasks(kanbanData.review).length}</span>
                   </div>
                   <button onClick={() => setIsCreateTaskOpen(true)} className="text-gray-400 hover:text-gray-600"><Plus size={16}/></button>
                </div>
                <div className="flex-1 overflow-y-auto pr-1 pb-2">
                   {getFilteredTasks(kanbanData.review).map(renderTaskCard)}
                   <button onClick={() => setIsCreateTaskOpen(true)} className="w-full mt-2 py-2.5 text-sm font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl border border-dashed border-gray-300 transition-colors flex items-center justify-center gap-1">
                     <Plus size={16}/> Add task
                   </button>
                </div>
             </div>

             {/* Done */}
             <div className="w-[300px] flex flex-col gap-3 max-h-full">
                <div className="flex items-center justify-between px-1 mb-1">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Done</h3>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{getFilteredTasks(kanbanData.done).length}</span>
                   </div>
                   <button onClick={() => setIsCreateTaskOpen(true)} className="text-gray-400 hover:text-gray-600"><Plus size={16}/></button>
                </div>
                <div className="flex-1 overflow-y-auto pr-1 pb-2">
                   {getFilteredTasks(kanbanData.done).map(renderTaskCard)}
                   <button onClick={() => setIsCreateTaskOpen(true)} className="w-full mt-2 py-2.5 text-sm font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl border border-dashed border-gray-300 transition-colors flex items-center justify-center gap-1">
                     <Plus size={16}/> Add task
                   </button>
                </div>
             </div>

          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {activeTab === 'List' && (
        <div className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-300">
           <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    <tr>
                       <th className="px-6 py-4">Task Name</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Assignees</th>
                       <th className="px-6 py-4">Due Date</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {getFilteredTasks(allTasks).map(t => (
                       <tr key={t.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                          <td className="px-6 py-4">
                             <div className="font-semibold text-sm text-gray-800 group-hover:text-teal-700 transition-colors">{t.title}</div>
                             <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block mt-1.5 ${t.tagColor}`}>{t.tag}</div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                t.status === 'Done' ? 'bg-green-100 text-green-700' :
                                t.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                t.status === 'Review' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                             }`}>
                                {t.status}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex -space-x-1.5">
                               {t.avatars.map((av, i) => (
                                 <img key={i} src={`https://i.pravatar.cc/150?img=${av}`} className="w-7 h-7 rounded-full border-2 border-white shadow-sm" alt="av"/>
                               ))}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-500">
                             {t.due || <span className="text-gray-300">-</span>}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* BUDGET VIEW */}
      {activeTab === 'Budget' && (
        <div className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-300">
           <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><DollarSign size={24}/></div>
                    <div>
                       <p className="text-sm font-semibold text-gray-500">Total Budget</p>
                       <h3 className="text-2xl font-bold text-gray-900">$5,000</h3>
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center"><PieChart size={24}/></div>
                    <div>
                       <p className="text-sm font-semibold text-gray-500">Total Spent</p>
                       <h3 className="text-2xl font-bold text-gray-900">$2,850</h3>
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center"><TrendingUp size={24}/></div>
                    <div>
                       <p className="text-sm font-semibold text-gray-500">Remaining</p>
                       <h3 className="text-2xl font-bold text-green-600">$2,150</h3>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Expense Breakdown</h3>
                    <button className="bg-[#1a6b6e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155758] transition-colors shadow-sm flex items-center gap-2">
                      <Plus size={16}/> Add Expense
                    </button>
                 </div>
                 <table className="w-full text-left">
                    <thead className="border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
                       <tr>
                          <th className="px-6 py-4">Item description</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {MOCK_BUDGET.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                             <td className="px-6 py-4 font-semibold text-sm text-gray-800">{item.item}</td>
                             <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                             <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                             <td className="px-6 py-4">
                               <span className={`text-xs font-bold px-2 py-1 rounded ${item.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span>
                             </td>
                             <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">${item.amount.toLocaleString()}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* FILES VIEW */}
      {activeTab === 'Files' && (
        <div className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-300 flex items-center justify-center">
           <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Folder size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Event Shared Drive</h3>
              <p className="text-gray-500 text-sm mb-6">All documents, assets, and files for this event are managed in a centralized Google Drive folder.</p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6 flex items-center justify-between">
                 <span className="text-xs text-gray-500 truncate mr-3">https://drive.google.com/drive/folders/1XyZ...</span>
                 <button className="text-teal-600 hover:text-teal-700 text-xs font-semibold px-3 py-1.5 bg-teal-50 rounded-md hover:bg-teal-100 transition-colors">Copy</button>
              </div>

              <div className="flex flex-col gap-3">
                 <a href="#" target="_blank" rel="noopener noreferrer" className="w-full bg-[#1a6b6e] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#155758] transition-colors shadow-sm flex items-center justify-center gap-2">
                   <ExternalLink size={18} /> Open Google Drive
                 </a>
                 <button className="text-teal-600 text-sm font-semibold hover:underline mt-2">
                   Edit Drive Link
                 </button>
              </div>
           </div>
        </div>
      )}

      <CreateTaskModal isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} onCreate={handleCreateTask} />
    </div>
  );
};

const EventsPage = () => {
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Events</h1>
          <p className="text-gray-600 text-sm">Manage and discover all activities across your clubs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search events..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a6b6e] focus:ring-1 focus:ring-[#1a6b6e] text-sm w-64 shadow-sm"
            />
          </div>
          <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-white text-gray-600 shadow-sm transition-colors">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => setIsCreateEventOpen(true)}
            className="bg-[#1a6b6e] hover:bg-[#155758] text-white px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm text-sm"
          >
            <Plus size={18} /> Create Event
          </button>
        </div>
      </div>

      <div className="flex gap-6 border-b border-gray-200">
        {['All Events', 'Upcoming', 'Drafts', 'Past'].map((tab, i) => (
          <button 
            key={tab} 
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              i === 0 
                ? 'border-[#1a6b6e] text-[#1a6b6e]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
        {MOCK_EVENTS.map((event) => (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group flex flex-col cursor-pointer">
            
            <div className={`h-24 ${event.color} relative p-4 flex flex-col justify-between`}>
              <div className="flex justify-between items-start">
                <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold tracking-wide">
                  {event.club}
                </span>
                <button className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1 rounded transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-[#1a6b6e] transition-colors pr-4">
                  {event.title}
                </h3>
              </div>
              
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Calendar size={16} className="text-gray-400" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                 <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${event.badge}`}>
                    {event.status}
                  </span>
                 <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <Users size={14} />
                    {event.attendees}
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <CreateEventModal isOpen={isCreateEventOpen} onClose={() => setIsCreateEventOpen(false)} />
    </div>
  );
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const handlePageChange = (page) => {
    setActivePage(page);
    setShowNotifications(false);
    if (page !== 'clubs') {
      setSelectedClubId(null);
      setSelectedEventId(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f5f0eb] font-sans overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={handlePageChange} />
      
      <main className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        {!selectedEventId && (
          <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-end px-8 flex-shrink-0 transition-all">
            <div className="flex items-center gap-4">
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-colors ${showNotifications ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-500'}`}
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800">Notifications</h3>
                        <button className="text-xs text-[#1a6b6e] font-semibold hover:underline">Mark all as read</button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                        {MOCK_NOTIFICATIONS.slice(0, 3).map(notif => (
                          <div key={notif.id} className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-teal-50/30' : ''}`}>
                             <div className="flex-shrink-0 mt-1">
                                {notif.type === 'invite' && <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><UserPlus size={16}/></div>}
                                {notif.type === 'task' && <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><CheckSquare size={16}/></div>}
                                {notif.type === 'reminder' && <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"><Calendar size={16}/></div>}
                             </div>
                             <div className="flex-1">
                                {notif.type === 'invite' && (
                                  <>
                                    <p className="text-sm text-gray-800 leading-snug"><span className="font-bold">{notif.sender}</span> invited you to join <span className="font-bold">{notif.club}</span>.</p>
                                    <div className="flex items-center gap-2 mt-3">
                                       <button className="flex-1 bg-[#1a6b6e] text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-[#155758] transition-colors">Accept</button>
                                       <button className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors border border-gray-200">Decline</button>
                                    </div>
                                  </>
                                )}
                                {notif.type === 'task' && (
                                  <p className="text-sm text-gray-800 leading-snug">You were assigned a task: <span className="font-medium text-gray-900">"{notif.title}"</span> in <span className="font-medium">{notif.event}</span>.</p>
                                )}
                                {notif.type === 'reminder' && (
                                  <p className="text-sm text-gray-800 leading-snug">{notif.title}</p>
                                )}
                                <p className="text-[11px] font-bold text-gray-400 mt-1.5 uppercase tracking-wide">{notif.time}</p>
                             </div>
                             {!notif.read && <div className="w-2 h-2 rounded-full bg-[#1a6b6e] mt-1.5 flex-shrink-0"></div>}
                          </div>
                        ))}
                      </div>
                      <div 
                        onClick={() => handlePageChange('notifications')}
                        className="p-3 border-t border-gray-100 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <span className="text-xs font-bold text-gray-600">View all notifications</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="h-6 w-px bg-gray-200"></div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">{MOCK_USER.name}</span>
                <img src={MOCK_USER.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
              </div>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto">
          {activePage === 'dashboard' && <DashboardPage />}
          {activePage === 'notifications' && <NotificationsPage />}
          
          {/* Clubs Routing Logic */}
          {activePage === 'clubs' && !selectedClubId && !selectedEventId && (
            <ClubsPage onClubSelect={(id) => setSelectedClubId(id)} />
          )}
          {activePage === 'clubs' && selectedClubId && !selectedEventId && (
            <ClubDetailsPage 
              clubId={selectedClubId} 
              onBack={() => setSelectedClubId(null)} 
              onEventSelect={(id) => setSelectedEventId(id)}
            />
          )}
          {activePage === 'clubs' && selectedClubId && selectedEventId && (
            <EventTaskBoardPage 
              eventId={selectedEventId} 
              clubId={selectedClubId}
              onBack={() => setSelectedEventId(null)}
            />
          )}

          {activePage === 'events' && <EventsPage />}
          {activePage === 'tasks' && <MyTasksPage />}
          
        </div>
      </main>
    </div>
  );
}