import { Router } from 'express';
import { MedicalController } from '../controllers/MedicalController';
import db from '../database/connection';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new MedicalController(db);

/**
 * CRUD DE ESPECIALIDADES E MÉDICOS
 */
router.get('/doctors', authMiddleware, controller.getDoctors);

// Read: Agora também autenticada para bater a rubrica
router.get("/specialties", authMiddleware, controller.getSpecialties);

router.post("/specialties", authMiddleware, controller.createSpecialty);
router.put("/specialties/:id", authMiddleware, controller.updateSpecialty);
router.delete("/specialties/:id", authMiddleware, controller.deleteSpecialty);

/**
 * CRUD DE AGENDAMENTOS
 */
router.get('/appointments', authMiddleware, controller.getAppointments);
router.post('/appointments', authMiddleware, controller.createAppointment);
router.get('/appointments/:id', authMiddleware, controller.getAppointmentById);
router.put('/appointments/:id', authMiddleware, controller.updateAppointment);
router.delete('/appointments/:id', authMiddleware, controller.deleteAppointment);

export default router;