import mongoose from "mongoose";
import { IModule, MModule } from "./../model/Module";
import { MUser } from "./../model/User";
import { BaseResponse } from "./../util/BaseResponse";
import { IQuiz, MQuiz } from "./../model/Quiz";
import { ISubmodule, MSubmodule } from "./../model/SubModule";
import { IQuizResult, MQuizResult } from "./../model/QuizResult";
import { AzureUploader } from "./../util/AzureUploader";

interface IModuleWorker {
    addModule(module: IModule, submodule:any, files: { [fieldname: string]: Express.Multer.File[]; } | undefined): Promise<BaseResponse<IModule>>;
    addSubModule(module: string, submodule:ISubmodule, video: Express.Multer.File|undefined): Promise<BaseResponse<ISubmodule>>;
    getAllModule(): Promise<BaseResponse<Array<IModule>>>;
    editSubModule(submoduleId: string, submodule:ISubmodule, video: Express.Multer.File|undefined): Promise<BaseResponse<ISubmodule>>;
    deleteSubModule(submoduleId: string): Promise<BaseResponse<ISubmodule>>;
    editModule(moduleId: string, module: IModule, image: Express.Multer.File | undefined): Promise<BaseResponse<IModule>>;
    deleteModule(moduleId: string): Promise<BaseResponse<IModule>>;
    getOneModule(module_id: string): Promise<BaseResponse<IModule>>;
    getLesson(module_id: string): Promise<BaseResponse<ISubmodule>>;
    getLessons(module_id: string): Promise<BaseResponse<Array<ISubmodule>>>;
    addQuiz(module: string, quiz:IQuiz, attachment: Express.Multer.File|undefined): Promise<BaseResponse<IQuiz>>;
    getOneQuiz(quizId: string): Promise<BaseResponse<IQuiz>>;
    editQuiz(quizId: string, quiz:IQuiz, attachment: Express.Multer.File|undefined): Promise<BaseResponse<IQuiz>>;
    deleteQuiz(quizId: string): Promise<BaseResponse<IQuiz>>;
    getQuizByModule(module: string): Promise<BaseResponse<Array<IQuiz>>>;
    getQuizQuestion(module: string): Promise<BaseResponse<Array<IQuiz>>>;
    submitQuiz(module:string, creator: string, answers:IQuiz[]): Promise<BaseResponse<IQuizResult>>;
    getQuizResultByUser(user: string): Promise<BaseResponse<Array<IQuizResult>>>;
}

export default class ModuleWorker implements IModuleWorker{
    private azureUploader = new AzureUploader()

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
            MUser.findById(module.creator).then((result)=>{
                if (result) {
                    this.azureUploader.upload(process.env.AZURE_STORAGE_CONTAINER_NAME_MODULE ?? "", files["image"][0]).then((imageName) => {
                        module.image = imageName
                        MModule.create(module).then(async (data) =>{
                            var submodules: ISubmodule[] = []
                            for (let i = 0; i < submodule.length; i++) {
                                await this.azureUploader.upload(process.env.AZURE_STORAGE_CONTAINER_NAME_SUBMODULE ?? "", files["modules"][i]).then((videoName) => {
                                    submodules[i] = {
                                        module : data._id ?? "",
                                        name : submodule[i].name,
                                        duration : submodule[i].duration,
                                        video : videoName
                                    }
                                })
                            }
                            MSubmodule.insertMany(submodules).then((result) =>{
                                MModule.findByIdAndUpdate(data._id, {$push:{submodule: result.map((value)=>{return value._id})}}, {new:true}).then((result) =>{
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
                    this.azureUploader.upload(process.env.AZURE_STORAGE_CONTAINER_NAME_SUBMODULE ?? "", video).then((videoName) => {
                        submodule.video = videoName
                        MSubmodule.create(submodule).then((data) =>{
                            MModule.findByIdAndUpdate(module, {$push:{submodule: data._id}}, {new:true}).then((result) =>{
                                resolve(BaseResponse.success(data))
                            }).catch((err:Error)=>{
                                reject(BaseResponse.error(err.message))
                            })
                        }).catch((err:Error)=>{
                            reject(BaseResponse.error(err.message))
                        })
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
                .then(async (data) => {
                    for(let i = 0; i < data.length; i++){
                        await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_MODULE ?? "", data[i].image ?? "").then((url) => {
                            data[i].image = url
                        })
                    }
                    resolve(BaseResponse.success(data));
                })
                .catch((err: Error) => {
                    console.log(err);
                    reject(BaseResponse.error(err.message));
                });
        });
    }
    editSubModule(submoduleId: string, submodule: ISubmodule, video: Express.Multer.File | undefined): Promise<BaseResponse<ISubmodule>> {
        return new Promise((resolve, reject) => {
            MSubmodule.findById(submoduleId).then((data) => {
                if(data == null){
                    return reject(BaseResponse.error("Submodul tidak ditemukan"))
                }
                if(video != null && video != undefined){
                    this.azureUploader.upload(process.env.AZURE_STORAGE_CONTAINER_NAME_SUBMODULE ?? "", video).then((videoName) => {
                        submodule.video = videoName
                        MSubmodule.findByIdAndUpdate(submoduleId, submodule, {new:true}).then((result) =>{
                            resolve(BaseResponse.success(result as ISubmodule))
                        }).catch((err:Error)=>{
                            reject(BaseResponse.error(err.message))
                        })
                    })
                }else{
                    MSubmodule.findByIdAndUpdate(submoduleId, submodule, {new:true}).then((result) =>{
                        resolve(BaseResponse.success(result as ISubmodule))
                    }).catch((err:Error)=>{
                        reject(BaseResponse.error(err.message))
                    })
                }
            }).catch((err: Error) => {
                console.log(err);
                reject(BaseResponse.error(err.message));
            });
        });
    }
    deleteSubModule(submoduleId: string): Promise<BaseResponse<ISubmodule>> {
        return new Promise((resolve, reject) => {
            MSubmodule.findByIdAndDelete(submoduleId).then((data) => {
                if(data == null){
                    return reject(BaseResponse.error("Submodul tidak ditemukan"))
                }
                MModule.findByIdAndUpdate(data.module, {$pull:{submodule: data._id}}, {new:true}).then((result) =>{
                    resolve(BaseResponse.success(data));
                }).catch((err:Error)=>{
                    reject(BaseResponse.error(err.message))
                })
            }).catch((err: Error) => {
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
                    this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_MODULE ?? "", data.image ?? "").then((url) => {
                        data.image = url
                        // if(data.submodule != null && data.submodule.length > 0){
                        //     data.submodule.forEach((value)=>{
                        //         this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_SUBMODULE ?? "", value.video ?? "").then((url) => {
                        //             value.video = url
                        //         }).catch((err:Error)=>{
                        //             reject(BaseResponse.error(err.message))
                        //         })
                        //     })
                        // }
                        resolve(BaseResponse.success(data));
                    })
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
                    this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_SUBMODULE ?? "", data.video ?? "").then((url) => {
                        data.video = url
                        resolve(BaseResponse.success(data));
                    })
                })
                .catch((err: Error) => {
                    console.log(err);
                    reject(BaseResponse.error(err.message));
                });
        });
    }
    getLessons(module_id: string): Promise<BaseResponse<Array<ISubmodule>>> {
        return new Promise(async (resolve, reject) => {
            MModule.findById(module_id).select("submodule").populate("submodule").exec()
                .then(async (data) => {
                    if(data == null){
                        return reject(BaseResponse.error("Modul tidak ditemukan"))
                    }
                    if(data.submodule == null){
                        return reject(BaseResponse.error("Lesson kosong"))
                    }
                    for(let i = 0; i < data.submodule.length; i++){
                        await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_SUBMODULE ?? "", data.submodule[i].video ?? "").then((url) => {
                            data.submodule![i].video = url
                        })
                    }
                    resolve(BaseResponse.success(data.submodule ?? []));
                })
                .catch((err: Error) => {
                    console.log(err);
                    reject(BaseResponse.error(err.message));
                });
        });
    }
    editModule(moduleId: string, module: IModule, image: Express.Multer.File|undefined): Promise<BaseResponse<IModule>> {
        return new Promise((resolve, reject) =>{
            MModule.findById(moduleId).then((data) => {
                if(data == null){
                    return reject(BaseResponse.error("Modul tidak ditemukan"))
                }
                if(image != null && image != undefined){
                    this.azureUploader.upload(process.env.AZURE_STORAGE_CONTAINER_NAME_MODULE ?? "", image).then((imageName) => {
                        module.image = imageName
                        MModule.findByIdAndUpdate(moduleId, module, {new:true}).select("-quiz -submodule").then((result) =>{
                            resolve(BaseResponse.success(result as IModule))
                        }).catch((err:Error)=>{
                            reject(BaseResponse.error(err.message))
                        })
                    })
                }else{
                    MModule.findByIdAndUpdate(moduleId, module, {new:true}).select("-quiz -submodule").then((result) =>{
                        resolve(BaseResponse.success(result as IModule))
                    }).catch((err:Error)=>{
                        reject(BaseResponse.error(err.message))
                    })
                }
            }).catch((err: Error) => {
                console.log(err);
                reject(BaseResponse.error(err.message));
            });
        });
    }
    deleteModule(moduleId: string): Promise<BaseResponse<IModule>> {
        return new Promise((resolve, reject) => {
            MModule.findByIdAndDelete(moduleId).select("-quiz -submodule").then((data) => {
                if(data == null){
                    return reject(BaseResponse.error("Modul tidak ditemukan"))
                }
                resolve(BaseResponse.success(data));
            }).catch((err: Error) => {
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
                    this.azureUploader.upload(process.env.AZURE_STORAGE_CONTAINER_NAME_QUIZ ?? "", attachment).then((attachmentName) => {
                        quiz.attachment = attachmentName
                        MQuiz.create(quiz).then((data) =>{
                            MModule.findByIdAndUpdate(module, {$push:{quiz: data._id}}, {new:true}).then((result)=>{
                                resolve(BaseResponse.success(data))
                            }).catch((err:Error)=>{
                                reject(BaseResponse.error(err.message))
                            })
                        }).catch((err:Error)=>{
                            reject(BaseResponse.error(err.message))
                        })
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
    getOneQuiz(quizId: string): Promise<BaseResponse<IQuiz>> {
        return new Promise((resolve, reject) => {
            MQuiz.findById(quizId).exec()
                .then((data) => {
                    if(data == null){
                        return reject(BaseResponse.error("Quiz tidak ditemukan"))
                    }
                    this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_QUIZ ?? "", data.attachment ?? "").then((url) => {
                        data.attachment = url
                        resolve(BaseResponse.success(data));
                    })
                })
                .catch((err: Error) => {
                    console.log(err);
                    reject(BaseResponse.error(err.message));
                });
            });
    }
    editQuiz(quizId: string, quiz: IQuiz, attachment: Express.Multer.File | undefined): Promise<BaseResponse<IQuiz>> {
        return new Promise((resolve, reject) => {
            MQuiz.findById(quizId).then((data) => {
                if(data == null){
                    return reject(BaseResponse.error("Quiz tidak ditemukan"))
                }
                if(attachment != null && attachment != undefined){
                    this.azureUploader.upload(process.env.AZURE_STORAGE_CONTAINER_NAME_QUIZ ?? "", attachment).then((attachmentName) => {
                        quiz.attachment = attachmentName
                        MQuiz.findByIdAndUpdate(quizId, quiz, {new:true}).then((result) =>{
                            resolve(BaseResponse.success(result as IQuiz))
                        }).catch((err:Error)=>{
                            reject(BaseResponse.error(err.message))
                        })
                    })
                }else{
                    MQuiz.findByIdAndUpdate(quizId, quiz, {new:true}).then((result) =>{
                        resolve(BaseResponse.success(result as IQuiz))
                    }).catch((err:Error)=>{
                        reject(BaseResponse.error(err.message))
                    })
                }
            }).catch((err: Error) => {
                console.log(err);
                reject(BaseResponse.error(err.message));
            });
        });
    }
    deleteQuiz(quizId: string): Promise<BaseResponse<IQuiz>> {
        return new Promise((resolve, reject) => {
            MQuiz.findByIdAndDelete(quizId).then((data) => {
                if(data == null){
                    return reject(BaseResponse.error("Quiz tidak ditemukan"))
                }
                MModule.findByIdAndUpdate(data.module, {$pull:{quiz: data._id}}, {new:true}).then((result) =>{
                    resolve(BaseResponse.success(data));
                }).catch((err:Error)=>{
                    reject(BaseResponse.error(err.message))
                })
            }).catch((err: Error) => {
                console.log(err);
                reject(BaseResponse.error(err.message));
            });
        });
    }
    getQuizByModule(module: string): Promise<BaseResponse<Array<IQuiz>>> {
        return new Promise((resolve, reject) => {
            MModule.findById(module).select("quiz").populate("quiz", "-attachment").exec()
                .then((data) => {
                    if(data == null){
                        return reject(BaseResponse.error("Modul tidak ditemukan"))
                    }
                    resolve(BaseResponse.success(data.quiz ?? []));
                })
                .catch((err: Error) => {
                    console.log(err);
                    reject(BaseResponse.error(err.message));
                });
        });
    }
    getQuizQuestion(module: string): Promise<BaseResponse<Array<IQuiz>>> {
        return new Promise((resolve, reject) => {
            MModule.findById(module).select("quiz").populate("quiz").exec()
                .then(async (data) => {
                    if(data == null){
                        return reject(BaseResponse.error("Modul tidak ditemukan"))
                    }
                    if(data.quiz == null){
                        return reject(BaseResponse.error("Quiz kosong"))
                    }
                    for(let i = 0; i < data.quiz.length; i++){
                        await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_QUIZ ?? "", data.quiz[i].attachment ?? "").then((url) => {
                            data.quiz![i].attachment = url
                        })
                    }
                    resolve(BaseResponse.success(data.quiz ?? []));
                })
                .catch((err: Error) => {
                    console.log(err);
                    reject(BaseResponse.error(err.message));
                });
        });
    }
    submitQuiz(module:string, creator: string , answer: any): Promise<BaseResponse<IQuizResult>> {
        return new Promise((resolve, reject) => {
            var answers: IQuiz[] = []
            for (let i = 0; i < answer.length; i++) {
                answers[i] = {
                    module : module ?? "",
                    question : answer[i].question,
                    answer : answer[i].answer,
                    option1 : answer[i].option1,
                    option2 : answer[i].option2,
                    option3 : answer[i].option3,
                    option4 : answer[i].option4
                }
            }
            MModule.findById(module).select("quiz").populate("quiz").select("-attachment").exec()
                .then((data) => {
                    if(data == null){
                        return reject(BaseResponse.error("Modul tidak ditemukan"))
                    }
                    if(data.quiz == null){
                        return reject(BaseResponse.error("Quiz kosong"))
                    }
                    if(data.quiz.length == 0){
                        return reject(BaseResponse.error("Quiz kosong"))
                    }
                    var score = 0
                    for (let i = 0; i < data.quiz.length; i++) {
                        if(data.quiz[i].answer == answers[i].answer){
                            score++
                        }
                    }
                    var quizResult: IQuizResult = {
                        creator : creator,
                        module : module,
                        quiz : data.quiz,
                        answers : answers.map((value)=>{return value.answer}),
                        score : score / data.quiz.length*100
                    }
                    MQuizResult.create(quizResult).then((data) => data.populate("quiz", "-attachment")).then((data) => data.populate("module", "_id")).then((data) =>{
                        resolve(BaseResponse.success(data))
                    }).catch((err:Error)=>{
                        reject(BaseResponse.error(err.message))
                    })
                })
                .catch((err: Error) => {
                    console.log(err);
                    reject(BaseResponse.error(err.message));
                });
        });
    }
    getQuizResultByUser(user: string): Promise<BaseResponse<Array<IQuizResult>>> {
        return new Promise((resolve, reject) => {
            MQuizResult.find({creator: user}).populate("module", "name").populate("quiz", "answer").exec().then((data) =>{
                if(data == null){
                    return reject(BaseResponse.error("Quiz result tidak ditemukan"))
                }
                resolve(BaseResponse.success(data))
            }).catch((err:Error)=>{
                reject(BaseResponse.error(err.message))
            })
        });
    }
    getQuizResultById(resultId: string): Promise<BaseResponse<IQuizResult>> {
        return new Promise((resolve, reject) => {
            MQuizResult.findById(resultId).populate("module", "name").populate("quiz", "answer").exec().then((data) =>{
                if(data == null){
                    return reject(BaseResponse.error("Quiz result tidak ditemukan"))
                }
                resolve(BaseResponse.success(data))
            }).catch((err:Error)=>{
                reject(BaseResponse.error(err.message))
            })
        });
    }
}