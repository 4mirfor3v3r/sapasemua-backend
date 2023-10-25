import bodyParser from 'body-parser';
import { Application } from 'express';
// import fileUpload from 'express-fileupload';
export class AppUse {
	constructor(private app: Application) {
		this.setup();
	}
	private setup() {
		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.use(bodyParser.raw());
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.text());
		// this.app.use(
		// 	fileUpload({
		// 		limits:{fileSize:10000000},
		// 		abortOnLimit:true
		// 	})
		// )
	}
}
