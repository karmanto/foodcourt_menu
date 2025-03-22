import { prisma } from '@/prisma/db'

export async function GET(
  req: Request,
  { params }: { params: { uuid: string } }
) {
  const uuid = params.uuid

  try {
    const data = await prisma.chair.findUnique({
      where: { uuid },
    })

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    console.error('Error fetching chair:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
