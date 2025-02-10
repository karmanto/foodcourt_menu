import { prisma } from '@/prisma/db'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]/route'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response('Session not found', { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get('skip') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    
    const data = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit
    })

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return new Response('Failed to fetch users', { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response('Session not found', { status: 401 })
  }

  const { name, email, password, active } = await req.json()

  try {
    const data = await prisma.user.create({
      data: {
        name,
        email,
        password,
        active: active !== undefined ? active : true
      }
    })

    return new Response(JSON.stringify(data), { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return new Response('Failed to create user', { status: 500 })
  }
}
