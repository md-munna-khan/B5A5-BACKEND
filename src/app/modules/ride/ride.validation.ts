import { z } from "zod";

const locationSchema = z.object({
  type: z.literal("Point"),
  coordinates: z
    .tuple([
      z.number({ required_error: "Longitude is required" }), 
      z.number({ required_error: "Latitude is required" }),
    ]),
  address: z.string().optional(),
});
const riderFeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().max(500).optional(),
});
const driverFeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().max(500).optional(),
});
// ✅ Payment enums
const paymentMethodEnum = z.enum(["CASH", "CARD", "WALLET"]);
const paymentStatusEnum = z.enum(["PENDING", "PAID", "FAILED"]);
// For creation: riderId is required, rideStatus defaults to REQUESTED, timestamps.requestedAt required
export const createRideZodSchema = z.object({
  driverId: z.string().optional(),
  pickupLocation: locationSchema,
  destination: locationSchema,
  rideStatus: z.enum(["REQUESTED", "ACCEPTED", "COMPLETED","PICKED_UP", "CANCELLED" ,"IN_TRANSIT","REJECTED"]).default("REQUESTED"),
  rejectedDrivers: z.array(z.string()).optional(),
  
  // ✅ Payment required on create
  paymentMethod: paymentMethodEnum,
  paymentStatus: paymentStatusEnum.default("PENDING"),
  timestamps: z.object({
    requestedAt: z.string({ required_error: "RequestedAt is required" }),
    acceptedAt: z.string().optional(),
    completedAt: z.string().optional(),
    cancelledAt: z.string().optional(),
  }),
  fare: z.number({ required_error: "Fare is required" }).min(0),
  riderFeedback: riderFeedbackSchema.optional(),
    driverFeedback: driverFeedbackSchema.optional(),
});

// For update: all fields optional because you might update partial data
export const updateRideZodSchema = z.object({
  driverId: z.string().optional(),
  pickupLocation: locationSchema.optional(),
  destination: locationSchema.optional(),
  rideStatus: z.enum(["REQUESTED", "ACCEPTED", "PICKED_UP","COMPLETED","IN_TRANSIT", "CANCELLED","REJECTED"]).optional(),
  rejectedDrivers: z.array(z.string()).optional(),
  timestamps: z.object({
    requestedAt: z.string().optional(),
    acceptedAt: z.string().optional(),
    completedAt: z.string().optional(),
    cancelledAt: z.string().optional(),
  }).optional(),
  fare: z.number().min(0).optional(),
    riderFeedback: riderFeedbackSchema.optional(),
     driverFeedback: driverFeedbackSchema.optional(),
});
