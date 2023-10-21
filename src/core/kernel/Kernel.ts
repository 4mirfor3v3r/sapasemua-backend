import { AppUse } from './Kernel.App.Use';
import express from 'express';
import env from 'dotenv';
const port = process.env.PORT || 19003
export class Kernel {
	_defaultApps: express.Application;
	_defaultAppUse: AppUse;
	constructor() {
		this._defaultApps = express();
		this._defaultAppUse = new AppUse(this._defaultApps);
	}

	appService() {
		this._defaultApps.listen(port, () => {
			console.log(`aplikasi ini berjalan di port ${port}`);
		});
	}
	initEnvironment() {
		env.config({path:".env"});
	}
}
