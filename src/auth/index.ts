// Mock auth implementation
export async function getSession() {
  // Mock session for development
  return null
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'user'
}

export interface Session {
  user: User
}