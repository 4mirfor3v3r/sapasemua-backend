import mongoose from 'mongoose';
import { IUser } from './User';

export interface IComment {
	title: string;
    forumId: string;
	creator: IUser;
    replyTo?: IComment;
	createdAt?: Date;
	updatedAt?: Date;
}

const schema = new mongoose.Schema({
	title: { type: String, required: true },
    forumId: {type:mongoose.Schema.Types.ObjectId, ref:"forums", required: true},
	creator: {type:mongoose.Schema.Types.ObjectId, ref:"users", required: true},
    replyTo: {type:mongoose.Schema.Types.ObjectId, ref:"comments", default: null},
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
export const MComment = mongoose.model<IComment & mongoose.Document>('comments', schema);