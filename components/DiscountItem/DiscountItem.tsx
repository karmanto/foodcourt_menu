'use client'
import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import { deleteDiscountFn } from '@/lib/api/discounts'
import { Discount } from '@prisma/client'
import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { AiFillEdit, AiOutlineDelete } from 'react-icons/ai'

interface DiscountItemProps {
  id: number
  name: string
  value: number
  startPeriod: Date | string
  endPeriod: Date | string
}

export default function DiscountItem(props: DiscountItemProps) {
  const { id, name, value, startPeriod, endPeriod } = props
  const router = useRouter()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: deleteDiscountFn,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['discounts'] })
      const previousData = queryClient.getQueryData<InfiniteData<Discount[]>>(['discounts'])

      if (previousData) {
        const updatedData = {
          ...previousData,
          pages: previousData.pages.map((page) =>
            page.filter((discount) => discount.id !== id)
          )
        }
        queryClient.setQueryData<InfiniteData<Discount[]>>(['discounts'], updatedData)
      }

      return { previousData }
    },
    onError: (
      error,
      id,
      context: { previousData?: InfiniteData<Discount[]> } | undefined
    ) => {
      if (context?.previousData) {
        queryClient.setQueryData<InfiniteData<Discount[]>>(['discounts'], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] })
    }
  })

  return (
    <li className="flex text-xs relative gap-1 items-center border-2 border-black p-2 mb-2 last:mb-0 rounded">
      <div className="flex flex-col w-3/4 p-1">
        <h3 className="font-bold">{name}</h3>
        <p>Value: {value} %</p>
        <p>
          Period: {format(new Date(startPeriod), 'dd MMM yyyy')} -{' '}
          {format(new Date(endPeriod), 'dd MMM yyyy')}
        </p>
      </div>
      <div className="flex absolute right-2 gap-2 h-full items-center">
        <button
          className="flex"
          onClick={() => router.push(`${AppRoutes.UpdateDiscount}/${id}`)}
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
