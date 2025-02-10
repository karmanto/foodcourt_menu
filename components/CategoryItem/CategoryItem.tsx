'use client'
import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import { deleteCategoryFn } from '@/lib/api/categories'
import { Category } from '@prisma/client'
import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AiFillEdit, AiOutlineDelete } from 'react-icons/ai'

interface CategoryItemProps {
  id: number
  name: string
}

export default function CategoryItem(props: CategoryItemProps) {
  const { id, name } = props
  const router = useRouter()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: deleteCategoryFn,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] })
      const previousData = queryClient.getQueryData<InfiniteData<Category[]>>(['categories'])
      
      if (previousData) {
        const updatedData = {
          ...previousData,
          pages: previousData.pages.map((page) =>
            page.filter((category) => category.id !== id)
          )
        }
        queryClient.setQueryData<InfiniteData<Category[]>>(['categories'], updatedData)
      }

      return { previousData }
    },
    onError: (
      error,
      id,
      context: { previousData?: InfiniteData<Category[]> } | undefined
    ) => {
      if (context?.previousData) {
        queryClient.setQueryData<InfiniteData<Category[]>>(['categories'], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })

  return (
    <li className="flex text-xs relative gap-1 items-center border-2 border-black p-2 mb-2 last:mb-0 rounded">
      <div className="flex flex-col w-3/4 p-1">
        <h3 className="font-bold">{name}</h3>
      </div>
      <div className="flex absolute right-2 gap-2 h-full items-center">
        <button
          className="flex"
          onClick={() => router.push(`${AppRoutes.UpdateCategory}/${id}`)}
        >
          <AiFillEdit fontSize={25} className="text-yellow-300" />
        </button>
        <button
          className="flex"
          onClick={() => deleteMutation.mutate(id)}
        >
          <AiOutlineDelete fontSize={25} className="text-red-600" />
        </button>
      </div>
    </li>
  )
}
