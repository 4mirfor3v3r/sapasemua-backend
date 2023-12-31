import mongoose from 'mongoose';
import { IQuiz } from './Quiz';
import { ISubmodule } from './SubModule';

export interface IModule {
	_id?: string;
	name: string;
	image?: string;
	level: number;
	description: string;
	quiz?: IQuiz[];
	submodule?: ISubmodule[];
	creator: string;
	createdAt?: Date;
	updatedAt?: Date;
}

const schema = new mongoose.Schema({
	name: { type: String, required: true },
	image: { type: String, required: true },
	level: { type: Number, required: true },
	description: { type: String, required: true },
	quiz: [{type:mongoose.Schema.Types.ObjectId, ref:"quizzes", required: true, default: []}],
	submodule: [{type:mongoose.Schema.Types.ObjectId, ref:"submodules", required: true, default: []}],
	creator: {type:mongoose.Schema.Types.ObjectId, ref:"users", required: true},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

schema.pre('update', function update() {
	this.update(
		{},
		{
			$set: {
				updatedAt: Date.now(),
			},
		}
	);
});
export const MModule = mongoose.model<IModule & mongoose.Document>('modules', schema);