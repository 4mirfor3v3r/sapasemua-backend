import { IController } from "core/shared/IController";
import express from "express";

export class ModuleController implements IController{
    path = "/module"
    router = express.Router();

    
}