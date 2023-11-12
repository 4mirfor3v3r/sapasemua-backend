import { BaseResponse } from './../util/BaseResponse';
import { IForum, MForum } from './../model/Forum';
import { IComment, MComment } from './../model/Comment';
import { AzureUploader } from './../util/AzureUploader';

interface IForumWorker {
    addForum(forum: IForum, attachment: Express.Multer.File|undefined) : Promise<BaseResponse<IForum>>;
    getAllForum(page: number, pageSize:number): Promise<BaseResponse<Array<IForum>>>;
	getForumById(forumId:string): Promise<BaseResponse<IForum>>;
	editForumById(forumId: string, forum: IForum, attachment: Express.Multer.File|undefined): Promise<BaseResponse<IForum>>;
    deleteForumById(forumId: string): Promise<BaseResponse<IForum>>;
    addCommentToForum(forumId: string, comment: IComment): Promise<BaseResponse<IForum>>;
    addLikeToForum(forumId: string): Promise<BaseResponse<IForum>>;
    removeLikeFromForum(forumId: string): Promise<BaseResponse<IForum>>;
}

export default class ForumWorker implements IForumWorker{
    private azureUploader = new AzureUploader()

    addForum(forum: IForum, attachment: Express.Multer.File|undefined): Promise<BaseResponse<IForum>> {
        return new Promise(async (resolve, reject) => {
            if(attachment){
                await this.azureUploader.upload(process.env.AZURE_STORAGE_CONTAINER_NAME_FORUM??"", attachment).then((avatarName) => {
                    forum.attachment = avatarName
                })
            }
            MForum.create(forum).then((data) =>{
                MForum.findById(data._id).populate("creator", "name role avatar").populate("comment", "_id").then(async(data) =>{
                    if(data == null){
                        return reject(BaseResponse.error("Forum tidak ditemukan"))
                    }
                    await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_FORUM ?? "", data.attachment ?? "").then((url) => {
                        data.attachment = url
                        resolve(BaseResponse.success(data))
                    })
                }).catch((err:Error)=>{
                    reject(BaseResponse.error(err.message))
                })
            }).catch((err:Error)=>{
                reject(BaseResponse.error(err.message))
            })
        })
    }
    getAllForum(page: number, pageSize:number): Promise<BaseResponse<IForum[]>> {
        return new Promise((resolve, reject) => {
            MForum.find().skip((page-1)*pageSize).limit(pageSize).populate("creator", "avatar").populate("comment", "_id").then((data) =>{
                MForum.countDocuments().then(async(count)=>{
                    for(let i = 0; i < data.length; i++){
                        if(data[i].attachment){
                            await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_FORUM ?? "", data[i].attachment ?? "").then((url) => {
                                data[i].attachment = url
                            })
                        }
                        if(data[i].creator.avatar){
                            await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_USER ?? "", data[i].creator.avatar ?? "").then((url) => {
                                data[i].creator.avatar = url
                            })
                        }
                    }
                    resolve(BaseResponse.success(data, page, Math.ceil(count/pageSize)))
                }).catch((err:Error)=>{
                    reject(BaseResponse.error(err.message))
                })
            }).catch((err:Error)=>{
                reject(BaseResponse.error(err.message))
            })
        })
    }
    getForumById(forumId: string): Promise<BaseResponse<IForum>> {
        return new Promise((resolve, reject) => {
            MForum.findById(forumId)
                .populate("creator", "name role avatar")
                .populate({path:"comment", populate:{path:"creator", select:"name role avatar"}}).then(async (data) =>{
                    if(data == null){
                        return reject(BaseResponse.error("Modul tidak ditemukan"))
                    }
                    if(data.attachment){
                        await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_FORUM ?? "", data.attachment ?? "").then((url) => {
                            data.attachment = url
                        })
                    }
                    if(data.creator.avatar){
                        await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_USER ?? "", data.creator.avatar ?? "").then((url) => {
                            data.creator.avatar = url
                        })
                    }
                    if(data.comment){
                        if(data.comment.length > 0){
                            for(let i = 0; i < data.comment.length; i++){
                                if(data.comment[i].creator.avatar){
                                    if(data.comment[i].creator._id != data.creator._id){
                                        await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_USER ?? "", data.comment[i].creator.avatar ?? "").then(async(commentUserUrl) => {
                                            if(data.comment) data.comment[i].creator.avatar = commentUserUrl
                                        })
                                    }else{
                                        data.comment[i].creator.avatar = data.creator.avatar
                                    }
                                }
                            }
                        }
                    }
                    resolve(BaseResponse.success(data))
            }).catch((err:Error)=>{
                reject(BaseResponse.error(err.message))
            })
        })
    }
    editForumById(forumId: string, forum: IForum, attachment: Express.Multer.File|undefined): Promise<BaseResponse<IForum>> {
        return new Promise(async (resolve, reject) => {
            if(attachment){
                await this.azureUploader.upload(process.env.AZURE_STORAGE_CONTAINER_NAME_FORUM??"", attachment).then((avatarName) => {
                    forum.attachment = avatarName
                })
            }
            MForum.findByIdAndUpdate(forumId, forum).then(async (data) =>{
                if(data == null){
                    return reject(BaseResponse.error("Forum tidak ditemukan"))
                }
                await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_USER ?? "", data.creator.avatar ?? "").then((url) => {
                    data.creator.avatar = url
                    resolve(BaseResponse.success(data))
                })
            }).catch((err:Error)=>{
                reject(BaseResponse.error(err.message))
            })
        })
    }
    deleteForumById(forumId: string): Promise<BaseResponse<IForum>> {
        return new Promise((resolve, reject) => {
            MForum.findByIdAndDelete(forumId).then((data) =>{
                if(data == null){
                    return reject(BaseResponse.error("Forum tidak ditemukan"))
                }
                resolve(BaseResponse.success(data))
            }).catch((err:Error)=>{
                reject(BaseResponse.error(err.message))
            })
        })
    }
    addCommentToForum(forumId: string, comment: IComment): Promise<BaseResponse<IForum>>{
        return new Promise((resolve, reject) => {
            MComment.create(comment).then((data) =>{
                MForum.findByIdAndUpdate(forumId, {$push: {comment: data._id, isNew:true}}).then((data) =>{
                    if(data == null){
                        return reject(BaseResponse.error("Forum tidak ditemukan"))
                    }
                    MForum.findById(forumId).populate("creator", "name role avatar").populate({path:"comment", populate:{path:"creator", select:"name role avatar"}}).then(async (data) =>{
                        if(data == null){
                            return reject(BaseResponse.error("Forum tidak ditemukan"))
                        }
                        if(data.attachment && data.attachment != null){
                            await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_FORUM ?? "", data.attachment ?? "").then((url) => {
                                data.attachment = url
                                // resolve(BaseResponse.success(data))
                            })
                        }
                        if(data.creator.avatar){
                            await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_USER ?? "", data.creator.avatar ?? "").then((url) => {
                                data.creator.avatar = url
                                // resolve(BaseResponse.success(data))
                            })
                        }
                        if(data.comment && data.comment.length > 0){
                            for(let i = 0; i < data.comment.length; i++){
                                if(data.comment[i].creator.avatar){
                                    await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_USER ?? "", data.comment[i].creator.avatar ?? "").then((url) => {
                                        data.comment![i].creator.avatar = url
                                    })
                                }
                            }
                        }
                        resolve(BaseResponse.success(data))
                    }).catch((err:Error)=>{
                        reject(BaseResponse.error(err.message))
                    })
                }).catch((err:Error)=>{
                    reject(BaseResponse.error(err.message))
                })
            }).catch((err:Error)=>{
                reject(BaseResponse.error(err.message))
            })
        })
    }

    addLikeToForum(forumId: string): Promise<BaseResponse<IForum>> {
        return new Promise((resolve, reject) => {
            MForum.findByIdAndUpdate(forumId, {$inc: {likes: 1}}).then((data) =>{
                if(data == null){
                    return reject(BaseResponse.error("Forum tidak ditemukan"))
                }
                resolve(BaseResponse.success(data))
            }).catch((err:Error)=>{
                reject(BaseResponse.error(err.message))
            })
        })
    }
    removeLikeFromForum(forumId: string): Promise<BaseResponse<IForum>> {
        return new Promise((resolve, reject) => {
            MForum.findById(forumId).then((data) =>{
                if(data == null){
                    return reject(BaseResponse.error("Forum tidak ditemukan"))
                }
                if(data.likes! > 0){
                    MForum.findByIdAndUpdate(forumId, {$inc: {likes: -1}}).then((data) =>{
                        if(data == null){
                            return reject(BaseResponse.error("Forum tidak ditemukan"))
                        }
                        resolve(BaseResponse.success(data))
                    }).catch((err:Error)=>{
                        reject(BaseResponse.error(err.message))
                    })
                }else{
                    return resolve(BaseResponse.success(data))
                }
            }).catch((err:Error)=>{
                reject(BaseResponse.error(err.message))
            })
        })
    }

}