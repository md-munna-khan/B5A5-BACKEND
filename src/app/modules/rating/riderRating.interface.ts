import { Types } from "mongoose";

export interface IRiderRating {
  _id?: Types.ObjectId;
  rideId: Types.ObjectId;
  riderId: Types.ObjectId;
  driverId: Types.ObjectId; // who gave this rating
  rating: number; // 1-5
  feedback?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default IRiderRating;
