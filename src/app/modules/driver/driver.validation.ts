import z from "zod";

export const createDriverZodSchema = z.object({
  userId: z.string({ required_error: "User ID is required" }), // Must be valid ObjectId format in controller

  vehicle: z.object({
    vehicleNumber: z
      .string({ required_error: "Vehicle number is required" })
      .min(3, { message: "Vehicle number must be at least 3 characters." }),
    vehicleType: z.enum(["Bike", "Car"], {
      errorMap: () => ({ message: "Vehicle type must be 'Bike' or 'Car'" }),
    }),
  }),

  location: z.object({
    lat: z
      .number({ invalid_type_error: "Latitude must be a number" })
      .min(-90)
      .max(90),
    lng: z
      .number({ invalid_type_error: "Longitude must be a number" })
      .min(-180)
      .max(180),
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

  nid: z
    .string({ required_error: "NID image URL is required" })
    .url({ message: "NID must be a valid URL (Cloudinary)" })
    .optional(),

  drivingLicense: z
    .string({ required_error: "Driving license image URL is required" })
    .url({ message: "Driving license must be a valid URL (Cloudinary)" })
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

  location: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .partial()
    .optional(),

  onlineStatus: z.enum(["Active", "Offline"]).optional(),

  ridingStatus: z
    .enum(["idle", "waiting_for_pickup", "in_transit", "unavailable"])
    .optional(),

  isOnRide: z.boolean().optional(),

  totalEarning: z.number().min(0).optional(),

  nid: z.string().url().optional(),

  drivingLicense: z.string().url().optional(),

  status: z.enum(["Approved", "Pending", "Suspended"]).optional(),

  rating: z.number().min(0).max(5).optional(),

  rideHistory: z.array(z.string()).optional(),
});
