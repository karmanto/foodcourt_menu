'use client'
import { getMenusFn } from '@/lib/api/menus'
import { Menu } from '@prisma/client'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import Loading from '@/components/Loading/Loading'
import MenuItem from '@/components/MenuItem/MenuItem'
import { useDispatch } from 'react-redux'
import { setTitle } from '@/lib/features/LayoutState/LayoutSlice'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import Link from 'next/link'
import { IoCreateOutline as Add, IoSearchOutline as Search } from 'react-icons/io5'
import { RiFilter3Line as Filter } from 'react-icons/ri'
import { containerVariant } from '@/lib/framer-motion/variants'
import { motion, HTMLMotionProps } from 'framer-motion'

export default function MenuPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()

  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [tempCategory, setTempCategory] = useState<string>('') 
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)

  const [searchInput, setSearchInput] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

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
    dispatch(setTitle('menu'))
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
    queryKey: ['menus', selectedCategory, searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      return getMenusFn({
        skip: pageParam,
        limit: 10,
        search: searchQuery,
        categoryId: selectedCategory
      })
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
      {
        rootMargin: '200px'
      }
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

  if (isLoading || status === 'loading') {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <p className="text-center text-h3">Terjadi kesalahan</p>
      </div>
    )
  }

  const menus: Menu[] = data?.pages?.flat() || []

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
          placeholder="Search menus..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearchQuery(searchInput)
            }
          }}
          className="input-primary flex-grow"
        />
        <button className="btn-primary" onClick={() => setSearchQuery(searchInput)}>
          <Search className="inline" fontSize={20} />
        </button>
        <button className="btn-primary" onClick={() => setFilterModalOpen(true)}>
          <Filter className="inline" fontSize={20} />
        </button>
        <Link href={AppRoutes.CreateMenu} className="btn-primary">
          <Add className="inline" fontSize={20} />
        </Link>
      </div>

      {menus.length === 0 ? (
        <div className="flex h-[40vh] w-full items-center justify-center">
          <p className="text-center text-h3">Data tidak ditemukan.</p>
        </div>
      ) : (
        <div
          className="flex w-full flex-col items-center overflow-auto"
          style={{ height: "calc(100vh - 190px)" }}
        >
          <ul className="w-full">
            {menus.map((menu: Menu) => (
              <MenuItem key={menu.id} {...menu} />
            ))}
          </ul>
          <div ref={loadMoreRef} className="flex justify-center items-center py-4">
            {isFetchingNextPage && <Loading />}
          </div>
        </div>
      )}

      {filterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md w-80">
            <h3 className="text-xl mb-4">Filter Menus</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="category" className="block mb-1">
                  Category:
                </label>
                <select
                  id="category"
                  value={tempCategory}
                  onChange={(e) => setTempCategory(e.target.value)}
                  className="input-primary w-full"
                >
                  <option value="">All Categories</option>
                  {categories &&
                    categories.map((cat: { id: number; name: string }) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn-primary" onClick={() => setFilterModalOpen(false)}>
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setSelectedCategory(tempCategory ? parseInt(tempCategory) : undefined)
                  setFilterModalOpen(false)
                  queryClient.invalidateQueries(['menus'])
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  )
}
