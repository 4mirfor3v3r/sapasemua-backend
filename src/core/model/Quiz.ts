import mongoose from "mongoose";

export interface IQuiz {
  _id?: string;
  module: string;
  question: string;
  answer: string;
  attachment?: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new mongoose.Schema({
  module: { type: mongoose.Schema.Types.ObjectId, ref: "modules", required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  attachment: { type: String, required: true },
  option1: { type: String, required: true },
  option2: { type: String, required: true },
  option3: { type: String, required: true },
  option4: { type: String, required: true },
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
export const MQuiz = mongoose.model<IQuiz & mongoose.Document>("quizzes",schema);