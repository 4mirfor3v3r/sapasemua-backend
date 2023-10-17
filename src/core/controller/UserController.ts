import { IUser } from "core/model/User";
import { IController } from "core/shared/IController";
import UserWorker from "../worker/UserWorker";
import express from "express";
import { UploadedFile } from "express-fileupload";

export class UserController implements IController{
    path = '/user';
    router = express.Router();
    _worker : UserWorker
    constructor(){
        this._worker = new UserWorker();
        this.initRouter()
    }
    initRouter(){
		this.router.get(`${this.path}/get-all`, this.getAllUser);
        this.router.get(`${this.path}/get-user-by-email`, this.getUserByEmail);
		this.router.post(`${this.path}/add`, this.addUser);
		this.router.post(`${this.path}/update/:email`, this.updateUserByEmail);
		this.router.post(`${this.path}/delete/:email`, this.deleteUser);
    }

    private getUserByEmail = (req: express.Request, res: express.Response) => {
		this._worker.getUserByEmail(req.body.email).then((data)=>{
			res.json(data)
		}).catch((error) => {
			res.json(error)
		})
	};

    private getAllUser = (req: express.Request, res: express.Response)=>{
		this._worker.getAllUser().then((data)=>{
			res.json(data)
		}).catch((error) => {
			res.json(error)
		})
    }

    private addUser = (req: express.Request, res: express.Response)=>{
        var data :IUser = {
			name:req.body.name,
			email:req.body.email,
			password:req.body.password
		};
	
		this._worker
			.addUser(data)
			.then((data: any) => {
				res.json(data);
			})
			.catch((err: Error) => {
				res.json(err);
			});
    }

    private updateUserByEmail = (req: express.Request, res: express.Response)=>{
		var email = req.params.email;
		var avatar = req.files?.avatar as UploadedFile | null
		var model: IUser = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
		};
		this._worker.editUserByEmail(email, model,avatar).then((data)=>{
			res.json(data)
		}).catch((error)=>{
			res.json(error)
		})
    }

    private deleteUser = (req: express.Request, res: express.Response)=>{
        var email = req.params.email;
		this._worker.deleteUserByEmail(email).then((data)=>{
			res.json(data)
		}).catch((error)=>{
			res.json(error)
		})
    }
}