import { type Response } from 'express';
import { type AuthenticatedRequest } from '../middleware/auth.ts';
import { and, desc, eq } from 'drizzle-orm';
import db from '../db/connection.ts';
import { habits, entries, habitTags, tags } from '../db/schema.ts'

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body;

    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx.insert(habits).values({
        userId: req.user!.id,
        name,
        description,
        frequency,
        targetCount,
      })
        .returning()

      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId) => ({
          habitId: newHabit.id,
          tagId
        }))

        await tx.insert(habitTags).values(habitTagValues);
      }
      return newHabit;
    })

    res.status(201).json({
      message: 'Habit created',
      habit: result
    })
  } catch (e) {
    console.error('Create habit error', e);
    res.status(500).json({
      error: 'Failed to create habit'
    })
  }
}

export const getUserHabits = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userHabitsWithTags = await db.query.habits.findMany({
      where: eq(habits.userId, req.user.id),
      with: {
        tags: {
          with: {
            tag: true
          },
        },
      },
      orderBy: [desc(habits.createdAt)],
    })

    const habitsWithTags = userHabitsWithTags.map(habit => ({
      ...habit,
      tags: habit.tags?.map((ht) => ht.tag),
      // removing field
      habitTags: undefined,
    }))

    return res.json({
      habits: habitsWithTags,
    })
      .status(200)

  } catch (e) {
    console.error('Get habits error', e);
    res.status(500).json({
      error: 'Failed to fetch habits'
    })
  }
}

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { tagIds, ...updates } = req.body;

    const result = await db.transaction(async (tx) => {
      const [updatedHabit] = await tx
        .update(habits)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(habits.id, id), eq(habits.userId, req.user.id)))
        .returning()

      if (!updatedHabit) {
        // could throw and catch it
        // on throw error inside transaction, automatically rolls back
        // throw new Error('Habit not found')
        res.status(401).end()
      }

      if (tagIds != undefined) {
        await tx.delete(habitTags).where(eq(habitTags.habitId, id))

        if (tagIds.length > 0) {
          const habitTagValues = tagIds.map((tagId) => ({
            habitId: id,
            tagId,
          }))

          await tx.insert(habitTags).values(habitTagValues);
        }
      }

      return updatedHabit;
    })

    res.json({
      message: 'Habit was updated',
      habit: result
    })

  } catch (e) {
    console.error('Update habit error', e)
    res.status(500).json({
      error: 'Failed to update habit'
    })
  }
}
