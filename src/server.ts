import { UserController } from './core/controller/UserController';
import { AuthController } from './core/controller/AuthController';
import { ModuleController } from './core/controller/ModuleController';
import { ForumController } from './core/controller/ForumController';
import { App } from './App'

// List of Controller
const app = new App([
    new AuthController(),
    new UserController(),
    new ModuleController(),
    new ForumController()
])
app.listen()