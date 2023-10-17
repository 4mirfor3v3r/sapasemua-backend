import { BaseResponse } from './../util/BaseResponse';
import { IUser, MUser } from './../model/User';
import { UploadedFile } from 'express-fileupload';
import { hash } from 'bcrypt';

interface IUserWorker {
    addUser(user: IUser) : Promise<BaseResponse<IUser>>;
    getAllUser(): Promise<BaseResponse<Array<IUser>>>;
	getUserByEmail(email:string): Promise<BaseResponse<IUser>>;
	editUserByEmail(email: string, user: IUser, avatar:UploadedFile | null): Promise<BaseResponse<IUser>>;
    deleteUserByEmail(email: string): Promise<BaseResponse<IUser>>;
}

export default class UserWorker implements IUserWorker{

	addUser(user: IUser): Promise<BaseResponse<IUser>> {
        return new Promise((resolve, reject) =>{
            MUser.findOne({email:user.email})
            .then((result)=>{
                if (!result) {
                    hash(user.password,10,(err,hash) =>{
                        user.password = hash
                        MUser.create(user).then((data) =>{
                            resolve(BaseResponse.success(data))
                        }).catch((err:Error)=>{
                            resolve(BaseResponse.error(err.message))
                        })
                    })
                } else {
                    resolve(BaseResponse.error("Email Sudah terdaftar"))
                }
            }).catch((err: Error) => {
                console.log(err);
                reject(BaseResponse.error(err.message));
            });
        });
    }

    getAllUser(): Promise<BaseResponse<IUser[]>> {
        return new Promise((resolve, reject) => {
			MUser.find({},"-password -__v")
				.then((user) => {
					if (user) resolve(BaseResponse.success(user));
					else reject(BaseResponse.error('No One Data'));
				})
				.catch((err: Error) => {
					resolve(BaseResponse.error(err.message));
				});
		});
    }

    getUserByEmail(email: string): Promise<BaseResponse<IUser>> {
        return new Promise((resolve, reject) => {
			MUser.findOne({ _email: email },"-password -__v")
				.then((data) => {
					if (data) resolve(BaseResponse.success(data));
					else reject(BaseResponse.error('Email not Found'));
				})
				.catch((err: Error) => {
					reject(BaseResponse.error(err.message));
				});
		});
    }

    editUserByEmail(email: string, user: IUser, avatar: UploadedFile | null): Promise<BaseResponse<IUser>> {
		if(avatar!=null){
			user.avatar = avatar.data.toString('base64')
		}
        return new Promise((resolve, reject) => {
			if (user) {
				MUser.findOneAndUpdate({ email: email }, { $set: user }, {new:true, fields:"-password -__v"})
					.then((data) => {
						if (data) resolve(BaseResponse.success(data));
						else reject(BaseResponse.error('Something wrong'));
					})
					.catch((err: Error) => {
						reject(BaseResponse.error(err.message));
					});
			} else reject(BaseResponse.error('Something Wrong'));
		});
    }

    deleteUserByEmail(email: string): Promise<BaseResponse<IUser>> {
        return new Promise((resolve, reject) => {
			MUser.findOneAndDelete({ email: email }).select(["-password", "-__v"])
				.then((data) => {
					if (data) resolve(BaseResponse.success(data));
					else reject(BaseResponse.error('Email not Found'));
				})
				.catch((err: Error) => {
					reject(BaseResponse.error(err.message));
				});
		});
    }
}