export class BaseResponse<T> {
	status: string;
	msg: string;
	response?: T|null;

	constructor(status: string, message: string, result: T|null = null) {
		this.status = status;
		this.msg = message;
		this.response = result;
	}

	static success<T>(result: T): BaseResponse<T> {
		return new BaseResponse<T>('ok', '', result);
    }
    static error<T>(message: string): BaseResponse<T> {
        return new BaseResponse<T>("error",message)
    }
}