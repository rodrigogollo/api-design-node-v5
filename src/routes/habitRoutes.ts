import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.ts';
import { z } from 'zod';

const createHabitSchema = z.object({
  name: z.string()
})

const completeParamsSchema = z.object({
  id: z.string().max(3)
})

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'habits' })
})

router.get('/:id', (req, res) => {
  res.json({ message: 'get one habits' })
})

// middleware can be inside an array
router.post('/', validateBody(createHabitSchema), (req, res) => {
  res.status(201).json({ message: 'created habit' })
})

router.delete('/:id', (req, res) => {
  res.status(200).json({ message: 'deleted habit' })
})

const validationMiddlewares = [validateParams(completeParamsSchema), validateBody(createHabitSchema)];

router.post('/:id/complete', validationMiddlewares, (req, res) => {
  res.status(201).json({ message: 'completed habit' })
})

export default router;
