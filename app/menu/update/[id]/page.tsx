'use client'
import Loading from '@/components/Loading/Loading'
import { containerVariant } from '@/lib/framer-motion/variants'
import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import { getSingleMenuFn, updateMenuFn } from '@/lib/api/menus'
import { Menu } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, HTMLMotionProps } from 'framer-motion'
import Link from 'next/link'
import { notFound, useParams, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setTitle } from '@/lib/features/LayoutState/LayoutSlice'
import { useSession } from 'next-auth/react'

interface Notification {
  message: string
  type: 'success' | 'error'
}

export default function UpdateMenuPage() {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [picFile, setPicFile] = useState<File | null>(null)
  const [currentPicUrl, setCurrentPicUrl] = useState('')
  const [notification, setNotification] = useState<Notification | null>(null)

  const router = useRouter()
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const { data: session, status } = useSession()
  const { id } = useParams()

  // Ambil data Menu berdasarkan ID
  const { data, isLoading: valuesLoading } = useQuery<Menu>({
    queryKey: ['singleMenu', id],
    queryFn: () => getSingleMenuFn(id)
  })

  // Ambil data kategori (fetch ulang setiap render)
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      if (!res.ok) {
        throw new Error('Failed to fetch categories')
      }
      return res.json()
    }
  })

  useEffect(() => {
    dispatch(setTitle("update menu"))
  }, [dispatch])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(AppRoutes.Auth)
    }
  }, [status, router])

  // Set state form dengan data yang diambil
  useEffect(() => {
    if (data) {
      setName(data.name)
      setDesc(data.desc)
      setPrice(data.price.toString())
      setSelectedCategory(data.categoryId.toString())
      setCurrentPicUrl(data.pic_url)
    }
  }, [data])

  // Notifikasi akan hilang setelah 2 detik
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const updateMenuMutation = useMutation({
    mutationFn: updateMenuFn,
    onMutate: async (newMenu) => {
      await queryClient.cancelQueries({ queryKey: ['menus'] })
      const previousMenus = queryClient.getQueryData<Menu[]>(['menus'])
      if (previousMenus) {
        const updatedMenus = previousMenus.map((menu) =>
          menu.id === newMenu.id
            ? { ...menu, ...newMenu }
            : menu
        )
        queryClient.setQueryData<Menu[]>(['menus'], updatedMenus)
      }
      return { previousMenus }
    },
    onError: (err, variables, context: { previousMenus?: Menu[] } | undefined) => {
      if (context?.previousMenus) {
        queryClient.setQueryData<Menu[]>(['menus'], context.previousMenus)
      }
      setNotification({
        message: "Update menu gagal. Silakan coba lagi.",
        type: 'error'
      })
    },
    onSuccess: () => {
      setNotification({
        message: "Menu updated successfully!",
        type: 'success'
      })
      // Redirect setelah notifikasi sukses tampil selama 2 detik
      setTimeout(() => {
        router.push(AppRoutes.Menu)
      }, 2000)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    }
  })

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Reset notifikasi sebelumnya
    setNotification(null)

    // Validasi field wajib
    if (!name || !desc || !price || !selectedCategory) {
      setNotification({ message: 'Semua field wajib diisi.', type: 'error' })
      return
    }

    // Validasi harga harus berupa angka yang valid dan lebih dari 0
    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setNotification({
        message: 'Harga harus angka valid dan lebih dari 0',
        type: 'error'
      })
      return
    }

    const updateData: {
      id: number
      name: string
      desc: string
      price: number
      categoryId: number
      pic?: File
    } = {
      id: Number(id),
      name,
      desc,
      price: parsedPrice,
      categoryId: parseInt(selectedCategory, 10)
    }

    if (picFile) {
      updateData.pic = picFile
    }

    updateMenuMutation.mutate(updateData)
  }

  if (valuesLoading || categoriesLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loading />
      </div>
    )
  }
  if (!data) throw notFound()

  return (
    <motion.section
      variants={containerVariant}
      initial="hidden"
      animate="visible"
      {...({ className: 'flex flex-col justify-center items-center h-[80vh] w-full' } as HTMLMotionProps<'section'>)}
    >
      {/* Notifikasi Error/Success */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md text-white ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 flex-col sm:w-2/3 md:w-1/3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Menu Name"
          className="input-primary"
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Menu Description"
          className="input-primary"
          rows={3}
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          placeholder="Price"
          className="input-primary"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-primary"
        >
          <option value="">Select Category</option>
          {categories &&
            categories.map((cat: { id: number; name: string }) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>

        {/* Preview gambar saat ini */}
        {currentPicUrl && (
          <div className="w-full">
            <img
              src={currentPicUrl}
              alt="Current Menu Image"
              className="w-full max-h-48 object-contain mb-2 rounded"
            />
          </div>
        )}

        {/* Custom File Input untuk update gambar (opsional) */}
        <div className="w-full">
          <label
            htmlFor="file-upload"
            className="block w-full cursor-pointer border border-gray-300 rounded-md p-2 text-center bg-gray-50"
          >
            {picFile ? picFile.name : "Select New Image (optional)"}
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setPicFile(e.target.files[0])
              }
            }}
            className="hidden"
          />
        </div>

        <div className="flex gap-1 justify-end">
          <Link href={AppRoutes.Menu} className="btn-primary">
            Cancel
          </Link>
          <button disabled={updateMenuMutation.isLoading} type="submit" className="btn-primary">
            Update
          </button>
        </div>
      </form>
    </motion.section>
  )
}
