import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest) {
   try{
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
     const data = await res.json()
    return NextResponse.json(data)
   }catch(error){
        console.log(error)
   }
}