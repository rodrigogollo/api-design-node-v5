import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.ts';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.ts';
import { createHabit, getUserHabits, updateHabit } from '../controllers/habitController.ts';

const createHabitSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  frequency: z.string(),
  targetCount: z.number().optional(),
  tagIds: z.array(z.string()).optional(),
})

const updateHabitSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  frequency: z.string().optional(),
  targetCount: z.number().optional(),
  tagIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
})

const completeParamsSchema = z.object({
  id: z.string().max(3)
})

const router = Router();
router.use(authenticateToken)

router.get('/', getUserHabits)

router.get('/:id', (req, res) => {
  res.json({ message: 'get one habits' })
})

router.post('/', validateBody(createHabitSchema), createHabit)
router.patch('/:id', validateBody(updateHabitSchema), updateHabit)

router.delete('/:id', (req, res) => {
  res.status(200).json({ message: 'deleted habit' })
})

// middleware can be inside an array
const validationMiddlewares = [validateParams(completeParamsSchema), validateBody(createHabitSchema)];

router.post('/:id/complete', validationMiddlewares, (req, res) => {
  res.status(201).json({ message: 'completed habit' })
})

export default router;
