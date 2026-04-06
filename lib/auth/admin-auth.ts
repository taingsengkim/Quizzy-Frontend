import { loginRequest } from "../types/admin-data";

export default async function loginAdmin(loginData:loginRequest){
    const res = await fetch("/api/login",{
        method:"POST",
        headers:{
            "Content-type":"application/json"
        },
        body:JSON.stringify(loginData)
    })       
    if(!res.ok){
        throw Error("Failed To Login!");
    }
    const data = await res.json();
    return data;
}