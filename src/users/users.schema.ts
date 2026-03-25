import { Schema, model,HydratedDocument } from 'mongoose'
import bcrypt from 'bcrypt'


export interface IUser {
  fullname: string
  email: string
  password: string
  role: 'admin' | 'user'
}

const UserSchema = new Schema<IUser>(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (this: HydratedDocument<IUser>) {
  if (!this.isModified('password')) return

  this.password = await bcrypt.hash(this.password, 10)
})

export const User = model<IUser>('User', UserSchema)