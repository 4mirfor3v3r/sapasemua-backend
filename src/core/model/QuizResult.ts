import mongoose from "mongoose";
import { IQuiz } from './Quiz';

export interface IQuizResult {
  creator: string;
  module: string;
  quiz: IQuiz[];
  answers: string[];
  score: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: "modules", required: true },
  quiz: [{type:mongoose.Schema.Types.ObjectId, ref:"quizzes", required: true, default: []}],
  score: {type: Number, required: true, default: 0},
  answers: [{type:String, required: true}],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

schema.pre("update", function update() {
  this.update(
    {},
    {
      $set: {
        updatedAt: Date.now(),
      },
    }
  );
});
export const MQuizResult = mongoose.model<IQuizResult & mongoose.Document>("quiz_results",schema);