import {z} from "zod"

export const sendMessagevalidator = z.object({
    fileId: z.string(),
    message: z.string()
})