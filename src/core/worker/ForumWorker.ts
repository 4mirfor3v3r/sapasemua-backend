import { BaseResponse } from './../util/BaseResponse';
import { IForum, MForum } from './../model/Forum';
import { IComment } from 'core/model/Comment';

interface IForumWorker {
    addForum(forum: IForum) : Promise<BaseResponse<IForum>>;
    getAllForum(): Promise<BaseResponse<Array<IForum>>>;
	getForumById(forumId:string): Promise<BaseResponse<IForum>>;
	editForumById(forumId: string, forum: IForum): Promise<BaseResponse<IForum>>;
    deleteForumById(forumId: string): Promise<BaseResponse<IForum>>;
    addCommentToForum(forumId: string, comment: IComment): Promise<BaseResponse<IForum>>;
}

export default class ForumWorker implements IForumWorker{
    addForum(forum: IForum): Promise<BaseResponse<IForum>> {
        throw new Error('Method not implemented.');
    }
    getAllForum(): Promise<BaseResponse<IForum[]>> {
        throw new Error('Method not implemented.');
    }
    getForumById(forumId: string): Promise<BaseResponse<IForum>> {
        throw new Error('Method not implemented.');
    }
    editForumById(forumId: string, forum: IForum): Promise<BaseResponse<IForum>> {
        throw new Error('Method not implemented.');
    }
    deleteForumById(forumId: string): Promise<BaseResponse<IForum>> {
        throw new Error('Method not implemented.');
    }
    addCommentToForum(forumId: string, comment: IComment): Promise<BaseResponse<IForum>>{
        throw new Error('Method not implemented.');
    }

}