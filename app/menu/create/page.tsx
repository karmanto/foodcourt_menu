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

  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [picFile, setPicFile] = useState<File | null>(null)
  const [isCreating, setIsCreating] = useState(false)

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
      router.push(AppRoutes.Menu)
      queryClient.invalidateQueries(['menus'])
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name || !desc || !price || !selectedCategory || !picFile) {
      return
    }

    console.log("submit")

    setIsCreating(true)
    try {
      await createMenu({
        name,
        desc,
        price: parseFloat(price),
        categoryId: parseInt(selectedCategory, 10),
        pic: picFile
      })
      router.push(AppRoutes.Menu)
    } catch (err) {
      console.error(err)
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
        {/* Custom File Input */}
        <div className="w-full">
          <label
            htmlFor="file-upload"
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
