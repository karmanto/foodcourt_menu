'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'

export default function ClientHeader() {
  const countState = useSelector((state: RootState) => state.layout.title)

  return (
    <h1 className='text-md text-center uppercase text-black font-semibold'>
      {countState}
    </h1>
  )
}