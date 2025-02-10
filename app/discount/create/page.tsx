'use client'
import { containerVariant } from '@/lib/framer-motion/variants'
import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import { createDiscountFn } from '@/lib/api/discounts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, HTMLMotionProps } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setTitle } from '@/lib/features/LayoutState/LayoutSlice'
import { useSession } from 'next-auth/react'

export default function NewDiscountPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()

  // State form
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [startPeriod, setStartPeriod] = useState('')
  const [endPeriod, setEndPeriod] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // State notifikasi (null jika tidak ada notifikasi)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const { mutateAsync: createDiscount } = useMutation({
    mutationFn: createDiscountFn,
    onSuccess: () => {
      setNotification({ message: "Discount successfully created!", type: 'success' })
      // Tunggu 2 detik sebelum redirect agar notifikasi terlihat
      setTimeout(() => {
        router.push(AppRoutes.Discount)
        queryClient.invalidateQueries(['discounts'])
      }, 2000)
    },
    onError: (error) => {
      console.error(error)
      setNotification({ message: "Failed to create discount. Please try again.", type: 'error' })
    }
  })

  useEffect(() => {
    dispatch(setTitle("create discount"))
  }, [dispatch])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(AppRoutes.Auth)
    }
  }, [status, router])

  // Hapus notifikasi setelah 2 detik (jika ada)
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Reset notifikasi sebelumnya
    setNotification(null)

    // Validasi: Pastikan semua field wajib terisi
    if (!name.trim() || !value.trim() || !startPeriod || !endPeriod) {
      setNotification({ message: "Please fill in all required fields.", type: "error" })
      return
    }

    // Validasi: Cek apakah discount value merupakan angka yang valid dan > 0
    const discountValue = parseFloat(value)
    if (isNaN(discountValue) || discountValue <= 0) {
      setNotification({ message: "Discount harus lebih dari 0.", type: "error" })
      return
    }

    // Validasi: Pastikan startPeriod sebelum endPeriod
    if (new Date(startPeriod) >= new Date(endPeriod)) {
      setNotification({ message: "Start period must be before end period.", type: "error" })
      return
    }

    setIsCreating(true)

    try {
      await createDiscount({
        name,
        value: discountValue,
        startPeriod,
        endPeriod
      })
    } catch (err) {
      console.error(err)
      setNotification({ message: "An error occurred while creating the discount.", type: "error" })
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
        {/* Inline Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-md text-white ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {notification.message}
          </div>
        )}
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
          <Link href={AppRoutes.Discount} className="btn-primary">
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
