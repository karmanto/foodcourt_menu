import { prisma } from '@/prisma/db'
import fs from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route' 
import { put, del } from '@vercel/blob' 

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

    // Validasi field
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
      const filename = `${Date.now()}-${uploadedFile.name}`

      // Upload file baru ke Vercel Blob
      const blob = await put(filename, uploadedFile, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      })
      newPicUrl = blob.url

      // Hapus file lama dari Blob jika ada
      if (existingMenu.pic_url) {
        try {
          await del(existingMenu.pic_url, {
            token: process.env.BLOB_READ_WRITE_TOKEN
          })
        } catch (error) {
          console.error('Gagal menghapus file lama:', error)
        }
      }
    }

    const updateData = {
      name: name as string,
      desc: desc as string,
      price,
      category: { connect: { id: categoryId } },
      ...(newPicUrl && { pic_url: newPicUrl })
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
    const menuToDelete = await prisma.menu.findUnique({
      where: { id },
    })

    if (!menuToDelete) {
      return new Response('Menu not found', { status: 404 })
    }

    // Hapus file dari Blob jika ada
    if (menuToDelete.pic_url) {
      try {
        await del(menuToDelete.pic_url, {
          token: process.env.BLOB_READ_WRITE_TOKEN
        })
      } catch (error) {
        console.error('Gagal menghapus file:', error)
      }
    }

    // Hapus data dari database
    const deletedMenu = await prisma.menu.delete({
      where: { id },
    })

    return new Response(JSON.stringify(deletedMenu), { status: 200 })
  } catch (error) {
    console.error('Error deleting menu:', error)
    return new Response('Failed to delete menu', { status: 500 })
  }
}
