import mongoose from "mongoose";
import { IModule, MModule } from "./../model/Module";
import { MUser } from "./../model/User";
import { BaseResponse } from "./../util/BaseResponse";
import { IQuiz, MQuiz } from "./../model/Quiz";
import { ISubmodule, MSubmodule } from "./../model/SubModule";

interface IModuleWorker {
    addModule(module: IModule, submodule:any, files: { [fieldname: string]: Express.Multer.File[]; } | undefined): Promise<BaseResponse<IModule>>;
    addSubModule(module: string, submodule:ISubmodule, video: Express.Multer.File|undefined): Promise<BaseResponse<ISubmodule>>;
    getAllModule(): Promise<BaseResponse<Array<IModule>>>;
    getOneModule(module_id: string): Promise<BaseResponse<IModule>>;
    getLesson(module_id: string): Promise<BaseResponse<ISubmodule>>;
    addQuiz(module: string, quiz:IQuiz, attachment: Express.Multer.File|undefined): Promise<BaseResponse<IQuiz>>;
    // addUser(user: IUser) : Promise<BaseResponse<IUser>>;
    // getAllUser(): Promise<BaseResponse<Array<IUser>>>;
	// getUserByEmail(email:string): Promise<BaseResponse<IUser>>;
	// editUserByEmail(email: string, user: IUser, avatar:UploadedFile | null): Promise<BaseResponse<IUser>>;
    // deleteUserByEmail(email: string): Promise<BaseResponse<IUser>>;
}

export default class ModuleWorker implements IModuleWorker{
    addModule(module: IModule, submodule:any, files: { [fieldname: string]: Express.Multer.File[]; } | undefined): Promise<BaseResponse<IModule>> {
        return new Promise((resolve, reject) =>{
            if(files == undefined){
                return reject(BaseResponse.error("image modul dan video tidak boleh kosong"))
            }
            if(files["image"] == undefined){
                return reject(BaseResponse.error("image modul tidak boleh kosong"))
            }
            if(files["modules"] == undefined){
                return reject(BaseResponse.error("video submodul tidak boleh kosong"))
            }
            var submodules: ISubmodule[] = []
            for (let i = 0; i < submodule.length; i++) {
                submodules[i] = {
                    name : submodule[i].name,
                    duration : submodule[i].duration,
                    video : (files["modules"] as Express.Multer.File[])[i].buffer.toString('base64')
                }
            }
            MUser.findById(module.creator)
            .then((result)=>{
                if (result) {
                        module.image = (files["image"] as Express.Multer.File[])[0].buffer.toString('base64');
                        MModule.create(module).then((data) =>{
                            MSubmodule.insertMany(submodules).then((result) =>{
                                MModule.findByIdAndUpdate(data._id, {$push:{submodule: result.map((value)=>{return value._id})}}).then((result) =>{
                                    resolve(BaseResponse.success(data))
                                }).catch((err:Error)=>{
                                    reject(BaseResponse.error(err.message))
                                })
                            }
                            ).catch((err:Error)=>{
                                reject(BaseResponse.error(err.message))
                            })
                        }).catch((err:Error)=>{
                            reject(BaseResponse.error(err.message))
                        })
                } else {
                    reject(BaseResponse.error("Pengguna tidak ditemukan"))
                }
            }).catch((err: Error) => {
                console.log(err);
                reject(BaseResponse.error(err.message));
            });
        });
    }
    addSubModule(module: string, submodule:ISubmodule, video: Express.Multer.File|undefined): Promise<BaseResponse<ISubmodule>> {
        return new Promise((resolve, reject) =>{
            if(video == undefined){
                return reject(BaseResponse.error("Video submodul tidak boleh kosong"))
            }
            MModule.findById(module)
            .then((result)=>{
                if (result) {
                        submodule.video = video.buffer.toString('base64');
                        MSubmodule.create(submodule).then((data) =>{
                            MModule.findByIdAndUpdate(module, {$push:{submodule: data._id}}).then((result) =>{
                                resolve(BaseResponse.success(data))
                            }).catch((err:Error)=>{
                                reject(BaseResponse.error(err.message))
                            })
                        }).catch((err:Error)=>{
                            reject(BaseResponse.error(err.message))
                        })
                } else {
                    reject(BaseResponse.error("Modul tidak ditemukan"))
                }
            }).catch((err: Error) => {
                console.log(err);
                reject(BaseResponse.error(err.message));
            });
        });
    }
    getAllModule(): Promise<BaseResponse<Array<IModule>>> {
        return new Promise((resolve, reject) => {
            MModule.find({}).select("-quiz -submodule").exec()
                .then((data) => {
                    resolve(BaseResponse.success(data));
                })
                .catch((err: Error) => {
                    console.log(err);
                    reject(BaseResponse.error(err.message));
                });
        });
    }
    getOneModule(module_id: string): Promise<BaseResponse<IModule>> {
        return new Promise((resolve, reject) => {
            MModule.findOne({_id:module_id}).select("-quiz").populate("submodule", "-video").exec()
                .then((data) => {
                    if(data == null){
                        return reject(BaseResponse.error("Modul tidak ditemukan"))
                    }
                    resolve(BaseResponse.success(data));
                })
                .catch((err: Error) => {
                    console.log(err);
                    reject(BaseResponse.error(err.message));
                });
        });
    }
    getLesson(module_id: string): Promise<BaseResponse<ISubmodule>> {
        return new Promise((resolve, reject) => {
            MSubmodule.findOne({_id:module_id}).exec()
                .then((data) => {
                    if(data == null){
                        return reject(BaseResponse.error("Lesson tidak ditemukan"))
                    }
                    resolve(BaseResponse.success(data));
                })
                .catch((err: Error) => {
                    console.log(err);
                    reject(BaseResponse.error(err.message));
                });
        });
    }
    addQuiz(module: string, quiz:IQuiz, attachment: Express.Multer.File|undefined): Promise<BaseResponse<IQuiz>> {
        return new Promise((resolve, reject) =>{
            if(attachment == undefined){
                return reject(BaseResponse.error("Gambar kuis tidak boleh kosong"))
            }
            MModule.findById(module)
            .then((result)=>{
                if (result) {
                        quiz.attachment = attachment.buffer.toString('base64');
                        MQuiz.create(quiz).then((data) =>{
                            MModule.findByIdAndUpdate(module, {$push:{quiz: data._id}}).then((result)=>{
                                resolve(BaseResponse.success(data))
                            }).catch((err:Error)=>{
                                reject(BaseResponse.error(err.message))
                            })
                        }).catch((err:Error)=>{
                            reject(BaseResponse.error(err.message))
                        })
                } else {
                    reject(BaseResponse.error("Modul tidak ditemukan"))
                }
            }).catch((err: Error) => {
                console.log(err);
                reject(BaseResponse.error(err.message));
            });
        });
    }
}