import { prisma } from '@/prisma/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route' 

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const id = Number(params.id)

  try {
    const data = await prisma.discount.findFirst({
      where: { id }
    })

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    console.error('Error fetching discount:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { name, value, startPeriod, endPeriod } = await req.json()
  const id = Number(params.id)

  if (!name || !value || !startPeriod || !endPeriod) {
    return new Response('Missing required fields', { status: 400 })
  }

  try {
    const data = await prisma.discount.update({
      where: { id },
      data: {
        name,
        value,
        startPeriod: new Date(startPeriod),
        endPeriod: new Date(endPeriod)
      }
    })

    return new Response(JSON.stringify(data), { status: 201 })
  } catch (error) {
    console.error('Error updating discount:', error)
    return new Response('Failed to update discount', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const id = Number(params.id)

  try {
    const data = await prisma.discount.delete({
      where: { id }
    })

    return new Response(JSON.stringify(data), { status: 201 })
  } catch (error) {
    console.error('Error deleting discount:', error)
    return new Response('Failed to delete discount', { status: 500 })
  }
}
