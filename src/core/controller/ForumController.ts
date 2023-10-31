import { IQuiz } from './../model/Quiz';
import { IComment } from "./../model/Comment";
import { IController } from "core/shared/IController";
import ForumWorker from "../worker/ForumWorker";
import express from "express";
import multer from 'multer';
import { IForum } from 'core/model/Forum';

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
        this.router.post(`${this.path}/create`, upload.single('attachment'), this.addForum);
        this.router.get(`${this.path}/get-all`, this.getAllForum);
        this.router.get(`${this.path}/:forum_id`, this.getOneForum);
        this.router.post(`${this.path}/:forum_id`, upload.single('attachment'), this.editForum);
        this.router.delete(`${this.path}/:forum_id`, this.deleteForum);
        this.router.post(`${this.path}/:forum_id/comment`, this.addComment);
        this.router.post(`${this.path}/:forum_id/like`, this.addLikeToForum);
        this.router.post(`${this.path}/:forum_id/dislike`, this.removeLikeFromForum);
    }

    private addForum = async (req: express.Request, res: express.Response) => {
        var forum: IForum = {
            title : req.body.title,
            description : req.body.description,
            creator : req.body.creator
        }
        try {
            const data = await this._worker.addForum(forum, req.file);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private getAllForum = async (req: express.Request, res: express.Response) => {
        try {
            const page = Number(req.query.page) || 1;
            const pageSize = Number(req.query.pageSize) || 10;
            const data = await this._worker.getAllForum(page, pageSize);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private getOneForum = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.getForumById(req.params.forum_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    
    private editForum = async (req: express.Request, res: express.Response) => {
        var forum: IForum = {
            title : req.body.title,
            description : req.body.description,
            creator : req.body.creator
        }
        try {
            const data = await this._worker.editForumById(req.params.forum_id, forum, req.file);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private deleteForum = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.deleteForumById(req.params.forum_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private addComment = async (req: express.Request, res: express.Response) => {
        var comment: IComment = {
            title : req.body.title,
            forumId : req.params.forum_id,
            creator : req.body.creator,
            replyTo : req.body.replyTo
        }
        try {
            const data = await this._worker.addCommentToForum(req.params.forum_id, comment);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private addLikeToForum = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.addLikeToForum(req.params.forum_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
    private removeLikeFromForum = async (req: express.Request, res: express.Response) => {
        try {
            const data = await this._worker.removeLikeFromForum(req.params.forum_id);
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }

}