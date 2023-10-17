import mongoose from 'mongoose';
export class MongoSingleton {
    _dbUrl:string
	constructor() {
      this._dbUrl =
				"mongodb+srv://public:20031015@test-crud.utmjs38.mongodb.net/sapa_semua?retryWrites=true&w=majority"
    }
	connect() {
		// mongoose.set('debug', true);
		mongoose
			.connect(this._dbUrl, {
				// useNewUrlParser: true,
			})
			.then(() => console.log(`Connected to Database.Use  Default Environment`))
			.catch((err) => {
				console.log(`something wrong ${err}`);
			});
	}
}
