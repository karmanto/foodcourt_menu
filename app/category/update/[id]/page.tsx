'use client'
import Loading from '@/components/Loading/Loading'
import { containerVariant } from '@/lib/framer-motion/variants'
import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import { getSingleCategoryFn, updateCategoryFn } from '@/lib/api/categories'
import { Category } from '@prisma/client'
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

export default function UpdateCategoryPage() {
  const [name, setName] = useState('')
  const [notification, setNotification] = useState<Notification | null>(null)
  const router = useRouter()
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const { data: session, status } = useSession()
  const { id } = useParams()

  // Ambil data category berdasarkan id
  const { data, isLoading: valuesLoading } = useQuery<Category>({
    queryKey: ['singleCategory', id],
    queryFn: () => getSingleCategoryFn(id)
  })

  useEffect(() => {
    dispatch(setTitle("update category"))
  }, [dispatch])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(AppRoutes.Auth)
    }
  }, [status, router])

  // Notifikasi akan hilang setelah 2 detik
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Set nilai form ketika data berhasil diambil
  useEffect(() => {
    if (data) {
      setName(data.name)
    }
  }, [data])

  const updateCategoryMutation = useMutation({
    mutationFn: updateCategoryFn,
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] })
      const previousCategories = queryClient.getQueryData<Category[]>(['categories'])
      if (previousCategories) {
        const updatedCategories: Category[] = previousCategories.map((category) =>
          category.id === newCategory.id ? { ...category, ...newCategory } : category
        )
        queryClient.setQueryData<Category[]>(['categories'], updatedCategories)
      }
      return { previousCategories }
    },
    onError: (err, variables, context: { previousCategories?: Category[] } | undefined) => {
      if (context?.previousCategories) {
        queryClient.setQueryData<Category[]>(['categories'], context.previousCategories)
      }
      setNotification({
        message: "Failed to update category. Please try again.",
        type: 'error'
      })
    },
    onSuccess: () => {
      setNotification({
        message: "Category updated successfully!",
        type: 'success'
      })
      // Redirect setelah notifikasi sukses tampil selama 2 detik
      setTimeout(() => {
        router.push(AppRoutes.Category)
      }, 2000)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Bersihkan notifikasi sebelumnya
    setNotification(null)

    // Validasi input: pastikan nama category tidak kosong
    if (name.trim() === '') {
      setNotification({
        message: "Category Name harus diisi",
        type: 'error'
      })
      return
    }

    updateCategoryMutation.mutate({
      id: Number(id),
      name
    })
  }

  if (valuesLoading)
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loading />
      </div>
    )
  if (!data) throw notFound()

  return (
    <motion.section
      variants={containerVariant}
      initial="hidden"
      animate="visible"
      {...({ className: 'flex flex-col justify-center items-center h-[60vh] w-full' } as HTMLMotionProps<'section'>)}
    >
      {/* Notifikasi Error/Success */}
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-md text-white ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 flex-col sm:w-2/3 md:w-1/3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Category Name"
          className="input-primary"
        />
        <div className="flex gap-1 justify-end">
          <Link href=".." className="btn-primary">
            Cancel
          </Link>
          <button disabled={updateCategoryMutation.isLoading} type="submit" className="btn-primary">
            Update
          </button>
        </div>
      </form>
    </motion.section>
  )
}
