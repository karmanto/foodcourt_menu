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

export default function UpdateCategoryPage() {
  const [name, setName] = useState('')
  const router = useRouter()
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const { data: session, status } = useSession()

  const { id } = useParams()

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
    },
    onSuccess: () => {
      router.push(AppRoutes.Category)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (name.trim() === '') {
      return
    }

    updateCategoryMutation.mutate({
      id: Number(id),
      name
    })
  }

  useEffect(() => {
    if (data) {
      setName(data.name)
    }
  }, [data])

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
