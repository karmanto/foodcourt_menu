'use client'

import { useEffect } from 'react'
import { setTitle } from "@/lib/features/LayoutState/LayoutSlice"
import { useDispatch } from "react-redux"

export default function InfoPage() {
  
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(setTitle("Home"))
  }, [dispatch])

  return (
    <main className='flex flex-col justify-center items-center h-[60vh] w-full'>
      <p className='text-center text-h4'>welcome to</p>
      <p className='text-center text-h3 mb-6'>NATA FOODCOURT ADMIN</p>
    </main>
  )
}
