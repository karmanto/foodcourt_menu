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

interface Notification {
  message: string
  type: 'success' | 'error'
}

export default function UpdateDiscountPage() {
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [startPeriod, setStartPeriod] = useState('')
  const [endPeriod, setEndPeriod] = useState('')
  const [notification, setNotification] = useState<Notification | null>(null)

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
    dispatch(setTitle("update discount"))
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
      setNotification({
        message: "Failed to update discount. Please try again.",
        type: 'error'
      })
    },
    onSuccess: () => {
      setNotification({
        message: "Discount updated successfully!",
        type: 'success'
      })
      // Redirect setelah notifikasi sukses tampil selama 2 detik
      setTimeout(() => {
        router.push(AppRoutes.Discount)
      }, 2000)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] })
    }
  })

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Validasi: pastikan semua field terisi
    if (name.trim() === '' || value.trim() === '' || startPeriod.trim() === '' || endPeriod.trim() === '') {
      setNotification({ message: "Please fill in all fields.", type: 'error' })
      return
    }

    // Validasi: pastikan nilai discount adalah angka positif
    const numericValue = parseFloat(value)
    if (isNaN(numericValue) || numericValue <= 0) {
      setNotification({ message: "Discount harus lebih dari 0.", type: 'error' })
      return
    }

    // Jika semua validasi lolos, bersihkan notifikasi sebelumnya
    setNotification(null)

    updateDiscountMutation.mutate({
      id: Number(id),
      name,
      value: numericValue,
      startPeriod,
      endPeriod
    })
  }

  // Set form dengan data yang diambil dari API
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
      {/* Notifikasi Error/Success */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md text-white ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}
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
