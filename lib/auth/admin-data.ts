
// Get Admin Data
export async function getAdminData(token: string){
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    const data = await res.json()
    return data;
}
