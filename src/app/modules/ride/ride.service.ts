/* eslint-disable @typescript-eslint/no-explicit-any */

import { IUser } from "../user/user.interface";
import httpStatus from "http-status-codes";
import { RideModel } from "./ride.model";
import AppError from "../../errorHelpers/AppError";
import { Driver } from "../driver/driver.model";
import { IRide } from "./ride.interface";
import { Types } from "mongoose";

// Rider requests a new ride
// const requestRide = async (rider: IUser, rideData: any) => {
const requestRide = async (riderId: string, rideData: Partial<IRide>) => {
  const ongoingRide = await RideModel.findOne({
    riderId: riderId,
    rideStatus: { $in: ["REQUESTED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT"] },
  });

  if (ongoingRide) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You already have an ongoing ride."
    );
  }

  const ride = await RideModel.create({
    riderId: riderId,
    pickupLocation: rideData.pickupLocation,
    destination: rideData.destination,
    rideStatus: "REQUESTED",
    timestamps: {
      requestedAt: new Date(),
    },
    fare: rideData.fare || 0,
  });

  return ride;
};

// Rider cancels a ride (only if status = 'REQUESTED')
const cancelRide = async (driverId: string, rideId: string) => {
  const ride = await RideModel.findById(rideId);
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");

  if (!ride.riderId.equals(driverId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only cancel your own rides."
    );
  }

  if (ride.rideStatus !== "REQUESTED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ride can only be cancelled if it is not accepted yet."
    );
  }

  ride.rideStatus = "CANCELLED";
  ride.timestamps.completedAt = new Date();

  await ride.save();
  return ride;
};

// Rider views own rides
const getRiderRides = async (rider: IUser) => {
  const rides = await RideModel.find({ riderId: rider._id }).sort({
    "timestamps.requestedAt": -1,
  });
  return rides;
};

// Driver views available rides (status: 'REQUESTED')
const getAvailableRides = async () => {
  const rides = await RideModel.find({ rideStatus: "REQUESTED" }).sort({
    "timestamps.requestedAt": 1,
  });
  return rides;
};

// Driver accepts a ride
const acceptRide = async (driverId: string, rideId: string) => {
  const driverDoc = await Driver.findOne({userId:driverId });
  if (!driverDoc)
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found.");
  if (driverDoc.status !== "Approved")
    throw new AppError(httpStatus.FORBIDDEN, "Driver is not approved.");
  if (driverDoc.isOnRide)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Driver is already on another ride."
    );

  const ride = await RideModel.findById(rideId);
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  if (ride.rideStatus !== "REQUESTED")
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ride already accepted or not available."
    );

    ride.driverId = new Types.ObjectId(driverId);
  ride.rideStatus = "ACCEPTED";
  ride.timestamps.acceptedAt = new Date();
  await ride.save();

  driverDoc.isOnRide = true;
  await driverDoc.save();

  return ride;
};

// Driver marks pickup complete
const pickUpRide = async (driverId: string, rideId: string) => {
  const ride = await RideModel.findById(rideId);

  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  if (!ride.driverId?.equals(driverId))
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not assigned to this ride."
    );
  if (ride.rideStatus !== "ACCEPTED")
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ride status must be 'ACCEPTED' to pick up."
    );

  ride.rideStatus = "PICKED_UP";
  await ride.save();

  return ride;
};

// Driver marks in transit
const markInTransit = async (driverId: string, rideId: string) => {
  const ride = await RideModel.findById(rideId);
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  if (!ride.driverId?.equals(driverId))
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not assigned to this ride."
    );
  if (ride.rideStatus !== "PICKED_UP")
    throw new AppError(httpStatus.BAD_REQUEST, "Ride must be picked up first.");

  ride.rideStatus = "IN_TRANSIT";
  await ride.save();

  return ride;
};

// Driver completes the ride
const completeRide = async (driverId:string, rideId: string) => {
  const ride = await RideModel.findById(rideId);
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  if (!ride.driverId?.equals(driverId))
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not assigned to this ride."
    );
  if (ride.rideStatus !== "IN_TRANSIT")
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ride must be in transit to complete."
    );

  ride.rideStatus = "COMPLETED";
  ride.timestamps.completedAt = new Date();

  await ride.save();
 
  const driverDoc = await Driver.findOne({ userId: driverId });
  if (driverDoc) {
    driverDoc.isOnRide = false;
    driverDoc.totalEarning += ride.fare || 0;
    await driverDoc.save();
  }

  return ride;
};

// Driver views their rides
const getDriverRides = async (driver: IUser) => {
  const rides = await RideModel.find({ driverId: driver._id }).sort({
    "timestamps.requestedAt": -1,
  });
  return rides;
};

// Admin gets all rides
const getAllRides = async () => {
  const rides = await RideModel.find({}).sort({ "timestamps.requestedAt": -1 });
  return rides;
};

export const RideService = {
  requestRide,
  cancelRide,
  getRiderRides,
  getAvailableRides,
  acceptRide,
  pickUpRide,
  markInTransit,
  completeRide,
  getDriverRides,
  getAllRides,
};
