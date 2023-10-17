import mongoose from 'mongoose';

export interface IModule {
	name: string;
	createdAt?: Date;
	updatedAt?: Date;
}

const schema = new mongoose.Schema({
	name: { type: String, required: true },
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
export const MUser = mongoose.model<IModule & mongoose.Document>('modules', schema);