import { Types } from "mongoose";

export enum Role {
  ADMIN = "ADMIN",
  RIDER = "RIDER",
  DRIVER = "DRIVER"
}

export enum UserStatus {
  BLOCKED = "BLOCKED",
  UNBLOCKED = "UNBLOCKED"
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export interface IUser {
  _id?: Types.ObjectId;
 
  name: string;
  email: string;
  password?: string; // Will be hashed with bcryptjs
  role: Role; // Default: RIDER
  isVerified?: boolean; // Default: false
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  isDeleted?:boolean,
  picture?:string,
  auths?: IAuthProvider[];
  phone?: string;
  status?: UserStatus; // Default: UNBLOCKED
  createdAt?: Date;
  updatedAt?: Date;
}
