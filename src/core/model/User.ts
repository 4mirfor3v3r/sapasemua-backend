import mongoose from 'mongoose';

export interface IUser {
	name: string;
	email: string;
	password: string;
	avatar?: string;
	domicile?: string;
	bio	?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

const schema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	avatar: { type: String, required: false,default: null},
	domicile: { type: String, required: false,default: null },
	bio: { type: String, required: false,default: null },
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
export const MUser = mongoose.model<IUser & mongoose.Document>('users', schema);