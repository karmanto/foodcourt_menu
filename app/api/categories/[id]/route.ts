import { prisma } from '@/prisma/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route' 

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id)

  try {
    const data = await prisma.category.findFirst({
      where: { id }
    })

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    console.error('Error fetching category:', error)
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

  const { name } = await req.json()
  const id = Number(params.id)

  if (!name) {
    return new Response('Missing required fields', { status: 400 })
  }

  try {
    const data = await prisma.category.update({
      where: { id },
      data: {
        name
      }
    })

    return new Response(JSON.stringify(data), { status: 201 })
  } catch (error) {
    console.error('Error updating category:', error)
    return new Response('Failed to update category', { status: 500 })
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
    const data = await prisma.category.delete({
      where: { id }
    })

    return new Response(JSON.stringify(data), { status: 201 })
  } catch (error) {
    console.error('Error deleting category:', error)
    return new Response('Failed to delete category', { status: 500 })
  }
}