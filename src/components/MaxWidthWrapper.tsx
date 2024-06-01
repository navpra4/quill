import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const MaxWidthWrapper = ({
    className,
    children,
}:{
    className?: String
    children: ReactNode
}
) => {
  return (
    <div className={cn("m-auto w-full max-w-screen-xl px-2.5 md:px-20",className)}>
        {children}
    </div>
  )
}

export default MaxWidthWrapper