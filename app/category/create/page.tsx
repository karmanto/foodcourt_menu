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
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()

  const { mutateAsync: createCategory } = useMutation({
    mutationFn: createCategoryFn,
    onSuccess: () => {
      router.push(AppRoutes.Category)
      queryClient.invalidateQueries(['categories'])
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name) {
      return
    }

    try {
      await createCategory({ name })
      router.push(AppRoutes.Category)
    } catch (err) {
      console.error(err)
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
