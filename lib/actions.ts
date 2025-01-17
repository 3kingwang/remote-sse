'use server'

import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { loginSchema } from './schema'

const users = [
  { id: '1', username: 'test2', password: '123456' },
  { id: '2', username: 'xwang72', password: 'xwang72' },
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
