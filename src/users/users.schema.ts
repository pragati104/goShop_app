import { Schema, model, HydratedDocument } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser {
  fullname: string
  email: string
  password: string
  role: 'admin' | 'user'

  // ✅ Profile fields
  mobile?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
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

    // ✅ Added fields
    mobile: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
  },
  { timestamps: true }
)

// ✅ Hash password before save
UserSchema.pre('save', async function (this: HydratedDocument<IUser>) {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

export const User = model<IUser>('User', UserSchema)