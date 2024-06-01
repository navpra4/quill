import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import {PDFLoader} from 'langchain/document_loaders/fs/pdf'
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter'
import {OpenAIEmbeddings} from '@langchain/openai'
import { getPineconeClient} from "@/lib/pinecone";
import {PineconeStore} from '@langchain/pinecone'


const f = createUploadthing();
 

 
export const ourFileRouter = {
  
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
        const {getUser} = getKindeServerSession()
        const user = await getUser()

        if(!user || !user.id)throw new Error('unauthorized')
        
    
        return {userId: user.id}
    })
    .onUploadComplete(async ({ metadata, file }) => {
        const createdFile = await db.file.create({
          data:{
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            //url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
            //url: `utfs.io/f/${file.key}`,
            url: file.url,
            uploadStatus: 'PROCESSING',
          }
        })

        try{
          const response = await fetch(file.url)
          const blob = await response.blob()

          const loader = new PDFLoader(blob)

          const pagelevelDocs = await loader.load()

          const textsplitter = new RecursiveCharacterTextSplitter({
            chunkSize:1000,
            chunkOverlap: 200,
          })

          const docs = await textsplitter.splitDocuments(pagelevelDocs)
          const pagesAmt = pagelevelDocs.length
          
          const pinecone = getPineconeClient()
          const pineconeIndex = pinecone.Index("quill")

          const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY
          })

          await PineconeStore.fromDocuments(
            docs,
            embeddings,
            {
              namespace: createdFile.id,
              pineconeIndex: pineconeIndex,
              /*pineconeConfig: {
                namespace: createdFile.id,
                indexName: "quill",
                config:{
                  apiKey: process.env.PINECONE_API_KEY!,  
                  
                }
                
              },*/
            },  
          )

          await db.file.update({
            data:{
              uploadStatus: "SUCCESS"
            },
            where:{
              id: createdFile.id,
            }
          })

        }catch(err){
          await db.file.update({
            data:{
              uploadStatus: 'FAILED'
            },
            where:{
              id: createdFile.id,
            }
          }) 
          console.log( 'error on the catch block is:',err)
        }
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;