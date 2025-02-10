import { prisma } from '@/prisma/db'
import fs from 'fs'
import path from 'path'
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
    const menu = await prisma.menu.findUnique({
      where: { id },
    })

    if (!menu) {
      return new Response('Menu not found', { status: 404 })
    }

    return new Response(JSON.stringify(menu), { status: 200 })
  } catch (error) {
    console.error('Error fetching menu:', error)
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

  const id = Number(params.id)

  try {
    const existingMenu = await prisma.menu.findUnique({
      where: { id },
    })

    if (!existingMenu) {
      return new Response('Menu not found', { status: 404 })
    }

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

    let newPicUrl: string | undefined = undefined

    const file = formData.get('pic')
    if (file && typeof file !== 'string') {
      const uploadedFile = file as File
      const extension = uploadedFile.name.split('.').pop()
      const fileName = `${Date.now()}.${extension}`
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      const filePath = path.join(uploadsDir, fileName)
      const buffer = Buffer.from(await uploadedFile.arrayBuffer())
      fs.writeFileSync(filePath, buffer)

      newPicUrl = `/uploads/${fileName}`

      if (existingMenu.pic_url) {
        const oldFilePath = path.join(process.cwd(), 'public', existingMenu.pic_url)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }
    }

    const updateData: any = {
      name: name as string,
      desc: desc as string,
      price,
      category: {
        connect: { id: categoryId },
      },
    }

    if (newPicUrl) {
      updateData.pic_url = newPicUrl
    }

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: updateData,
    })

    return new Response(JSON.stringify(updatedMenu), { status: 200 })
  } catch (error) {
    console.error('Error updating menu:', error)
    return new Response('Failed to update menu', { status: 500 })
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
    // Cari data Menu yang akan dihapus
    const menuToDelete = await prisma.menu.findUnique({
      where: { id },
    })

    if (!menuToDelete) {
      return new Response('Menu not found', { status: 404 })
    }

    // Jika ada file gambar yang tersimpan, hapus dari folder uploads
    if (menuToDelete.pic_url) {
      const filePath = path.join(process.cwd(), 'public', menuToDelete.pic_url)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    // Hapus data Menu dari database
    const deletedMenu = await prisma.menu.delete({
      where: { id },
    })

    return new Response(JSON.stringify(deletedMenu), { status: 200 })
  } catch (error) {
    console.error('Error deleting menu:', error)
    return new Response('Failed to delete menu', { status: 500 })
  }
}
