/* eslint-disable @typescript-eslint/no-explicit-any */

import { IUser } from "../user/user.interface";
import httpStatus from "http-status-codes";
import { RideModel } from "./ride.model";
import AppError from "../../errorHelpers/AppError";
import { Driver } from "../driver/driver.model";
import {
  IDriverFeedback,
  IRide,
  IRiderFeedback,
  RideStatus,
} from "./ride.interface";
import { Types } from "mongoose";
import { haversineDistance } from "../../utils/haversine";

// Rider requests a new ride

// const requestRide = async (riderId: string, rideData: Partial<IRide>) => {
//   const ongoingRide = await RideModel.findOne({
//     riderId: riderId,
//     rideStatus: { $in: ["REQUESTED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT"] },
//   });

//   if (ongoingRide) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "You already have an ongoing ride."
//     );
//   }

//   const ride = await RideModel.create({
//     riderId: riderId,
//     pickupLocation: rideData.pickupLocation,
//     destination: rideData.destination,
//     rideStatus: "REQUESTED",
//     timestamps: {
//       requestedAt: new Date(),
//     },
//     fare: rideData.fare || 0,
//   });

//   return ride;
// };

// geo
// const requestRide = async (riderId: string, rideData: Partial<IRide>) => {
//   // Check ongoing ride
//   const ongoingRide = await RideModel.findOne({
//     riderId,
//     rideStatus: { $in: ["REQUESTED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT"] },
//   });
//   if (ongoingRide) {
//     throw new AppError(httpStatus.BAD_REQUEST, "You already have an ongoing ride.");
//   }

//   // ✅ Geo-search: Find nearest driver
//   const nearestDriver = await Driver.findOne({
//     location: {
//       $near: {
//         $geometry: {
//           type: "Point",
//           coordinates: [
//             rideData.pickupLocation?.coordinates[0], // lng
//             rideData.pickupLocation?.coordinates[1], // lat
//           ],
//         },
//         $maxDistance: 5000, // meters
//       },
//     },
//     onlineStatus: "Active",
//     ridingStatus: "idle",
//   });

//   if (!nearestDriver) {
//     throw new AppError(httpStatus.NOT_FOUND, "No available drivers nearby.");
//   }

//   // ✅ Create ride with matched driver
//   const ride = await RideModel.create({
//     riderId,
//     driverId: nearestDriver._id,
//     pickupLocation: rideData.pickupLocation,
//     destination: rideData.destination,
//     rideStatus: "REQUESTED",
//     timestamps: { requestedAt: new Date() },
//     fare: rideData.fare || 0,
//   });

//   // ✅ Update driver status
//   nearestDriver.ridingStatus = "waiting_for_pickup";
//   await nearestDriver.save();

//   return ride;
// };

// haversine
const requestRide = async (riderId: string, rideData: Partial<IRide>) => {
  // 1. Check if rider already has an ongoing ride
  const ongoingRide = await RideModel.findOne({
    riderId,
    rideStatus: { $in: ["REQUESTED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT"] },
  });

  if (ongoingRide) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You already have an ongoing ride."
    );
  }

  // 2. Get all drivers who are online and idle
  const allAvailableDrivers = await Driver.find({
    onlineStatus: "Active",
    ridingStatus: "idle",
    location: { $exists: true },
  });

  // 3. Find the nearest driver using Haversine
  const [pickupLng, pickupLat] = rideData.pickupLocation?.coordinates || [0, 0];

  let nearestDriver = null;
  let minDistance = Infinity;
  for (const driver of allAvailableDrivers) {
    if (!driver.location?.coordinates) continue;

    const [driverLng, driverLat] = driver.location.coordinates;

    const distance = haversineDistance(
      pickupLat,
      pickupLng,
      driverLat,
      driverLng
    );
    console.log(distance);

    if (distance < minDistance && distance <= 5000) {
      minDistance = distance;
      nearestDriver = driver;
    }
  }

  if (!nearestDriver) {
    throw new AppError(httpStatus.NOT_FOUND, "No available drivers nearby.");
  }

  // 4. Create ride
  const ride = await RideModel.create({
    riderId,
    driverId: nearestDriver._id,
    pickupLocation: rideData.pickupLocation,
    destination: rideData.destination,
    rideStatus: "REQUESTED",
    timestamps: { requestedAt: new Date() },
    fare: rideData.fare || 0,
  });

  // 5. Update driver status
  // nearestDriver.ridingStatus = "waiting_for_pickup";
  // await nearestDriver.save();

  return {
    ride,
    allAvailableDrivers,
  };
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

// const cancelRide = async (riderId: string, rideId: string) => {
//   const ride = await RideModel.findById(rideId);
//   if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");

//   if (!ride.riderId.equals(riderId)) {
//     throw new AppError(
//       httpStatus.FORBIDDEN,
//       "You can only cancel your own rides."
//     );
//   }

//   // Only allow if status is REQUESTED or ACCEPTED
//   if (!["REQUESTED", "ACCEPTED"].includes(ride.rideStatus)) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "Ride can only be cancelled before pickup."
//     );
//   }

//   // Optional: Allow cancel only within 5 minutes of request
//   const now = new Date();
//   const requestedAt = new Date(ride.timestamps.requestedAt);
//   const diffInMinutes = (now.getTime() - requestedAt.getTime()) / (1000 * 60);

//   if (diffInMinutes > 5) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "Cancel window expired. You can’t cancel after 5 minutes."
//     );
//   }

//   // Mark as cancelled
//   ride.rideStatus = "CANCELLED";
//   ride.timestamps.cancelledAt = new Date();

//   await ride.save();
//   return ride;
// };

// Rider views own rides
const getRiderRides = async (riderId: string) => {
  const rides = await RideModel.find({ riderId })
    .sort({ createdAt: -1 })
    .populate("driverId", "name vehicleType phoneNumber")
    .exec();

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
  const driverDoc = await Driver.findOne({ userId: driverId });
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
  driverDoc.ridingStatus = "waiting_for_pickup";
  await driverDoc.save();

  return ride;
};

const rejectRide = async (rideId: string, driverId: string) => {
  const ride = await RideModel.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  if (ride.driverId?.toString() !== driverId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not assigned to this ride"
    );
  }

  ride.rideStatus = "Rejected";
  await ride.save();

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
const completeRide = async (driverId: string, rideId: string) => {
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

const getDriverEarnings = async (driverId: string) => {
  const rides = await RideModel.find({
    driverId,
    rideStatus: "COMPLETED",
  })
    .sort({ completedAt: -1 })
    .select("fare timestamps.completedAt riderId")
    .populate("riderId", "name phoneNumber");

  const totalEarnings = rides.reduce((sum, ride) => sum + (ride.fare || 0), 0);

  return { totalEarnings, rideCount: rides.length, rides };
};
const giveRiderFeedback = async (
  riderId: string,
  rideId: string,
  feedbackInput: IRiderFeedback
) => {
  const ride = await RideModel.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  // Check if the rider owns this ride
  if (!ride.riderId.equals(new Types.ObjectId(riderId))) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only give feedback on your own rides"
    );
  }

  // Only allow feedback if ride is COMPLETED
  if (ride.rideStatus !== "COMPLETED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Feedback allowed only after ride is completed"
    );
  }

  // Save feedback
  ride.riderFeedback = {
    rating: feedbackInput.rating,
    feedback: feedbackInput.feedback || "",
  };

  await ride.save();

  return ride;
};

const submitDriverFeedback = async (
  rideId: string,
  driverId: string,
  feedback: IDriverFeedback
) => {
  const ride = await RideModel.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  if (!ride.driverId || ride.driverId.toString() !== driverId) {
    throw new AppError(httpStatus.FORBIDDEN, "Not authorized to give feedback");
  }

  if (ride.rideStatus !== "COMPLETED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Feedback allowed only after ride completion"
    );
  }

  if (ride.riderFeedback) {
    throw new AppError(httpStatus.BAD_REQUEST, "Feedback already submitted");
  }

  ride.riderFeedback = {
    rating: feedback.rating,
    feedback: feedback.feedback,
  };

  await ride.save();
  return ride;
};

const updateRideStatus = async (id: string, status: RideStatus) => {
  const ride = await RideModel.findById(id);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  ride.rideStatus = status;

  // Optionally update timestamps
  if (status === "ACCEPTED") {
    ride.timestamps.acceptedAt = new Date();
  }

  if (status === "COMPLETED") {
    ride.timestamps.completedAt = new Date();

    // ✅ Driver status update here
    if (ride.driverId) {
      // Update ridingStatus to "idle"
      await Driver.findOneAndUpdate(
        { userId: ride.driverId },
        {
          ridingStatus: "idle",
          isOnRide: false,
        }
      );
    }
  }

  await ride.save();

  return ride;
};

export const RideService = {
  getDriverEarnings,
  requestRide,
  cancelRide,
  getRiderRides,
  getAvailableRides,
  acceptRide,
  rejectRide,
  pickUpRide,
  markInTransit,
  completeRide,
  getDriverRides,
  getAllRides,
  giveRiderFeedback,
  submitDriverFeedback,
  updateRideStatus,
};
