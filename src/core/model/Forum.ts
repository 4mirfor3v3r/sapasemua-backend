import mongoose from 'mongoose';
import { IComment } from './Comment';
import { IUser } from './User';
import { AzureUploader } from './../util/AzureUploader';

export interface IForum {
	title: string;
	description?: string;
	attachment?: string;
	likes?: number;
	comment?: IComment[];
	creator: IUser;
	createdAt?: Date;
	updatedAt?: Date;
}

const schema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	attachment: { type: String, required: false, default: null},
	likes: { type: Number, required: true, default: 0 },
	creator: {type:mongoose.Schema.Types.ObjectId, ref:"users", required: true},
	comment: [{type:mongoose.Schema.Types.ObjectId, ref:"comments", required: true, default: []}],
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
export const MForum = mongoose.model<IForum & mongoose.Document>('forums', schema);