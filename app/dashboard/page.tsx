"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to news page as the new main page
        router.replace("/news")
    }, [router])

    return null
}
