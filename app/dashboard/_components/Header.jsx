"use client"
import { useEffect } from 'react';
import Image from 'next/image'
import React from 'react'
import { UserButton } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'


const header = () => {
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    // console.log(path)
  }, [path])
  return (
    <div className='flex p-4 justify-between bg-secondary shadow-sm '>
        <Image src={'/logo.svg'} alt="logo" width={160} height={100} onClick={()=>(router.push('/dashboard'))} className='cursor-pointer'/>
        {/* <ul className='hidden md:flex gap-6'>
            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=="/dashboard" && 'text-primary font-bold'}`}>DashBoard</li>
            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=="/dashboard/questions" && 'text-primary font-bold'}`}>Questions</li>
            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=="/dashboard/upgrade" && 'text-primary font-bold'}`}>Upgrades</li>
            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=="/dashboard/how" && 'text-primary font-bold'}`}>How it Works?</li>
        </ul> */}
        <UserButton/>

    </div> 
  )
}

export default header