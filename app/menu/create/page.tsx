'use client'
import { containerVariant } from '@/lib/framer-motion/variants'
import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import { createMenuFn } from '@/lib/api/menus'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, HTMLMotionProps } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setTitle } from '@/lib/features/LayoutState/LayoutSlice'
import { useSession } from 'next-auth/react'

export default function NewMenuPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()

  // State form
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [picFile, setPicFile] = useState<File | null>(null)
  const [favorite, setFavorite] = useState(false) // state baru untuk favorite
  const [isCreating, setIsCreating] = useState(false)
  // State notification (null jika tidak ada notifikasi)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  // Ambil data kategori (fetch ulang setiap render)
  const {
    data: categories,
    isLoading: isCategoriesLoading,
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

  const { mutateAsync: createMenu } = useMutation({
    mutationFn: createMenuFn,
    onSuccess: () => {
      setNotification({ message: "Menu berhasil dibuat!", type: 'success' })
      // Tunggu 2 detik sebelum redirect agar notifikasi terlihat
      setTimeout(() => {
        router.push(AppRoutes.Menu)
        queryClient.invalidateQueries(['menus'])
      }, 2000)
    },
    onError: (error) => {
      console.error(error)
      setNotification({ message: "Gagal membuat menu. Silakan coba lagi.", type: 'error' })
    }
  })

  useEffect(() => {
    dispatch(setTitle("create menu"))
  }, [dispatch])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(AppRoutes.Auth)
    }
  }, [status, router])

  // Hapus notifikasi setelah 2 detik (jika ada)
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Reset notifikasi sebelumnya
    setNotification(null)

    // Validasi: pastikan semua field wajib terisi
    if (!name.trim() || !desc.trim() || !price.trim() || !selectedCategory.trim() || !picFile) {
      setNotification({ message: 'Semua field wajib diisi.', type: 'error' })
      return
    }

    // Validasi: harga harus berupa angka valid dan lebih dari 0
    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setNotification({ message: 'Harga harus angka valid dan lebih dari 0', type: 'error' })
      return
    }

    setIsCreating(true)
    try {
      await createMenu({
        name,
        desc,
        price: parsedPrice,
        categoryId: parseInt(selectedCategory, 10),
        pic: picFile,
        favorite // sertakan nilai favorite di sini
      })
    } catch (err) {
      console.error(err)
      setNotification({ message: "Gagal membuat menu. Silakan coba lagi.", type: 'error' })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <motion.section
      variants={containerVariant}
      initial="hidden"
      animate="visible"
      {...({ className: 'flex flex-col justify-center items-center h-[60vh] w-full' } as HTMLMotionProps<'section'>)}
    >
      <form onSubmit={handleSubmit} className="flex gap-4 flex-col sm:w-2/3 md:w-1/3">
        {/* Inline Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-md text-white ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {notification.message}
          </div>
        )}
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
        {/* Checkbox untuk Favorite */}
        <div className="flex items-center gap-2">
          <input
            id="favorite"
            type="checkbox"
            checked={favorite}
            onChange={(e) => setFavorite(e.target.checked)}
            className="form-checkbox"
          />
          <label htmlFor="favorite">Favorite</label>
        </div>
        {/* Custom File Input */}
        <div className="w-full">
          <label
            htmlFor="file-upload"
            style={{ wordBreak: "break-all", whiteSpace: "normal" }}
            className="block w-full cursor-pointer border border-gray-300 rounded-md p-2 text-center bg-gray-50"
          >
            {picFile ? picFile.name : "Select Image"}
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
          <button disabled={isCreating} type="submit" className="btn-primary">
            Create
          </button>
        </div>
      </form>
    </motion.section>
  )
}
