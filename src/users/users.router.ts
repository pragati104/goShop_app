import { Router } from "express";
import { fetchUsers, login, signup, updateUser, verify, fetchSession, updateUserProfile} from "./users.controller";
import { AdminAccessMiddleware, AuthAccessMiddleware, UserAccessMiddleware } from "../middleware/auth.middleware";
export const userRouter = Router()

userRouter.get("/users", AdminAccessMiddleware, fetchUsers)
userRouter.get("/session", UserAccessMiddleware, fetchSession)
userRouter.put("/update", UserAccessMiddleware, updateUserProfile)
userRouter.put("/users/:id", AuthAccessMiddleware ,updateUser)
userRouter.post("/login", login)
userRouter.post("/signup", signup)
userRouter.post("/verify", verify)