import { BlobGenerateSasUrlOptions, BlobSASPermissions, BlobServiceClient, BlockBlobClient, StorageSharedKeyCredential, generateBlobSASQueryParameters } from "@azure/storage-blob"
const getStream = require('into-stream')

export class AzureUploader {
    
    getBlobName(originalName:string) {
        const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
        return `${identifier}-${originalName}`;
    };

    upload(containerName:string, file:Express.Multer.File): Promise<string>{
        return new Promise<string>((resolve, reject) => {
            const blobName = this.getBlobName(file.originalname)
            const blobService = new BlockBlobClient(process.env.AZURE_STORAGE_CONNECTION_STRING?.toString() ?? "", containerName, blobName)
            const stream = getStream(file.buffer)
            const streamLength = file.buffer.length

            blobService.uploadStream(stream, streamLength).then( async () => {
                resolve(blobName)
            }).catch((error:any) => {
                console.log(error)
                reject(error)
            })
        })
    }

    getFileSasUrl(containerName:string, blobName:string): Promise<string>{
        return new Promise<string>(async (resolve, reject) =>  {
            if (containerName == "" || blobName == "") {
                reject("Empty container name or blob name")
            }
            const blobService = new BlockBlobClient(process.env.AZURE_STORAGE_CONNECTION_STRING?.toString() ?? "", containerName, blobName)
            const startDate = new Date()
            const expiryDate = new Date(startDate)
            expiryDate.setMinutes(startDate.getMinutes() + 150)
            startDate.setMinutes(startDate.getMinutes() - 150)

            const sharedAccessPolicy: BlobGenerateSasUrlOptions= {
                permissions: BlobSASPermissions.parse("r"),
                expiresOn: expiryDate, 
                startsOn: startDate
            }
            

            blobService.generateSasUrl(sharedAccessPolicy).then((fileUrl:string) => {
                resolve(fileUrl)
            }).catch((error:any) => {
                console.log(error)
                reject(error)
            })
        })
    }

    getFileSasUrlv2(containerName:string, blobName:string): Promise<string>{
        return new Promise<string>(async (resolve, reject) =>  {
            let name = blobName
            let container = containerName
            if (containerName == "" || blobName == "") {
                reject("Empty container name or blob name")
            }
            
            const blobService = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING?.toString() ?? "")
            const blobSas = generateBlobSASQueryParameters({
                containerName: containerName,
                blobName: blobName,
                permissions: BlobSASPermissions.parse("r"),
                expiresOn: new Date(new Date().valueOf() + 86400),
                startsOn: new Date()
            }, (blobService.credential as StorageSharedKeyCredential)).toString()
            resolve(blobService.url+containerName+"?"+blobSas)
        })
    }
}