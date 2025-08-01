import { Types } from "mongoose";

export type RideStatus = "REQUESTED" | "ACCEPTED" | "COMPLETED" | "CANCELLED" |"IN_TRANSIT"|"PICKED_UP"|"Rejected";

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
  address?: string;
}

export interface IRide {
  _id?: Types.ObjectId;
  riderId: Types.ObjectId;
  driverId?: Types.ObjectId;
  pickupLocation: ILocation;
  destination: ILocation;
  rideStatus?: RideStatus;
  rejectedDrivers?: Types.ObjectId[];
  fare?: number;
  timestamps: {
    requestedAt: Date;
    acceptedAt?: Date;
    completedAt?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
