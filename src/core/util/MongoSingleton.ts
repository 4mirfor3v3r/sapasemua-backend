import mongoose from 'mongoose';
export class MongoSingleton {
    _dbUrl:string
	constructor() {
    this._dbUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/sapa_semua';
	    }
	connect() {
		// mongoose.set('debug', true);
		mongoose
			.connect(this._dbUrl, {
				// useNewUrlParser: true,
			})
			.then(() => console.log(`Connected to Database. Use Default Environment`))
			.catch((err) => {
				console.log(`something wrong ${err}`);
			});
	}
}
