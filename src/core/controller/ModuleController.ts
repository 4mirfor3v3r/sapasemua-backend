import { IQuiz } from './../model/Quiz';
import { IModule } from "./../model/Module";
import { IController } from "core/shared/IController";
import ModuleWorker from "../worker/ModuleWorker";
import express from "express";

import multer from 'multer';
import { ISubmodule } from 'core/model/SubModule';

const upload = multer({ storage: multer.memoryStorage() })

export class ModuleController implements IController{
    path = "/module"
    router = express.Router();
    _worker : ModuleWorker;

    constructor(){
        this._worker = new ModuleWorker()
        this.initRouter()
    }
    initRouter(){
        this.router.post(`${this.path}/create`, upload.fields([{name:'image', maxCount:1},{name:'modules'}]), this.addModule);
        this.router.post(`${this.path}/:module_id/edit`, upload.single("image"), this.editModule);
        this.router.post(`${this.path}/submodule/create`, upload.single("video"), this.addSubModule);
        this.router.post(`${this.path}/submodule/:submodule_id/edit`, upload.single("video"), this.editSubModule);
        this.router.delete(`${this.path}/submodule/:submodule_id`, this.deleteSubModule);
        this.router.get(`${this.path}/get-all`, this.getAllModule);
        this.router.get(`${this.path}/:module_id`, this.getOneModule);
        this.router.delete(`${this.path}/:module_id`, this.deleteModule);
        this.router.get(`${this.path}/:module_id/quiz`, this.getQuizQuestion);
        this.router.get(`${this.path}/:module_id/quiz/list`, this.getQuizByModule)
        this.router.get(`${this.path}/lesson/:lesson_id`, this.getLesson);
        this.router.get(`${this.path}/:module_id/submodule`, this.getLessons);
        this.router.post(`${this.path}/quiz/create`, upload.single("attachment"), this.addQuiz);
        this.router.get(`${this.path}/quiz/:quiz_id`, this.getOneQuiz);
        this.router.post(`${this.path}/quiz/:quiz_id/edit`, upload.single("attachment"), this.editQuiz);
        this.router.delete(`${this.path}/quiz/:quiz_id`, this.deleteQuiz);
        this.router.post(`${this.path}/quiz/submit`, this.submitQuiz);
        this.router.get(`${this.path}/quiz/:user_id/result`, this.getQuizResultByUser);
        this.router.get(`${this.path}/quiz/result/:result_id`, this.getQuizResultById);
    }
    private addModule = async (req: express.Request, res: express.Response) => {
        var module: IModule = {
            name : req.body.name,
            level : req.body.level,
            description : req.body.description,
            creator : req.body.creator
        }
        try {
            const data = await this._worker.addModule(module, req.body.submodule, req.files as { [fieldname: string]: Express.Multer.File[]; } | undefined);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private editModule = async (req: express.Request, res: express.Response) => {
        var module: IModule = {
            name : req.body.name,
            level : req.body.level,
            description : req.body.description,
            creator : req.body.creator
        }
        try {
            const data = await this._worker.editModule(req.params.module_id, module, req.file);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private addSubModule = async (req: express.Request, res: express.Response) => {
        var submodule: ISubmodule = {
            module : req.body.module,
            name : req.body.name,
            duration : req.body.duration
        }
        try {
            const data = await this._worker.addSubModule(req.body.module, submodule, req.file);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private editSubModule = async (req: express.Request, res: express.Response) => {
        var submodule: ISubmodule = {
            module : req.body.module,
            name : req.body.name,
            duration : req.body.duration
        }
        try {
            const data = await this._worker.editSubModule(req.params.submodule_id, submodule, req.file);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private deleteSubModule = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.deleteSubModule(req.params.submodule_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private getAllModule = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.getAllModule();
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private getOneModule = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.getOneModule(req.params.module_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private deleteModule = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.deleteModule(req.params.module_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private getLesson = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.getLesson(req.params.lesson_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private getLessons = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.getLessons(req.params.module_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private addQuiz = async (req: express.Request, res: express.Response) => {
        var quiz: IQuiz = {
            module : req.body.module,
            question : req.body.question,
            answer : req.body.answer,
            option1 : req.body.option1,
            option2 : req.body.option2,
            option3 : req.body.option3,
            option4 : req.body.option4
        }
        try {
            const data = await this._worker.addQuiz(req.body.module, quiz, req.file);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private getOneQuiz = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.getOneQuiz(req.params.quiz_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private editQuiz = async (req: express.Request, res: express.Response) => {
        var quiz: IQuiz = {
            module : req.body.module,
            question : req.body.question,
            answer : req.body.answer,
            option1 : req.body.option1,
            option2 : req.body.option2,
            option3 : req.body.option3,
            option4 : req.body.option4
        }
        try {
            const data = await this._worker.editQuiz(req.params.quiz_id, quiz, req.file);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private deleteQuiz = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.deleteQuiz(req.params.quiz_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private getQuizByModule = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.getQuizByModule(req.params.module_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private submitQuiz = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.submitQuiz(req.body.module_id, req.body.creator, req.body.answer);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private getQuizResultByUser = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.getQuizResultByUser(req.params.user_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private getQuizResultById = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.getQuizResultById(req.params.result_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private getQuizQuestion = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.getQuizQuestion(req.params.module_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
}