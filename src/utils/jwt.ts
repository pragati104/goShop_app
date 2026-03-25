import jwt from 'jsonwebtoken'

export const createToken = (body: any)=>{
    return jwt.sign(body, process.env.JWT_SECRET as string, {expiresIn: '30d'})
}

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded; // returns payload if valid
  } catch (error) {
    return null; // invalid or expired token
  }
};