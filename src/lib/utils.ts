import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absolute(path : string){
  if(typeof window !== "undefined")return path
  if(process.env.VERCEL_URL){
    return `https://${process.env.VERCEL_URL}${path}`
  }
  return `https://${process.env.PORT ?? 3000}${path}`
}
