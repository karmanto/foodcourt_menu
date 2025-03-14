import { prisma } from '@/prisma/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { put } from '@vercel/blob'
import sharp from 'sharp'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get('skip') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const search = searchParams.get('search') || ''
    const categoryParam = searchParams.get('categoryId')

    let searchFilter = {}
    if (search) {
      searchFilter = {
        name: { contains: search, mode: 'insensitive' }
      }
    }

    let categoryFilter = {}
    if (categoryParam) {
      const categoryId = parseInt(categoryParam, 10)
      categoryFilter = { categoryId }
    }

    const menus = await prisma.menu.findMany({
      where: {
        ...searchFilter,
        ...categoryFilter
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    return new Response(JSON.stringify(menus), { status: 200 })
  } catch (error) {
    console.error('Error fetching menus:', error)
    return new Response('Failed to fetch menus', { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response('Session not found', { status: 401 })
  }

  try {
    const formData = await req.formData()

    const name = formData.get('name')
    const desc = formData.get('desc')
    const priceStr = formData.get('price')
    const categoryIdStr = formData.get('categoryId')

    if (!name || !desc || !priceStr || !categoryIdStr) {
      return new Response('Missing required fields', { status: 400 })
    }

    const price = parseFloat(priceStr as string)
    const categoryId = parseInt(categoryIdStr as string, 10)

    // Ambil field favorite jika dikirim, default false jika tidak ada
    const favoriteStr = formData.get('favorite')
    const favorite = favoriteStr
      ? (favoriteStr === 'true' || favoriteStr === '1')
      : false

    const file = formData.get('pic')
    if (!file || typeof file === 'string') {
      return new Response('Image file is required', { status: 400 })
    }

    const uploadedFile = file as File
    
    if (!uploadedFile.type.startsWith('image/')) {
      return new Response('Invalid file type', { status: 400 })
    }

    const arrayBuffer = await uploadedFile.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    const resizedBuffer = await sharp(inputBuffer)
      .resize({ width: 600, fit: 'inside' }) 
      .toBuffer()

    const filename = `${Date.now()}-${uploadedFile.name}`

    const blob = await put(filename, resizedBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    })

    const menu = await prisma.menu.create({
      data: {
        name: name as string,
        desc: desc as string,
        price,
        pic_url: blob.url, 
        favorite, // memasukkan nilai favorite
        category: {
          connect: { id: categoryId }
        }
      }
    })

    return new Response(JSON.stringify(menu), { status: 201 })
  } catch (error) {
    console.error('Error creating menu:', error)
    return new Response('Failed to create menu', { status: 500 })
  }
}
