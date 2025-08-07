// Event management routes
import { dbService } from '../config/firebase-admin.js';

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await dbService.get('events');
    const eventsArray = Object.entries(events).map(([id, data]) => ({
      ...data,
      firebaseId: id
    }));

    res.json({
      success: true,
      count: eventsArray.length,
      data: eventsArray
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      message: error.message
    });
  }
};

// Get specific event
export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find event by firebaseId first
    const events = await dbService.get('events');
    let event = null;
    let firebaseId = null;

    // Check if id is a firebase ID
    if (events[id]) {
      event = events[id];
      firebaseId = id;
    } else {
      // Search by event.id field
      const eventEntry = Object.entries(events).find(([, data]) => data.id === id);
      if (eventEntry) {
        [firebaseId, event] = eventEntry;
      }
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...event,
        firebaseId
      }
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event',
      message: error.message
    });
  }
};

// Create new event
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      activities,
      theme,
      activityLabel,
      feedbackLabel,
      feedbackPlaceholder
    } = req.body;

    // Validate required fields
    if (!title || !activities || !Array.isArray(activities)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['title', 'activities']
      });
    }

    // Generate event ID from title
    const eventId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Create event data
    const eventData = {
      id: eventId,
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      activities: activities.filter(a => a.trim()).map(a => a.trim()),
      theme: theme || {
        background: 'from-indigo-900 via-purple-900 to-blue-900',
        titleGradient: 'from-indigo-300 to-purple-300',
        buttonGradient: 'from-indigo-600 to-purple-600',
        buttonHover: 'from-indigo-700 to-purple-700',
        accent: 'indigo-400'
      },
      activityLabel: activityLabel || 'Which aspect would you like to rate?',
      feedbackLabel: feedbackLabel || 'Share your thoughts',
      feedbackPlaceholder: feedbackPlaceholder || 'Tell us about your experience...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firebase
    const result = await dbService.save('events', eventData);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        ...eventData,
        firebaseId: result.id
      }
    });

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event',
      message: error.message
    });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get existing event to preserve data
    const events = await dbService.get('events');
    let firebaseId = null;
    let existingEvent = null;

    // Find event by Firebase ID or event.id
    if (events[id]) {
      firebaseId = id;
      existingEvent = events[id];
    } else {
      const eventEntry = Object.entries(events).find(([, data]) => data.id === id);
      if (eventEntry) {
        [firebaseId, existingEvent] = eventEntry;
      }
    }

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Merge updates with existing data
    const updatedEvent = {
      ...existingEvent,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // If title changed, update ID
    if (updates.title && updates.title !== existingEvent.title) {
      updatedEvent.id = updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Save updates
    await dbService.save(`events/${firebaseId}`, updatedEvent);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: {
        ...updatedEvent,
        firebaseId
      }
    });

  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event',
      message: error.message
    });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing event to confirm it exists
    const events = await dbService.get('events');
    let firebaseId = null;

    // Find event by Firebase ID or event.id
    if (events[id]) {
      firebaseId = id;
    } else {
      const eventEntry = Object.entries(events).find(([, data]) => data.id === id);
      if (eventEntry) {
        [firebaseId] = eventEntry;
      }
    }

    if (!firebaseId) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Delete the event
    await dbService.delete(`events/${firebaseId}`);

    // Also delete all associated feedback
    const feedback = await dbService.get(`events/${firebaseId}/feedback`);
    if (feedback && Object.keys(feedback).length > 0) {
      await dbService.delete(`events/${firebaseId}/feedback`);
    }

    res.json({
      success: true,
      message: 'Event and associated feedback deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event',
      message: error.message
    });
  }
};

export default {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
};
