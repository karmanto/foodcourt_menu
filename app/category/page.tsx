'use client'
import { getCategoriesFn } from '@/lib/api/categories'
import { Category } from '@prisma/client'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import Loading from '@/components/Loading/Loading'
import CategoryItem from '@/components/CategoryItem/CategoryItem'
import { useDispatch } from 'react-redux'
import { setTitle } from '@/lib/features/LayoutState/LayoutSlice'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import Link from 'next/link'
import { IoCreateOutline as Add, IoSearchOutline as Search } from 'react-icons/io5'
import { containerVariant } from '@/lib/framer-motion/variants'
import { motion, HTMLMotionProps } from 'framer-motion'

export default function CategoryPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()
  
  const [searchInput, setSearchInput] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    dispatch(setTitle('categories'))
  }, [dispatch])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(AppRoutes.Auth)
    }
  }, [status, router])

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error
  } = useInfiniteQuery({
    queryKey: ['categories', searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      return getCategoriesFn({ skip: pageParam, limit: 10, search: searchQuery })
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined
      return allPages.length * 10
    }
  })

  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [fetchNextPage, hasNextPage])

  if (isLoading || status === 'loading')
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loading />
      </div>
    )

  if (error)
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <p className="text-center text-h3">Terjadi kesalahan</p>
      </div>
    )

  const categories: Category[] = data?.pages?.flat() || []

  return (
    <motion.section
      variants={containerVariant}
      initial="hidden"
      animate="visible"
      {...({ className: 'flex flex-col justify-center items-center w-full' } as HTMLMotionProps<'section'>)}
    >
      <div className="w-full flex items-center my-4 gap-2">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearchQuery(searchInput)
            }
          }}
          className="input-primary flex-grow"
        />
        <Link href={AppRoutes.CreateCategory} className="btn-primary">
          <Add className="inline" fontSize={20} />
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="flex h-[40vh] w-full items-center justify-center">
          <p className="text-center text-h3">Data tidak ditemukan.</p>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center overflow-auto" style={{ height: 'calc(100vh - 190px)' }}>
          <ul className="w-full">
            {categories.map((category: Category) => (
              <CategoryItem key={category.id} {...category} />
            ))}
          </ul>
          <div ref={loadMoreRef} className="flex justify-center items-center py-4">
            {isFetchingNextPage && <Loading />}
          </div>
        </div>
      )}
    </motion.section>
  )
}
