export class BaseResponse<T> {
	status: string;
	msg: string;
	response?: T|null;
	page?: number;
	totalPage?: number;

	constructor(status: string, message: string, result: T|null = null, page?: number, totalPage?: number) {
		this.status = status;
		this.msg = message;
		this.response = result;
		this.page = page;
		this.totalPage = totalPage;
	}

	static success<T>(result: T, page?: number, totalPage?: number): BaseResponse<T> {
		return new BaseResponse<T>('ok', '', result, page, totalPage);
    }
    static error<T>(message: string): BaseResponse<T> {
        return new BaseResponse<T>("error",message)
    }
}