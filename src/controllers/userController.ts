import type { AuthenticatedRequest } from "../middleware/auth.ts";
import type { Response } from 'express';
import db from "../db/connection.ts";
import { and, desc, eq, ilike, SQL } from "drizzle-orm";
import { users } from "../db/schema.ts";
import { hashPassword } from "../utils/passwords.ts";

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const name = req.query?.name as string;
    const email = req.query?.email as string;

    const filters: SQL[] = [];
    if (name) filters.push(ilike(users.firstName, `%${name}%`));
    if (email) filters.push(ilike(users.email, `%${email}%`));

    const usersResult = await db.query.users.findMany({
      where: and(...filters),
      columns: {
        password: false,
      },
      orderBy: [desc(users.createdAt)],
    })

    return res.json({ users: usersResult ?? [] }).status(200)
  } catch (e) {
    console.error('Get users error', e);
    res.status(500).json({
      error: 'Failed to fetch users'
    })
  }
}

export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const usersResult = await db.query.users.findFirst({
      where: eq(users.id, req.params.id),
      columns: {
        id: true,
        email: true,
        username: true,
        password: false,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return res.json({ users: usersResult ?? [] }).status(200)

  } catch (e) {
    console.error('Get user by id error', e);
    res.status(500).json({
      error: 'Failed to fetch user'
    })
  }
}

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { ...updates } = req.body;

    const password = req.body.password;
    if (password) {
      updates.password = await hashPassword(password)
    }

    const result = await db.transaction(async (tx) => {
      const [updatedUser] = await tx
        .update(users)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        // validate if user id exists, and also if user id == logged id
        .where(and(eq(users.id, id), eq(users.id, req.user.id)))
        .returning()

      if (!updatedUser) {
        res.status(401).end()
      }

      return updatedUser;
    })

    res.json({
      message: 'User was updated',
      user: result,
    })

  } catch (e) {
    console.error('Update user error', e)
    res.status(500).json({
      error: 'Failed to update user'
    })
  }
}


export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;

    const result = await db.transaction(async (tx) => {
      const deletedUser = await tx
        .update(users)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(and(eq(users.id, id), eq(users.id, req.user.id)))
        .returning()

      if (!deletedUser) {
        res.status(401).end()
      }

      return deletedUser;
    })

    res.json({
      message: 'User was deactivated',
      user: result,
    })

  } catch (e) {
    console.error('Delete user error', e)
    res.status(500).json({
      error: 'Failed to delete user'
    })
  }
}
