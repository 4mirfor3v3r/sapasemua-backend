import mongoose from "mongoose";
import { IModule, MModule } from "./../model/Module";
import { MUser } from "./../model/User";
import { BaseResponse } from "./../util/BaseResponse";
import { IQuiz, MQuiz } from "./../model/Quiz";
import { ISubmodule, MSubmodule } from "./../model/SubModule";
import { IQuizResult, MQuizResult } from "./../model/QuizResult";

interface IModuleWorker {
    addModule(module: IModule, submodule:any, files: { [fieldname: string]: Express.Multer.File[]; } | undefined): Promise<BaseResponse<IModule>>;
    addSubModule(module: string, submodule:ISubmodule, video: Express.Multer.File|undefined): Promise<BaseResponse<ISubmodule>>;
    getAllModule(): Promise<BaseResponse<Array<IModule>>>;
    getOneModule(module_id: string): Promise<BaseResponse<IModule>>;
    getLesson(module_id: string): Promise<BaseResponse<ISubmodule>>;
    addQuiz(module: string, quiz:IQuiz, attachment: Express.Multer.File|undefined): Promise<BaseResponse<IQuiz>>;
    getQuizByModule(module: string): Promise<BaseResponse<Array<IQuiz>>>;
    getQuizQuestion(module: string): Promise<BaseResponse<Array<IQuiz>>>;
    submitQuiz(module:string, creator: string, answers:IQuiz[]): Promise<BaseResponse<IQuizResult>>;
    getQuizResultByUser(user: string): Promise<BaseResponse<Array<IQuizResult>>>;
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
            MUser.findById(module.creator)
            .then((result)=>{
                if (result) {
                        module.image = (files["image"] as Express.Multer.File[])[0].buffer.toString('base64');
                        MModule.create(module).then((data) =>{
                            var submodules: ISubmodule[] = []
                            for (let i = 0; i < submodule.length; i++) {
                                submodules[i] = {
                                    module : data._id ?? "",
                                    name : submodule[i].name,
                                    duration : submodule[i].duration,
                                    video : (files["modules"] as Express.Multer.File[])[i].buffer.toString('base64')
                                }
                            }
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
                    MQuizResult.create(quizResult).then((data) => data.populate("quiz", "-attachment")).then((data) =>{
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