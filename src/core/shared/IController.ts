import { Router } from 'express';

export interface IController { 
  path: String,
  router: Router
}