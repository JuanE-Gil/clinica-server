import { Router } from 'express';
import { UserController } from '../../controllers/user.controller.js';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Solo administradores pueden gestionar usuarios
router.use(checkRole(['admin']));

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
