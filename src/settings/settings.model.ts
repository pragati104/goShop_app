import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  storeName: string;
  clientUrl: string;
  smtpEmail: string;
  smtpPassword: string;
  adminName: string;
  adminEmail: string;
}

const SettingsSchema: Schema = new Schema(
  {
    storeName: { type: String },
    clientUrl: { type: String },
    smtpEmail: { type: String },
    smtpPassword: { type: String },
    adminName: { type: String },
    adminEmail: { type: String },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>("Settings", SettingsSchema);