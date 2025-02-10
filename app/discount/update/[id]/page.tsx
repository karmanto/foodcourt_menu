'use client'
import Loading from '@/components/Loading/Loading'
import { containerVariant } from '@/lib/framer-motion/variants'
import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import { getSingleDiscountFn, updateDiscountFn } from '@/lib/api/discounts'
import { Discount } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, HTMLMotionProps } from 'framer-motion'
import Link from 'next/link'
import { notFound, useParams, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { useDispatch } from "react-redux"
import { setTitle } from "@/lib/features/LayoutState/LayoutSlice"
import { useSession } from 'next-auth/react'

export default function UpdateDiscountPage() {
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [startPeriod, setStartPeriod] = useState('')
  const [endPeriod, setEndPeriod] = useState('')
  const router = useRouter()
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const { data: session, status } = useSession()

  const { id } = useParams()

  const { data, isLoading: valuesLoading } = useQuery<Discount>({
    queryKey: ['singleDiscount', id],
    queryFn: () => getSingleDiscountFn(id)
  })

  useEffect(() => {
    dispatch(setTitle("update discount"));
  }, [dispatch])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(AppRoutes.Auth)
    }
  }, [status, router])

  const updateDiscountMutation = useMutation({
    mutationFn: updateDiscountFn,
    onMutate: async (newDiscount) => {
      await queryClient.cancelQueries({ queryKey: ['discounts'] })
      const previousDiscounts = queryClient.getQueryData<Discount[]>(['discounts'])
  
      if (previousDiscounts) {
        const updatedDiscounts: Discount[] = previousDiscounts.map((discount) =>
          discount.id === newDiscount.id
            ? {
                ...discount,
                ...newDiscount,
                startPeriod: new Date(newDiscount.startPeriod), // Konversi ke Date
                endPeriod: new Date(newDiscount.endPeriod) // Konversi ke Date
              }
            : discount
        )
        queryClient.setQueryData<Discount[]>(['discounts'], updatedDiscounts)
      }
  
      return { previousDiscounts }
    },
    onError: (err, variables, context: { previousDiscounts?: Discount[] } | undefined) => {
      if (context?.previousDiscounts) {
        queryClient.setQueryData<Discount[]>(['discounts'], context.previousDiscounts)
      }
    },
    onSuccess: () => {
      router.push(AppRoutes.Discount)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] })
    }
  })

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (name === '' || value === '' || startPeriod === '' || endPeriod === '') {
      return
    }

    updateDiscountMutation.mutate({
      id: Number(id),
      name,
      value: parseFloat(value),
      startPeriod,
      endPeriod
    })
  }

  useEffect(() => {
    if (data) {
      setName(data.name)
      setValue(data.value.toString())
      setStartPeriod(new Date(data.startPeriod).toISOString().split('T')[0])
      setEndPeriod(new Date(data.endPeriod).toISOString().split('T')[0])
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
          placeholder="Discount Name"
          className="input-primary"
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="number"
          placeholder="Discount Value (%)"
          className="input-primary"
        />
        <input
          value={startPeriod}
          onChange={(e) => setStartPeriod(e.target.value)}
          type="date"
          placeholder="Start Period"
          className="input-primary"
        />
        <input
          value={endPeriod}
          onChange={(e) => setEndPeriod(e.target.value)}
          type="date"
          placeholder="End Period"
          className="input-primary"
        />
        <div className="flex gap-1 justify-end">
          <Link href=".." className="btn-primary">
            Cancel
          </Link>
          <button
            disabled={updateDiscountMutation.isLoading}
            type="submit"
            className="btn-primary"
          >
            Update
          </button>
        </div>
      </form>
    </motion.section>
  )
}
