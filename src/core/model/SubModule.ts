import mongoose from 'mongoose';

export interface ISubmodule {
	name: string;
	video?: string;
	duration: string;
	createdAt?: Date;
	updatedAt?: Date;
}

const schema = new mongoose.Schema({
	name: { type: String, required: true },
	video: { type: String, required: true },
	duration: { type: String, required: true },
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
export const MSubmodule = mongoose.model<ISubmodule & mongoose.Document>('submodules', schema);