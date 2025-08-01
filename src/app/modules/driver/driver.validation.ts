import z from "zod";

export const createDriverZodSchema = z.object({
  vehicle: z.object({
    vehicleNumber: z
      .string({ required_error: "Vehicle number is required" })
      .min(3, { message: "Vehicle number must be at least 3 characters." }),
    vehicleType: z.enum(["Bike", "Car"], {
      errorMap: () => ({ message: "Vehicle type must be 'Bike' or 'Car'" }),
    }),
  }),

location: z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()])
}),


  onlineStatus: z
    .enum(["Active", "Offline"])
    .optional(),

  ridingStatus: z
    .enum(["idle", "waiting_for_pickup", "in_transit", "unavailable"])
    .optional(),

  isOnRide: z.boolean().optional(),

  totalEarning: z
    .number()
    .min(0)
    .default(0)
    .optional(),
  status: z
    .enum(["Approved", "Pending", "Suspended"])
    .optional(),

  rating: z.number().min(0).max(5).optional(),

  rideHistory: z
    .array(z.string())
    .optional(),
});


export const updateDriverZodSchema = z.object({
  vehicle: z
    .object({
      vehicleNumber: z.string().min(3).optional(),
      vehicleType: z.enum(["Bike", "Car"]).optional(),
    })
    .optional(),

location: z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()])
}),


  onlineStatus: z.enum(["Active", "Offline"]).optional(),

  ridingStatus: z
    .enum(["idle", "waiting_for_pickup", "in_transit", "unavailable"])
    .optional(),

  isOnRide: z.boolean().optional(),

  totalEarning: z.number().min(0).optional(),

  nid: z.string().optional(),

  drivingLicense: z.string().optional(),

  status: z.enum(["Approved", "Pending", "Suspended"]).optional(),

  rating: z.number().min(0).max(5).optional(),

  rideHistory: z.array(z.string()).optional(),
});
