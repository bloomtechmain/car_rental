import { Router } from 'express';
import { createVehicle, getVehicles, getVehiclesByOwner } from '../controllers/vehicleController.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', upload.single('image'), createVehicle);
router.get('/', getVehicles);
router.get('/my-vehicles/:owner_id', getVehiclesByOwner);

export default router;
