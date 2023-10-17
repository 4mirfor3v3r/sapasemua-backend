import { BaseResponse } from './../util/BaseResponse';
import { IUser, MUser } from './../model/User';
import { compareSync, hash } from 'bcrypt';

interface IAuthWorker {
	ping(): string;
	login(email: string, password: string): Promise<BaseResponse<IUser>>;
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
							resolve(BaseResponse.error('Password salah'));
						}
					} else {
						resolve(BaseResponse.error('Email tidak ditemukan'));
					}
				})
				.catch((err: Error) => {
					console.log(err);
					reject(BaseResponse.error(err.message));
				});
        })
    }
    
}