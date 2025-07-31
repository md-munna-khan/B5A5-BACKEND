import { Schema, model } from "mongoose";
import { IRide } from "./ride.interface";

const locationSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String },
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
      enum: ["REQUESTED", "ACCEPTED", "COMPLETED", "CANCELLED","IN_TRANSIT","PICKED_UP"],
      default: "REQUESTED",
    },
    rejectedDrivers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    fare: { type: Number },
    timestamps: {
      requestedAt: { type: Date, required: true, default: Date.now },
      acceptedAt: { type: Date },
      completedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

export const RideModel = model<IRide>("Ride", rideSchema);
