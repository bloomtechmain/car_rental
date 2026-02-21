import { Router } from 'express';
import { createBooking, getBookingsByRenter, getHireOutsByOwner, updateBookingStatus } from '../controllers/bookingController.js';
import { createPreJourneyCheck } from '../controllers/preJourneyCheckController.js';
import upload from '../middleware/multer.js';

const router = Router();

router.post('/', createBooking);
router.get('/my-bookings/:renter_id', getBookingsByRenter);
router.get('/hire-outs/:owner_id', getHireOutsByOwner); // New endpoint for owners
router.put('/:id/status', updateBookingStatus); // Endpoint to approve/reject

export default router;
