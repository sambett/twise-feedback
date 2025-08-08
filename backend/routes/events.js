// Event management routes
import { dbService } from '../config/database.js';

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await dbService.getEvents();

    res.json({
      success: true,
      count: events.length,
      data: events
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
    
    const event = await dbService.getEvent(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
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
      feedbackPlaceholder,
      isCustom
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
      isCustom: isCustom !== false // Default to true unless explicitly set to false
    };

    // Save to MySQL
    const result = await dbService.saveEvent(eventData);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        ...eventData,
        id: result.id
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

    // Get existing event to check if it exists
    const existingEvent = await dbService.getEvent(id);

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
      id: existingEvent.id // Keep original ID
    };

    // If title changed, generate new ID
    if (updates.title && updates.title !== existingEvent.title) {
      updatedEvent.id = updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Save updates
    const result = await dbService.saveEvent(updatedEvent);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: await dbService.getEvent(updatedEvent.id)
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

    // Check if event exists
    const existingEvent = await dbService.getEvent(id);

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Delete the event (CASCADE will delete associated feedback)
    await dbService.deleteEvent(id);

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
