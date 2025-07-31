import { z } from "zod";
import {  Role, UserStatus } from "./user.interface";

// Auth Provider validation
const authProviderSchema = z.object({
  provider: z.enum(["google", "credentials"]),
  providerId: z.string({ required_error: "Provider ID is required" }),
});

// Location validation
const locationSchema = z.object({
  lat: z.number({ invalid_type_error: "Latitude must be a number" }),
  lng: z.number({ invalid_type_error: "Longitude must be a number" }),
  address: z.string().optional(),
});

// ✅ Create User Validation
export const createUserZodSchema = z.object({
  
    name: z
      .string({ invalid_type_error: "Name must be a string" })
      .min(2, { message: "Name must be at least 2 characters long." })
      .max(50, { message: "Name cannot exceed 50 characters." }),

    email: z
      .string({ invalid_type_error: "Email must be a string" })
      .email({ message: "Invalid email format" }),

    password: z
      .string({ invalid_type_error: "Password must be a string" })
      .min(8, "Password must be at least 8 characters long")
      .regex(/(?=.*[A-Z])/, "Must contain at least 1 uppercase letter")
      .regex(/(?=.*[!@#$%^&*])/, "Must contain at least 1 special character")
      .regex(/(?=.*\d)/, "Must contain at least 1 number"),

    phone: z
      .string()
      .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message:
          "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
      })
      .optional(),

    role: z.nativeEnum(Role).optional().default(Role.RIDER),


    isDeleted: z.boolean().optional().default(false),
 
    status: z.nativeEnum(UserStatus).optional().default(UserStatus.UNBLOCKED),

    picture: z
      .string({ invalid_type_error: "Picture must be a URL string" })
      .url("Must be a valid image URL")
      .optional(),

    address: z.string().max(200).optional(),

    location: locationSchema.optional(),

    auths: z.array(authProviderSchema).optional(),
  });

export const updateUserZodSchema = z.object({
 
    name: z.string().min(2).max(50).optional(),

    email: z.string().email().optional(),

    password: z
      .string()
      .min(8)
      .regex(/(?=.*[A-Z])/)
      .regex(/(?=.*[!@#$%^&*])/)
      .regex(/(?=.*\d)/)
      .optional(),

    phone: z
      .string()
      .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message:
          "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
      })
      .optional(),

    role: z.nativeEnum(Role).optional(),
   
    isDeleted: z.boolean().optional(),

    status: z.nativeEnum(UserStatus).optional(),

    picture: z.string().url().optional(),
    address: z.string().max(200).optional(),
    location: locationSchema.optional(),
    auths: z.array(authProviderSchema).optional(),
  });

