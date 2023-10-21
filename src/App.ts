import { MongoSingleton } from './core/util/MongoSingleton';
import { Kernel } from './core/kernel/Kernel'
import { IController } from './core/shared/IController';

export class App {
    _kernel:Kernel
    _mongoSingleton:MongoSingleton
    constructor(_c:IController[]){
        this._kernel = new Kernel()
        this.initEnvironment()
        this.initController(_c)
        
        this._mongoSingleton = new MongoSingleton()
        this.connectStorage()
    }
    private initController(_c:IController[]){
        _c.forEach((controller) =>{
            this._kernel._defaultApps.use("/api/v1",controller.router)
        })
    }
    private connectStorage(){
        this._mongoSingleton.connect()
    }
    private initEnvironment(){
        this._kernel.initEnvironment()
    }
    listen(){
        this._kernel.appService()
    }
}