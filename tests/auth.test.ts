import request from 'supertest';
import app from '../src/server.ts';
import env from '../env.ts';
import { createTestHabit, createTestUser, cleanupDatabase } from './setup/dbHelpers.ts'

describe('Authentication Endpoints', () => {
  afterEach(async () => {
    cleanupDatabase()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'testemail@test.com',
        username: 'testuser',
        password: 'admin1234',
      }
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body).not.toHaveProperty('password')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should log in with valid credentials', async () => {
      const testUser = await createTestUser()
      const credentials = {
        email: testUser.user.email,
        password: testUser.rawPassword,
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(201)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body).not.toHaveProperty('password')
    })
  })
})
