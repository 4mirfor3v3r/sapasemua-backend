import mongoose from 'mongoose';

export interface IUser {
	_id?: string;
	name: string;
	email: string;
	password: string;
	avatar?: string;
	domicile?: string;
	bio	?: string;
	role?: string;
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
	role: { type: String, required: true,default: "PEMELAJAR" },
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