import React from 'react'
import { TbLoader3 } from 'react-icons/tb'

const Loader = () => {
  return (
    <div className='h-dvh w-full fixed z-[1400] inset-0 flex justify-center place-items-center bg-black/50'>
      <span className='text-6xl text-white animate-spin'><TbLoader3 /></span>
    </div>
  )
}

export default Loader
