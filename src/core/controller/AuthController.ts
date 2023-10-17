import { IUser } from './../model/User';
import { AuthWorker } from '../worker/AuthWorker';
import express from 'express';
import { IController } from 'core/shared/IController';

export class AuthController implements IController{
    path = '/auth';
    router = express.Router();
    _worker :AuthWorker;

    constructor(){
        this._worker = new AuthWorker()
        this.initRouter()
    }
    initRouter(){
        this.router.get(`${this.path}/ping`, this.ping);
		this.router.post(`${this.path}/login`, this.login);
    }

    private ping = (req: express.Request, res: express.Response) => {
		return res.send(this._worker.ping());
	};

    private login = async (req: express.Request, res: express.Response) =>{
        var email = req.body.email;
		var password = req.body.password;
		try {
			const data = await this._worker
				.login(email, password);
			res.json(data);
		} catch (err) {
			res.json(err);
		}
    }
}