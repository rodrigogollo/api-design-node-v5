import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'users' })
})

router.get('/:id', (req, res) => {
  res.json({ message: 'get one user' })
})

router.put('/:id', (req, res) => {
  res.status(201).json({ message: 'updated user' })
})

router.delete('/:id', (req, res) => {
  res.status(200).json({ message: 'deleted user' })
})

export default router;
