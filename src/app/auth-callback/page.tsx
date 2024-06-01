"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { trpc } from "../_trpc/client"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

const Page = () => {
    const router = useRouter()

    const searchparams = useSearchParams()
    const origin = searchparams.get('origin')

    const { data, error, isLoading } = trpc.authCallback.useQuery(undefined, {
        retry: true,
        retryDelay: 500,
    })

    useEffect(() => {
        if (data) {
            router.push(origin ? `/${origin}` : '/dashboard');
        } else if (error) {
            router.push('/sign-in');
        }
    }, [data, error, origin, router])

    if (isLoading) {
        return (
            <div className="w-full mt-24 flex justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
                    <h3 className="font-semibold text-xl">Setting up your account...</h3>
                    <p>You will be redirected automatically.</p>
                </div>
            </div>
        )
    }

    return null;
}

export default Page
