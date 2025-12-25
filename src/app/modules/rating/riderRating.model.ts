// import mongoose, { Schema, Types, Document } from "mongoose";
// import IRiderRating from "./riderRating.interface";

// export interface IRiderRatingDoc extends IRiderRating, Document {}

// const RiderRatingSchema = new Schema<IRiderRatingDoc>(
//   {
//     rideId: { type: Types.ObjectId, ref: "Ride", required: true },
//     riderId: { type: Types.ObjectId, ref: "User", required: true },
//     driverId: { type: Types.ObjectId, ref: "Driver", required: true },
//     rating: { type: Number, required: true, min: 1, max: 5 },
//     feedback: { type: String, default: "" },
//   },
//   { timestamps: true }
// );

// // Ensure one rating per ride by the same driver
// RiderRatingSchema.index({ rideId: 1, driverId: 1 }, { unique: true });

// export const RiderRatingModel = mongoose.model<IRiderRatingDoc>(
//   "RiderRating",
//   RiderRatingSchema
// );

// export default RiderRatingModel;
