import mongoose from "mongoose";
import { IModule, MModule } from "./../model/Module";
import { MUser } from "./../model/User";
import { BaseResponse } from "./../util/BaseResponse";
import { IQuiz, MQuiz } from "./../model/Quiz";

interface IModuleWorker {
    addModule(module: IModule, avatar: Express.Multer.File|undefined): Promise<BaseResponse<IModule>>;
    getAllModule(): Promise<BaseResponse<Array<IModule>>>;
    addQuiz(module: string, quiz:IQuiz, attachment: Express.Multer.File|undefined): Promise<BaseResponse<IQuiz>>;
    // addUser(user: IUser) : Promise<BaseResponse<IUser>>;
    // getAllUser(): Promise<BaseResponse<Array<IUser>>>;
	// getUserByEmail(email:string): Promise<BaseResponse<IUser>>;
	// editUserByEmail(email: string, user: IUser, avatar:UploadedFile | null): Promise<BaseResponse<IUser>>;
    // deleteUserByEmail(email: string): Promise<BaseResponse<IUser>>;
}

export default class ModuleWorker implements IModuleWorker{
    addModule(module: IModule, image: Express.Multer.File|undefined): Promise<BaseResponse<IModule>> {
        return new Promise((resolve, reject) =>{
            if(image == undefined){
                return reject(BaseResponse.error("Gambar modul tidak boleh kosong"))
            }
            MUser.findById(module.creator)
            .then((result)=>{
                if (result) {
                        module.image = image.buffer.toString('base64');
                        MModule.create(module).then((data) =>{
                            resolve(BaseResponse.success(data))
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
    getAllModule(): Promise<BaseResponse<Array<IModule>>> {
        return new Promise((resolve, reject) => {
            MModule.find({})
                .then((data) => {
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