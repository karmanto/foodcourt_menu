'use client'
import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import { deleteMenuFn } from '@/lib/api/menus'
import { Menu } from '@prisma/client'
import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AiFillEdit, AiOutlineDelete, AiFillHeart } from 'react-icons/ai'

interface MenuItemProps {
  id: number
  name: string
  desc: string
  price: number
  pic_url: string
  favorite?: boolean // properti favorite, optional (default false)
}

export default function MenuItem(props: MenuItemProps) {
  const { id, name, desc, price, pic_url, favorite = false } = props
  const router = useRouter()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: deleteMenuFn,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['menus'] })

      const previousData = queryClient.getQueryData<InfiniteData<Menu[]>>(['menus'])
      if (previousData) {
        const updatedData = {
          ...previousData,
          pages: previousData.pages.map((page) =>
            page.filter((menu) => menu.id !== id)
          )
        }
        queryClient.setQueryData<InfiniteData<Menu[]>>(['menus'], updatedData)
      }
      return { previousData }
    },
    onError: (
      error,
      id,
      context: { previousData?: InfiniteData<Menu[]> } | undefined
    ) => {
      if (context?.previousData) {
        queryClient.setQueryData<InfiniteData<Menu[]>>(['menus'], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    }
  })

  return (
    <li className="flex items-center text-xs gap-2 border p-1 rounded relative">
      <div className="w-24 h-24 flex-shrink-0 relative">
        <img
          src={pic_url}
          alt={name}
          className="w-full h-full object-cover rounded"
        />
        {favorite && (
          <div className="absolute top-1 left-1 text-red-500">
            <AiFillHeart size={20} />
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-sm">{name}</h3>
        <p>{desc}</p>
        <p className="font-semibold">Price: Rp {price.toFixed(2)}</p>
      </div>

      <div className="flex flex-col gap-2 right-2 top-2 items-center">
        <button
          onClick={() => router.push(`${AppRoutes.UpdateMenu}/${id}`)}
          className="hover:opacity-80"
        >
          <AiFillEdit size={25} className="text-yellow-300" />
        </button>
        <button
          onClick={() => deleteMutation.mutate(id)}
          className="hover:opacity-80"
        >
          <AiOutlineDelete size={25} className="text-red-600" />
        </button>
      </div>
    </li>
  )
}
