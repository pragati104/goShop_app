import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    fullname: string;
    email: string;
    role: string;
  };
}

// 🔥 COMMON FUNCTION (reuse everywhere)
const verifyAuth = (req: AuthRequest) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new Error("No token provided");
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    throw new Error("Invalid token format");
  }

  const payload = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as AuthRequest["user"];

  return payload;
};


// ✅ ANY LOGGED-IN USER
export const AuthAccessMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = verifyAuth(req);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      message: err instanceof Error ? err.message : "Unauthorized",
    });
  }
};


// ✅ ONLY ADMIN
export const AdminAccessMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = verifyAuth(req);

    if (payload!.role !== "admin") {
      return res.status(403).json({
        message: "Access denied (Admin only)",
      });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      message: err instanceof Error ? err.message : "Unauthorized",
    });
  }
};


// ✅ USER + ADMIN (optional flexibility)
export const UserAccessMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = verifyAuth(req);

    if (!["user", "admin"].includes(payload!.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      message: err instanceof Error ? err.message : "Unauthorized",
    });
  }
};