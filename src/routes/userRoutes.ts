import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.ts';
import { deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/userController.ts';
import { validateBody } from '../middleware/validation.ts';
import { z } from 'zod';

const updateUserSchema = z.object({
  email: z.email().optional(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().optional(),
})

const router = Router();
router.use(authenticateToken)

router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.patch('/:id', validateBody(updateUserSchema), updateUser)
router.delete('/:id', deleteUser)

export default router;
