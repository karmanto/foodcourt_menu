'use client'
import { containerVariant } from '@/lib/framer-motion/variants'
import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import { createDiscountFn } from '@/lib/api/discounts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, HTMLMotionProps } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState, useEffect } from 'react'
import { useDispatch } from "react-redux"
import { setTitle } from "@/lib/features/LayoutState/LayoutSlice"
import { useSession } from 'next-auth/react'

export default function NewDiscountPage() {
  const dispatch = useDispatch()
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [startPeriod, setStartPeriod] = useState('')
  const [endPeriod, setEndPeriod] = useState('')
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()

  const { mutateAsync: createDiscount } = useMutation({
    mutationFn: createDiscountFn,
    onSuccess: () => {
      router.push(AppRoutes.Discount)
      queryClient.invalidateQueries(['discounts'])
    }
  })

  useEffect(() => {
    dispatch(setTitle("create discount"));
  }, [dispatch])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(AppRoutes.Auth)
    }
  }, [status, router])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name || !value || !startPeriod || !endPeriod) {
      return
    }

    try {
      await createDiscount({
        name,
        value: parseFloat(value),
        startPeriod,
        endPeriod
      })

      router.push(AppRoutes.Discount)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <motion.section
      variants={containerVariant}
      initial='hidden'
      animate='visible'

      {...({ className: 'flex flex-col justify-center items-center h-[60vh] w-full' } as HTMLMotionProps<'section'>)}
    >
      <form onSubmit={handleSubmit} className='flex gap-4 flex-col sm:w-2/3 md:w-1/3'>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type='text'
          placeholder='Discount Name'
          className='input-primary'
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type='number'
          placeholder='Discount Value (%)'
          className='input-primary'
        />
        <input
          value={startPeriod}
          onChange={(e) => setStartPeriod(e.target.value)}
          type='date'
          placeholder='Start Period'
          className='input-primary'
        />
        <input
          value={endPeriod}
          onChange={(e) => setEndPeriod(e.target.value)}
          type='date'
          placeholder='End Period'
          className='input-primary'
        />
        <div className='flex gap-1 justify-end'>
          <Link href={AppRoutes.Discount} className='btn-primary'>
            Cancel
          </Link>
          <button disabled={isCreating} type='submit' className='btn-primary'>
            Create
          </button>
        </div>
      </form>
    </motion.section>
  )
}
