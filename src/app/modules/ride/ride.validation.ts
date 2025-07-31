import { z } from "zod";

const locationSchema = z.object({
  lat: z.number({ required_error: "Latitude is required" }),
  lng: z.number({ required_error: "Longitude is required" }),
  address: z.string().optional(),
});

// For creation: riderId is required, rideStatus defaults to REQUESTED, timestamps.requestedAt required
export const createRideZodSchema = z.object({
  driverId: z.string().optional(),
  pickupLocation: locationSchema,
  destination: locationSchema,
  rideStatus: z.enum(["REQUESTED", "ACCEPTED", "COMPLETED","PICKED_UP", "CANCELLED" ,"IN_TRANSIT"]).default("REQUESTED"),
  rejectedDrivers: z.array(z.string()).optional(),
  timestamps: z.object({
    requestedAt: z.string({ required_error: "RequestedAt is required" }),
    acceptedAt: z.string().optional(),
    completedAt: z.string().optional(),
  }),
  fare: z.number({ required_error: "Fare is required" }).min(0),
});

// For update: all fields optional because you might update partial data
export const updateRideZodSchema = z.object({
  driverId: z.string().optional(),
  pickupLocation: locationSchema.optional(),
  destination: locationSchema.optional(),
  rideStatus: z.enum(["REQUESTED", "ACCEPTED", "PICKED_UP","COMPLETED","IN_TRANSIT", "CANCELLED"]).optional(),
  rejectedDrivers: z.array(z.string()).optional(),
  timestamps: z.object({
    requestedAt: z.string().optional(),
    acceptedAt: z.string().optional(),
    completedAt: z.string().optional(),
  }).optional(),
  fare: z.number().min(0).optional(),
});
