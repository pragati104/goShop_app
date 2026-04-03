import { Request, Response } from "express";
import { User } from "./users.schema";
import bcrypt from 'bcrypt'
import { createToken, verifyToken } from "../utils/jwt";
import bcypt from "bcrypt"
import { AuthRequest } from "../middleware/auth.middleware";

export const signup = async (req: Request, res: Response) => {
  try {
    const user = await User.create({
      fullname: req.body.fullname,
      email: req.body.email,
      password: req.body.password,
      role: "user", // force default
    });

    const payload = {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    };

    const token = createToken(payload);

    res.json({
      ...payload,
      token,
    });
  } catch (err) {
    if (err instanceof Error)
      res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response)=>{
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})

        if(!user)
            throw new Error("User not found try to signup first")

        const isLogin = bcrypt.compareSync(password, user.password)

        if(!isLogin)
            throw new Error("Incorrect password")

        const payload = {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role
        }
        const token = createToken(payload)
        res.json({
            ...payload,
            token
        })
    }
    catch(err)
    {
        if(err instanceof Error)
            res.status(500).json({message: err.message})
    }
}

export const verify = async (req: Request, res: Response)=>{
    try {
        const {token} = req.body
        const payload = verifyToken(token)
        
        if(!payload)
            throw new Error("Invalid token")
        
        res.json(payload)
    }
    catch(err)
    {
        if(err instanceof Error)
            res.status(500).json({message: err.message})
    }
}

export const fetchUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await User.find(
            { _id: { $ne: req.user?.id } },
            "-password"
        )
        .sort({createdAt: -1});
        
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err instanceof Error ? err.message : 'Something went wrong' });
    }
}


export const updateUser = async (req: Request, res: Response)=>{
    try {
        const password = req.body.password
        if(password)
        {
            req.body.password = await bcrypt.hash(password.toString(), 12)
        }

        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})

        if(!user)
            throw new Error("Failed to update")

        res.json({message: "User updated"})
    }
    catch(err)
    {
        if(err instanceof Error)
            res.status(500).json({message: err.message})
    }
}

export const fetchSession = async (req: AuthRequest, res: Response)=>{
    try {
        const user = await User.findById(req.user?.id, {password: 0})
        
        if(!user)
            throw new Error("Bad request")
        
        res.json(user)
    }
    catch(err)
    {
        if(err instanceof Error)
            res.status(500).json({message: err.message})
    }
}

export const updateUserProfile = async (req: AuthRequest, res: Response)=>{
    try {
        if(req.body.password)
        {
            req.body.password = await bcrypt.hash(req.body.password.toString(), 12)
        }
        const user = await User.findByIdAndUpdate(
  req.user?.id,
  req.body,
  { new: true }
);
        
        if(!user)
            throw new Error("User not found")
        
        res.json({message: "Profile updated"})
    }
    catch(err)
    {
        if(err instanceof Error)
            res.status(500).json({message: err.message})
    }
}