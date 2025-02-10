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
    const monthParam = searchParams.get('month')
    const yearParam = searchParams.get('year')
    const search = searchParams.get('search') || ''

    let dateFilter = {}
    if (monthParam && yearParam) {
      const month = parseInt(monthParam, 10)
      const year = parseInt(yearParam, 10)
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 1)
      dateFilter = {
        startPeriod: {
          gte: startDate,
          lt: endDate
        }
      }
    }

    let searchFilter = {}
    if (search) {
      searchFilter = {
        name: { contains: search, mode: 'insensitive' }
      }
    }

    const data = await prisma.discount.findMany({
      where: {
        ...dateFilter,
        ...searchFilter
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    console.error('Error fetching discounts:', error)
    return new Response('Failed to fetch discounts', { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response('Session not found', { status: 401 })
  }

  const { name, value, startPeriod, endPeriod } = await req.json()

  try {
    const data = await prisma.discount.create({
      data: {
        name,
        value,
        startPeriod: new Date(startPeriod),
        endPeriod: new Date(endPeriod)
      }
    })

    return new Response(JSON.stringify(data), { status: 201 })
  } catch (error) {
    console.error('Error creating discount:', error)
    return new Response('Failed to create discount', { status: 500 })
  }
}