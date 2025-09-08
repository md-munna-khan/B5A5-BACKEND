import { Schema,  model } from "mongoose";
import { IUser, Role, UserStatus } from "./user.interface"; // adjust path as needed

const userSchema = new Schema<IUser>(
  
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
     
    },

    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.RIDER,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    picture: {
      type: String,
      default: "", // Optional: provide a default avatar URL
    },

    phone: {
      type: String,
    },

    auths: [
      {
        provider: {
          type: String,
          enum: ["google", "credentials"],
        },
        providerId: {
          type: String,
        },
      },
    ],

    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.UNBLOCKED,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);

// Exporting the model
export const User = model<IUser>("User", userSchema);
