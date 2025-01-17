'use server'

import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { loginSchema } from './schema'

const users = [
  { id: '1', username: 'test2', password: '123456' },
  { id: '2', username: 'xwang72', password: 'xwang72' },
  { id: '3', username: 'zhan5', password: 'zhan5' },
  { id: '4', username: 'gzhu1', password: 'gzhu1' },
  { id: '5', username: 'xwang30', password: 'xwang30' },
  { id: '6', username: 'xchen18', password: 'xchen18' },
  { id: '7', username: 'syang5', password: 'syang5' },
  { id: '8', username: 'hchen9', password: 'hchen9' }
]

export async function login(prevState: unknown, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }

  const { username, password } = result.data

  const user = users.find(
    (u) => u.username === username && u.password === password
  )
  if (!user) {
    return {
      errors: {
        username: ['Invalid username or password'],
      },
    }
  }
  await createSession(user.id, user.username, user.password)

  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
