import { IQuiz } from './../model/Quiz';
import { IModule } from "./../model/Module";
import { IController } from "core/shared/IController";
import ForumWorker from "../worker/ForumWorker";
import express from "express";
import multer from 'multer';

const upload = multer()

export class ForumController implements IController{
    path = "/forum"
    router = express.Router();
    _worker : ForumWorker;

    constructor(){
        this._worker = new ForumWorker()
        this.initRouter()
    }
    initRouter(){
        // this.router.post(`${this.path}/create`, upload.fields([{name:'attachment'}]), this.addForum);
        // this.router.get(`${this.path}/get-all`, this.getAllForum);
        // this.router.get(`${this.path}/:forum_id`, this.getOneForum);
    }

    
}