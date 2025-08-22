import express from 'express';
import Event from '../models/Event.js';
import { processEvent } from '../services/notificationService.js';
import { validateUserId, generateId, handleAsyncError } from '../utils/helpers.js';

const router = express.Router();

// Create a new event
router.post('/', handleAsyncError(async (req, res) => {
  const { type, sourceUserId, targetUserId, data = {} } = req.body;

  // Validation
  if (!type || !['like', 'comment', 'follow', 'post'].includes(type)) {
    return res.status(400).json({ error: 'Invalid event type' });
  }

  if (!validateUserId(sourceUserId)) {
    return res.status(400).json({ error: 'Invalid source user ID' });
  }

  if (type !== 'post' && !validateUserId(targetUserId)) {
    return res.status(400).json({ error: 'Invalid target user ID' });
  }

  // Create event
  const eventId = generateId('event');
  const event = new Event({
    eventId,
    type,
    sourceUserId,
    targetUserId: type === 'post' ? null : targetUserId,
    data: new Map(Object.entries(data))
  });

  await event.save();

  // Process event immediately for POC (in production, this would be queued)
  try {
    await processEvent(event);
    await event.markAsProcessed();
  } catch (error) {
    console.error('Error processing event:', error);
    await event.incrementRetry(error.message);
  }

  res.status(201).json({
    message: 'Event created and processed successfully',
    event: {
      eventId: event.eventId,
      type: event.type,
      sourceUserId: event.sourceUserId,
      targetUserId: event.targetUserId,
      processed: event.processed,
      createdAt: event.createdAt
    }
  });
}));

// Get events (for debugging/admin purposes)
router.get('/', handleAsyncError(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    type, 
    sourceUserId, 
    targetUserId, 
    processed 
  } = req.query;

  const query = {};
  if (type) query.type = type;
  if (sourceUserId) query.sourceUserId = sourceUserId;
  if (targetUserId) query.targetUserId = targetUserId;
  if (processed !== undefined) query.processed = processed === 'true';

  const events = await Event.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .lean();

  const total = await Event.countDocuments(query);

  res.json({
    events: events.map(event => ({
      ...event,
      data: Object.fromEntries(event.data || new Map())
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

// Get event by ID
router.get('/:eventId', handleAsyncError(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findOne({ eventId }).lean();
  
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.json({
    ...event,
    data: Object.fromEntries(event.data || new Map())
  });
}));

// Retry failed event processing
router.post('/:eventId/retry', handleAsyncError(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findOne({ eventId });
  
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (event.processed) {
    return res.status(400).json({ error: 'Event already processed' });
  }

  try {
    await processEvent(event);
    await event.markAsProcessed();
    
    res.json({ 
      message: 'Event processed successfully',
      event: {
        eventId: event.eventId,
        processed: event.processed,
        processedAt: event.processedAt
      }
    });
  } catch (error) {
    await event.incrementRetry(error.message);
    res.status(500).json({ 
      error: 'Failed to process event',
      message: error.message
    });
  }
}));

// Get pending events (for monitoring)
router.get('/status/pending', handleAsyncError(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const pendingEvents = await Event.getPendingEvents(parseInt(limit));
  
  res.json({
    pendingCount: pendingEvents.length,
    events: pendingEvents.map(event => ({
      eventId: event.eventId,
      type: event.type,
      sourceUserId: event.sourceUserId,
      targetUserId: event.targetUserId,
      retryCount: event.retryCount,
      createdAt: event.createdAt,
      errorMessage: event.errorMessage
    }))
  });
}));

export default router;