import { Schema, model } from "mongoose";
import { IRide } from "./ride.interface";

const locationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: {
      type: String,
    },
  },
  { _id: false }
);



const rideSchema = new Schema<IRide>(
  {
    riderId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    driverId: { type: Schema.Types.ObjectId, ref: "User" },
    pickupLocation: { type: locationSchema, required: true },
    destination: { type: locationSchema, required: true },
    rideStatus: {
      type: String,
      enum: ["REQUESTED", "ACCEPTED",  "COMPLETED", "CANCELLED","IN_TRANSIT","PICKED_UP","REJECTED"],
      default: "REQUESTED",
    },

   // ✅ Payment fields
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "WALLET"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    

       riderFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: { type: String, maxlength: 500 },
    },
  driverFeedback: {
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String, maxlength: 500 },
},
    rejectedDrivers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    fare: { type: Number },
    timestamps: {
      requestedAt: { type: Date, required: true, default: Date.now },
      acceptedAt: { type: Date },
      completedAt: { type: Date },
      cancelledAt: { type: Date },
    },
  },
  
  {
    timestamps: true,
  }
);



export const  RideModel = model<IRide>("Ride", rideSchema);
