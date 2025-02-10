'use client'
import { containerVariant } from '@/lib/framer-motion/variants'
import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import { createCategoryFn } from '@/lib/api/categories'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, HTMLMotionProps } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setTitle } from '@/lib/features/LayoutState/LayoutSlice'
import { useSession } from 'next-auth/react'

export default function NewCategoryPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()

  // State form
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // State notifikasi (null jika tidak ada notifikasi)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const { mutateAsync: createCategory } = useMutation({
    mutationFn: createCategoryFn,
    onSuccess: () => {
      setNotification({ message: "Category successfully created!", type: 'success' })
      // Tunggu 2 detik agar notifikasi terlihat sebelum redirect
      setTimeout(() => {
        router.push(AppRoutes.Category)
        queryClient.invalidateQueries(['categories'])
      }, 2000)
    },
    onError: (error) => {
      console.error(error)
      setNotification({ message: "Failed to create category. Please try again.", type: 'error' })
    }
  })

  useEffect(() => {
    dispatch(setTitle("create category"))
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

    // Validasi: Pastikan field category name tidak kosong
    if (!name.trim()) {
      setNotification({ message: "Category name is required.", type: "error" })
      return
    }

    setIsCreating(true)

    try {
      await createCategory({ name })
    } catch (err) {
      console.error(err)
      setNotification({ message: "An error occurred while creating the category.", type: "error" })
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
          placeholder="Category Name"
          className="input-primary"
        />
        <div className="flex gap-1 justify-end">
          <Link href={AppRoutes.Category} className="btn-primary">
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
