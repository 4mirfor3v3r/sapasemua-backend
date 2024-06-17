import { AzureUploader } from './../util/AzureUploader';
import { BaseResponse } from './../util/BaseResponse';
import { IUser, MUser } from './../model/User';
import { compareSync, hash } from 'bcrypt';
import { MComment } from './../model/Comment';
import { MForum } from './../model/Forum';

interface IAuthWorker {
	ping(): string;
	login(email: string, password: string): Promise<BaseResponse<IUser>>;
	register(user: IUser): Promise<BaseResponse<IUser>>;
	me(user: string): Promise<BaseResponse<IUser>>;
	editUser(userId:string,user: any, avatar?: Express.Multer.File|undefined): Promise<BaseResponse<IUser>>;
}

export class AuthWorker implements IAuthWorker {
    private azureUploader = new AzureUploader()

    ping(): string {
        return "Pong";
    }

    login(email: string, password: string): Promise<BaseResponse<IUser>> {
        return new Promise((resolve, reject)=>{
            MUser.findOne({ email: email })
				.then(async (result) => {
					if (result) {
						if (compareSync(password, result.password)) {
							if(result.avatar!=undefined){
								await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_USER ??"", result.avatar).then((avatarUrl) => {
									result.avatar = avatarUrl
								})
							}
							resolve(BaseResponse.success(result))
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
			.then(async (result)=>{
				if (result) {
					if(result.avatar!=undefined){
						await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_USER ??"", result.avatar).then((avatarUrl) => {
							result.avatar = avatarUrl
							resolve(BaseResponse.success(result))
						})
					}else{
						resolve(BaseResponse.success(result))
					}
				} else {
					reject(BaseResponse.error("User tidak ditemukan"))
				}
			}).catch((err: Error) => {
				console.log(err);
				reject(BaseResponse.error(err.message));
			});
		});
	}
	
    editUser(userId:string, user: any, avatar?: Express.Multer.File|undefined): Promise<BaseResponse<IUser>>  {
        return new Promise(async (resolve, reject) => {
				if(avatar!=undefined){
					await this.azureUploader.upload(process.env.AZURE_STORAGE_CONTAINER_NAME_USER??"", avatar).then((avatarName) => {
						user.avatar = avatarName
					})
				}
				MUser.findByIdAndUpdate(userId, user,{new:true, fields: "-password -__v" })
					.then((data) => {
						if (data) resolve(BaseResponse.success(data));
						else reject(BaseResponse.error('Something wrong'));
					})
					.catch((err: Error) => {
						reject(BaseResponse.error(err.message));
					});
		});
    }

	dashboard(user: string):Promise<BaseResponse<any>>{
		return new Promise((resolve, reject) => {
			MUser.findById(user).then(async (result) => {
					if (result) {
						if(result.avatar!=undefined){
							await this.azureUploader.getFileSasUrl(process.env.AZURE_STORAGE_CONTAINER_NAME_USER ??"", result.avatar).then((avatarUrl) => {
								result.avatar = avatarUrl

								MComment.count({ creator: user }).then((commentCount) => {
									MForum.count({ creator: user }).then((postCount) => {
										resolve(BaseResponse.success({
											user: result,
											totalComment: commentCount,
											totalPost: postCount
										}));
									}).catch((err: Error) => {
										reject(BaseResponse.error(err.message));
									})
								}).catch((err: Error) => {
									reject(BaseResponse.error(err.message));
								})
							})
						}else{
							MComment.count({ creator: user }).then((commentCount) => {
								MForum.count({ creator: user }).then((postCount) => {
									resolve(BaseResponse.success({
										user: result,
										totalComment: commentCount,
										totalPost: postCount
									}));
								}).catch((err: Error) => {
									reject(BaseResponse.error(err.message));
								})
							}).catch((err: Error) => {
								reject(BaseResponse.error(err.message));
							})
						}	
					} else {
						reject(BaseResponse.error('User not found'));
					}
				})
				.catch((err: Error) => {
					console.log(err);
					reject(BaseResponse.error(err.message));
				});
		})
	}

}