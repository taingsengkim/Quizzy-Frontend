import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export  async function POST(req:NextRequest) {
   try{
    const loginData = await req.json();
   
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`,{
        method:"POST",
        headers:{
        "Content-type":"application/json"
        },
        body:JSON.stringify(loginData)
    })
    if(!res.ok){
        return NextResponse.json({message:"Unauthorize"},{status:404});
    }
    const data = await res.json();

    //Set Token to Cookie http only
    const cookieStroe = await cookies();

    cookieStroe.set("better-auth.session_data",data.access_token,{
        httpOnly:true,
        secure:process.env.NODE_ENV == "production",
        sameSite:"lax",
        path:"/",
        maxAge:60 * 60 * 1
    });

    return NextResponse.json(data);
   }catch(error){
        console.log(error)
   }
}