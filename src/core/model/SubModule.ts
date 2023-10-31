import mongoose from 'mongoose';

export interface ISubmodule {
	module: string;
	name: string;
	video?: string;
	duration: string;
	createdAt?: Date;
	updatedAt?: Date;
}

const schema = new mongoose.Schema({
	module: { type: mongoose.Schema.Types.ObjectId, ref: 'modules', required: true },
	name: { type: String, required: true },
	video: { type: String, required: false },
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