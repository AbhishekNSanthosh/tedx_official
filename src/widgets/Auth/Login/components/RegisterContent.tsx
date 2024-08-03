import Image from 'next/image'
import React from 'react'

export default function RegisterContent() {
  return (
    <div className='w-[60vw] relative rounded-lg h-screen'>
      <Image src={'/keralabg.jpg'} height={1000} width={1000} alt='' className='w-full h-full'/>
    </div>
  )
}
