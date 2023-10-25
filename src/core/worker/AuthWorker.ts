import { BaseResponse } from './../util/BaseResponse';
import { IUser, MUser } from './../model/User';
import { compareSync, hash } from 'bcrypt';

interface IAuthWorker {
	ping(): string;
	login(email: string, password: string): Promise<BaseResponse<IUser>>;
	register(user: IUser): Promise<BaseResponse<IUser>>;
	me(user: string): Promise<BaseResponse<IUser>>;
}

export class AuthWorker implements IAuthWorker {
    ping(): string {
        return "Pong";
    }

    login(email: string, password: string): Promise<BaseResponse<IUser>> {
        return new Promise((resolve, reject)=>{
            MUser.findOne({ email: email })
				.then((result) => {
					if (result) {
						if (compareSync(password, result.password)) {
							resolve(BaseResponse.success(result));
						} else {
							reject(BaseResponse.error('Password salah'));
						}
					} else {
						reject(BaseResponse.error('Email tidak ditemukan'));
					}
				})
				.catch((err: Error) => {
					console.log(err);
					reject(BaseResponse.error(err.message));
				});
        })
    }

    register(user: IUser): Promise<BaseResponse<IUser>> {
        return new Promise((resolve, reject) =>{
            MUser.findOne({email:user.email})
            .then((result)=>{
                if (!result) {
                    hash(user.password,10,(err,hash) =>{
                        user.password = hash
                        MUser.create(user).then((data) =>{
                            resolve(BaseResponse.success(data))
                        }).catch((err:Error)=>{
                            reject(BaseResponse.error(err.message))
                        })
                    })
                } else {
                    reject(BaseResponse.error("Email Sudah terdaftar"))
                }
            }).catch((err: Error) => {
                console.log(err);
                reject(BaseResponse.error(err.message));
            });
        });
    }

	me(user: string): Promise<BaseResponse<IUser>> {
		return new Promise((resolve, reject) =>{
			MUser.findById(user)
			.then((result)=>{
				if (result) {
					resolve(BaseResponse.success(result))
				} else {
					reject(BaseResponse.error("User tidak ditemukan"))
				}
			}).catch((err: Error) => {
				console.log(err);
				reject(BaseResponse.error(err.message));
			});
		});
	}
}