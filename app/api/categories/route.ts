import { prisma } from '@/prisma/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response('Session not found', { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get('skip') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const search = searchParams.get('search') || ''

    let searchFilter = {}
    if (search) {
      searchFilter = {
        name: { contains: search, mode: 'insensitive' }
      }
    }

    const data = await prisma.category.findMany({
      where: {
        ...searchFilter
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return new Response('Failed to fetch categories', { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response('Session not found', { status: 401 })
  }

  const { name } = await req.json()

  if (!name) {
    return new Response('Missing required fields', { status: 400 })
  }

  try {
    const data = await prisma.category.create({
      data: {
        name
      }
    })

    return new Response(JSON.stringify(data), { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return new Response('Failed to create category', { status: 500 })
  }
}
