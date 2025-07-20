'use client';

import React, { useState, useEffect } from 'react';
import { Eye, QrCode, BarChart, Users, Star, Plus, Edit, Trash2, Copy, X, Check, Download, ExternalLink } from 'lucide-react';
import { getAllEvents, EventConfig } from '../lib/eventConfigs';
import { db } from '../firebase';
import { ref, push, set, remove, onValue } from 'firebase/database';
import Link from 'next/link';
import Image from 'next/image';
import QRCodeLib from 'qrcode';

interface FirebaseEvent extends EventConfig {
  firebaseId?: string;
  isCustom?: boolean;
}

// Default theme constant - outside component to avoid re-creation
const DEFAULT_THEME = {
  background: 'from-indigo-900 via-purple-900 to-blue-900',
  titleGradient: 'from-indigo-300 to-purple-300',
  buttonGradient: 'from-indigo-600 to-purple-600',
  buttonHover: 'from-indigo-700 to-purple-700',
  accent: 'indigo-400'
};

const AdminOverview = () => {
  const [events, setEvents] = useState<FirebaseEvent[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FirebaseEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FirebaseEvent | null>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');

  // Helper to get event theme with fallback
  const getEventTheme = (event: FirebaseEvent) => event.theme || DEFAULT_THEME;

  // Create Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    subtitle: '',
    activityLabel: 'Which aspect would you like to rate?',
    feedbackLabel: 'Share your thoughts',
    feedbackPlaceholder: 'Tell us about your experience...',
    activities: [''],
    theme: DEFAULT_THEME
  });

  // Predefined themes for easy selection
  const themePresets = [
    {
      name: 'Research Purple',
      theme: {
        background: 'from-indigo-900 via-purple-900 to-blue-900',
        titleGradient: 'from-indigo-300 to-purple-300',
        buttonGradient: 'from-indigo-600 to-purple-600',
        buttonHover: 'from-indigo-700 to-purple-700',
        accent: 'indigo-400'
      }
    },
    {
      name: 'Wedding Rose',
      theme: {
        background: 'from-rose-800 via-pink-800 to-purple-800',
        titleGradient: 'from-rose-200 to-pink-200',
        buttonGradient: 'from-rose-600 to-pink-600',
        buttonHover: 'from-rose-700 to-pink-700',
        accent: 'rose-400'
      }
    },
    {
      name: 'Corporate Gray',
      theme: {
        background: 'from-slate-800 via-gray-800 to-zinc-800',
        titleGradient: 'from-slate-200 to-gray-200',
        buttonGradient: 'from-slate-600 to-gray-600',
        buttonHover: 'from-slate-700 to-gray-700',
        accent: 'slate-400'
      }
    },
    {
      name: 'Ocean Blue',
      theme: {
        background: 'from-blue-800 via-cyan-800 to-teal-800',
        titleGradient: 'from-blue-200 to-cyan-200',
        buttonGradient: 'from-blue-600 to-cyan-600',
        buttonHover: 'from-blue-700 to-cyan-700',
        accent: 'blue-400'
      }
    },
    {
      name: 'Forest Green',
      theme: {
        background: 'from-emerald-800 via-green-800 to-teal-800',
        titleGradient: 'from-emerald-200 to-green-200',
        buttonGradient: 'from-emerald-600 to-green-600',
        buttonHover: 'from-emerald-700 to-green-700',
        accent: 'emerald-400'
      }
    }
  ];

  // Client-side mounting check to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load events from Firebase and merge with static events
  useEffect(() => {
    if (!mounted) return;
    
    const staticEvents = getAllEvents().map(event => ({ ...event, isCustom: false }));
    setEvents(staticEvents); // Set static events immediately
    
    const eventsRef = ref(db, 'events');
    
    onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const firebaseData = snapshot.val() as Record<string, EventConfig>;
        const firebaseEvents = Object.entries(firebaseData).map(([firebaseId, data]) => ({
          ...data,
          firebaseId,
          isCustom: true
        }));
        
        setEvents([...staticEvents, ...firebaseEvents]);
      } else {
        setEvents(staticEvents);
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      setEvents(staticEvents); // Fallback to static events
      setLoading(false);
    });
  }, [mounted]);

  // Reset form when modal closes
  useEffect(() => {
    if (!showCreateModal && !editingEvent) {
      setNewEvent({
        title: '',
        subtitle: '',
        activityLabel: 'Which aspect would you like to rate?',
        feedbackLabel: 'Share your thoughts',
        feedbackPlaceholder: 'Tell us about your experience...',
        activities: [''],
        theme: DEFAULT_THEME
      });
    }
  }, [showCreateModal, editingEvent]);

  const createEvent = async () => {
    if (!newEvent.title.trim()) return;
    
    const eventId = newEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const eventData = {
      id: eventId,
      title: newEvent.title.trim(),
      subtitle: newEvent.subtitle.trim(),
      activityLabel: newEvent.activityLabel.trim(),
      feedbackLabel: newEvent.feedbackLabel.trim(),
      feedbackPlaceholder: newEvent.feedbackPlaceholder.trim(),
      activities: (newEvent.activities || []).filter(a => a.trim()).map(a => a.trim()),
      theme: newEvent.theme,
      createdAt: Date.now()
    };

    try {
      const eventsRef = ref(db, 'events');
      await push(eventsRef, eventData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please check your Firebase configuration.');
    }
  };

  const deleteEvent = async (event: FirebaseEvent) => {
    if (!event.firebaseId || !event.isCustom) return;
    
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        const eventRef = ref(db, `events/${event.firebaseId}`);
        await remove(eventRef);
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event.');
      }
    }
  };

  const startEditing = (event: FirebaseEvent) => {
    if (!event.isCustom) return;
    
    setNewEvent({
      title: event.title || '',
      subtitle: event.subtitle || '',
      activityLabel: event.activityLabel || 'Which aspect would you like to rate?',
      feedbackLabel: event.feedbackLabel || 'Share your thoughts',
      feedbackPlaceholder: event.feedbackPlaceholder || 'Tell us about your experience...',
      activities: [...(event.activities || [''])],
      theme: { ...getEventTheme(event) }
    });
    setEditingEvent(event);
  };

  const saveEdit = async () => {
    if (!editingEvent?.firebaseId || !newEvent.title.trim()) return;
    
    const eventId = newEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const eventData = {
      id: eventId,
      title: newEvent.title.trim(),
      subtitle: newEvent.subtitle.trim(),
      activityLabel: newEvent.activityLabel.trim(),
      feedbackLabel: newEvent.feedbackLabel.trim(),
      feedbackPlaceholder: newEvent.feedbackPlaceholder.trim(),
      activities: (newEvent.activities || []).filter(a => a.trim()).map(a => a.trim()),
      theme: newEvent.theme,
      updatedAt: Date.now()
    };

    try {
      const eventRef = ref(db, `events/${editingEvent.firebaseId}`);
      await set(eventRef, eventData);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event.');
    }
  };

  const addActivity = () => {
    setNewEvent(prev => ({
      ...prev,
      activities: [...(prev.activities || []), '']
    }));
  };

  const removeActivity = (index: number) => {
    setNewEvent(prev => ({
      ...prev,
      activities: (prev.activities || []).filter((_, i) => i !== index)
    }));
  };

  const updateActivity = (index: number, value: string) => {
    setNewEvent(prev => ({
      ...prev,
      activities: (prev.activities || []).map((activity, i) => i === index ? value : activity)
    }));
  };

  const duplicateEvent = (sourceEvent: FirebaseEvent) => {
    setNewEvent({
      title: `${sourceEvent.title || 'Untitled'} (Copy)`,
      subtitle: sourceEvent.subtitle || '',
      activityLabel: sourceEvent.activityLabel || 'Which aspect would you like to rate?',
      feedbackLabel: sourceEvent.feedbackLabel || 'Share your thoughts',
      feedbackPlaceholder: sourceEvent.feedbackPlaceholder || 'Tell us about your experience...',
      activities: [...(sourceEvent.activities || [''])],
      theme: { ...getEventTheme(sourceEvent) }
    });
    setShowCreateModal(true);
  };

  // Prevent rendering until mounted to avoid hydration issues
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading events...</div>
      </div>
    );
  }
  
  // Mock data for demonstration - in real app this would come from Firebase
  const eventStats: Record<string, { responses: number; avgRating: number; sentiment: number }> = {
    "twise-night": { responses: 47, avgRating: 4.3, sentiment: 78 },
    "sam-wedding": { responses: 23, avgRating: 4.8, sentiment: 92 },
    "techflow-demo": { responses: 15, avgRating: 4.1, sentiment: 67 }
  };

  const generateQRCode = (eventId: string) => {
    return `https://twise-feedback.vercel.app/event/${eventId}`;
  };

  const generateQRCodeImage = async (eventId: string) => {
    try {
      const url = generateQRCode(eventId);
      const qrDataURL = await QRCodeLib.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const showQRCode = async (event: FirebaseEvent) => {
    setSelectedEvent(event);
    const qrDataURL = await generateQRCodeImage(event.id);
    setQrCodeDataURL(qrDataURL);
    setShowQRModal(true);
  };

  const downloadQRCode = () => {
    if (!qrCodeDataURL || !selectedEvent) return;
    
    const link = document.createElement('a');
    link.download = `${selectedEvent.title.replace(/[^a-zA-Z0-9]/g, '-')}-QRCode.png`;
    link.href = qrCodeDataURL;
    link.click();
  };

  const copyQRUrl = async (eventId: string) => {
    const url = generateQRCode(eventId);
    try {
      await navigator.clipboard.writeText(url);
      alert('URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const getStatusColor = (responses: number) => {
    if (responses === 0) return 'bg-gray-500/20 text-gray-400';
    if (responses < 10) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-green-500/20 text-green-400';
  };

  const getStatus = (responses: number) => {
    if (responses === 0) return 'Draft';
    if (responses < 10) return 'Starting';
    return 'Active';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Universal Feedback Platform
              </span>
            </h1>
            <p className="text-gray-400 mt-2">Manage all your AI-powered feedback systems</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create New Event
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <BarChart className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Total Events</h3>
                <p className="text-2xl font-bold text-blue-400">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Total Responses</h3>
                <p className="text-2xl font-bold text-green-400">
                  {Object.values(eventStats).reduce((sum, stat) => sum + stat.responses, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Star className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Avg Rating</h3>
                <p className="text-2xl font-bold text-purple-400">
                  {events.length > 0 ? (Object.values(eventStats).reduce((sum, stat) => sum + stat.avgRating, 0) / events.length).toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => {
            const stats = eventStats[event.id] || { responses: 0, avgRating: 0, sentiment: 0 };
            
            const eventTheme = getEventTheme(event);
            
            return (
              <div key={event.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
                {/* Event Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1 truncate">{event.title}</h3>
                    <p className="text-gray-400 text-sm">{event.subtitle}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${eventTheme.buttonGradient} flex-shrink-0 ml-2`}></div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(stats.responses)}`}>
                      {getStatus(stats.responses)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Responses:</span>
                    <span className="text-white font-medium">{stats.responses}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Avg Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-medium">{stats.avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Sentiment:</span>
                    <span className="text-white font-medium">{stats.sentiment}%</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Categories:</span>
                    <span className="text-white font-medium">{event.activities?.length || 0}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Link 
                      href={`/admin/${event.id}`}
                      className={`flex-1 bg-gradient-to-r ${eventTheme.buttonGradient} hover:opacity-90 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1 transition-opacity`}
                    >
                      <Eye className="w-4 h-4" />
                      Dashboard
                    </Link>
                    
                    <button
                      onClick={() => showQRCode(event)}
                      className="bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1 transition-colors"
                      title="Show QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                      QR Code
                    </button>
                  </div>
                  
                  {/* Management Buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => duplicateEvent(event)}
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 py-1.5 px-2 rounded text-xs flex items-center justify-center gap-1 transition-colors"
                      title="Duplicate Event"
                    >
                      <Copy className="w-3 h-3" />
                      Clone
                    </button>
                    
                    {event.isCustom && (
                      <>
                        <button
                          onClick={() => startEditing(event)}
                          className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 py-1.5 px-2 rounded text-xs flex items-center justify-center gap-1 transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        
                        <button
                          onClick={() => deleteEvent(event)}
                          className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-1.5 px-2 rounded text-xs flex items-center justify-center gap-1 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </>
                    )}
                    
                    {!event.isCustom && (
                      <div className="flex-1 bg-gray-600/20 text-gray-500 py-1.5 px-2 rounded text-xs flex items-center justify-center gap-1">
                        <span className="text-xs">Template</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* QR Code URL */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate flex-1 mr-2">
                      {generateQRCode(event.id)}
                    </p>
                    <button
                      onClick={() => copyQRUrl(event.id)}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* QR Code Modal */}
        {showQRModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  QR Code
                </h2>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {selectedEvent.subtitle}
                  </p>
                </div>

                {/* QR Code Image */}
                {qrCodeDataURL && (
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <Image 
                      src={qrCodeDataURL} 
                      alt="QR Code" 
                      width={256}
                      height={256}
                      className="w-64 h-64"
                    />
                  </div>
                )}

                {/* URL */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 break-all">
                    {generateQRCode(selectedEvent.id)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={downloadQRCode}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </button>
                  
                  <Link
                    href={`/event/${selectedEvent.id}`}
                    target="_blank"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Test Form
                  </Link>
                </div>

                <button
                  onClick={() => copyQRUrl(selectedEvent.id)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copy URL to Clipboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Event Modal */}
        {(showCreateModal || editingEvent) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingEvent(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Event Title *</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="My Amazing Event"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={newEvent.subtitle}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Brief description..."
                    />
                  </div>
                </div>

                {/* Custom Labels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Activity Label</label>
                    <input
                      type="text"
                      value={newEvent.activityLabel}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, activityLabel: e.target.value }))}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Feedback Label</label>
                    <input
                      type="text"
                      value={newEvent.feedbackLabel}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, feedbackLabel: e.target.value }))}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                {/* Feedback Placeholder */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Feedback Placeholder</label>
                  <input
                    type="text"
                    value={newEvent.feedbackPlaceholder}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, feedbackPlaceholder: e.target.value }))}
                    className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                {/* Activities */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Activities/Categories</label>
                  <div className="space-y-2">
                    {(newEvent.activities || ['']).map((activity, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => updateActivity(index, e.target.value)}
                          className="flex-1 bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder={`Activity ${index + 1}`}
                        />
                        {(newEvent.activities || []).length > 1 && (
                          <button
                            onClick={() => removeActivity(index)}
                            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 p-2 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addActivity}
                      className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 py-2 rounded text-sm transition-colors"
                    >
                      + Add Activity
                    </button>
                  </div>
                </div>

                {/* Theme Selector */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Theme</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {themePresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => setNewEvent(prev => ({ ...prev, theme: preset.theme }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          JSON.stringify(newEvent.theme) === JSON.stringify(preset.theme)
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className={`w-full h-8 rounded bg-gradient-to-r ${preset.theme.background} mb-2`}></div>
                        <div className="text-white text-xs font-medium">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Preview</label>
                  <div className={`bg-gradient-to-br ${newEvent.theme.background} p-4 rounded-lg`}>
                    <h3 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${newEvent.theme.titleGradient} mb-2`}>
                      {newEvent.title || 'Event Title'}
                    </h3>
                    <p className="text-gray-300 mb-4">{newEvent.subtitle || 'Event subtitle'}</p>
                    <div className={`bg-gradient-to-r ${newEvent.theme.buttonGradient} text-white px-4 py-2 rounded text-sm inline-block`}>
                      Sample Button
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingEvent(null);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingEvent ? saveEdit : createEvent}
                    disabled={!newEvent.title.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {editingEvent ? 'Save Changes' : 'Create Event'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;