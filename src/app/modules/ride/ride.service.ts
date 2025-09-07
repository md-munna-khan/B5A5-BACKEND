/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */


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
import { Role } from "../user/user.interface";

// Rider requests a new ride

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
   paymentMethod: rideData.paymentMethod || "CASH",
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




interface JwtPayload {
  userId: string;
  role: Role;
}

 const cancelRide = async (user: JwtPayload, rideId: string) => {
  const ride = await RideModel.findById(rideId);
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");

  const userId = new Types.ObjectId(user.userId);

  // Rider can cancel only their own rides
  if (user.role === Role.RIDER && !ride.riderId.equals(userId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only cancel your own rides."
    );
  }

  // Driver can cancel only assigned rides
  if (user.role === Role.DRIVER && !ride.driverId?.equals(userId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only cancel rides assigned to you."
    );
  }

  // Only REQUESTED or ACCEPTED rides can be cancelled
  if (!["REQUESTED", "ACCEPTED"].includes(ride.rideStatus?? "")) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ride can only be cancelled before pickup."
    );
  }

  ride.rideStatus = "CANCELLED";
  ride.timestamps.cancelledAt = new Date(); // cancel timestamp

  await ride.save();
  return ride;
};



// Rider views own rides
const getRiderRides = async (
  riderId: string,
  page: number,
  limit: number,
  rideStatus?: string,
  startDate?: string,
  endDate?: string,
  minFare?: number,  
  maxFare?: number
) => {
  const filter: any = { riderId };
  

  // filter by status
  if (rideStatus) {
    filter.rideStatus = rideStatus;
  }

  // filter by date range
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // filter by fare range
  if (minFare !== undefined || maxFare !== undefined) {
    filter.fare = {};
    if (minFare !== undefined) filter.fare.$gte = minFare;
    if (maxFare !== undefined) filter.fare.$lte = maxFare;
  }

  const skip = (page - 1) * limit;

  const rides = await RideModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("driverId", "name vehicleType phone")
    .exec();

  const total = await RideModel.countDocuments(filter);

  return {
    rides,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
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

  ride.rideStatus = "REJECTED";
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

  // ✅ Handle payment status
  try {
    // Example logic: if fare > 0, mark as PAID, else mark as FAILED
    if (ride.fare && ride.fare > 0) {
      ride.paymentStatus = "PAID";
    } else {
      ride.paymentStatus = "FAILED";
    }
  } catch (err) {
    ride.paymentStatus = "FAILED";
  }

  await ride.save();

  const driverDoc = await Driver.findOne({ userId: driverId });
  if (driverDoc) {
    driverDoc.isOnRide = false;
    driverDoc.totalEarning += ride.fare || 0;
    await driverDoc.save();
  }

  return ride;
};

// ---------------- Service ----------------
const getDriverRides = async (
  driverId: string,
  status?: string,
  page = 1,
  limit = 10
) => {
  const filter: any = { driverId };

  // optional status filter
  if (status) {
    filter.rideStatus = status; // e.g. REQUESTED, ACCEPTED, IN_TRANSIT, COMPLETED
  }

  const skip = (page - 1) * limit;

  const rides = await RideModel.find(filter)
    .sort({ "timestamps.requestedAt": -1 })
    .skip(skip)
    .limit(limit);

  const total = await RideModel.countDocuments(filter);

  return {
    rides,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Admin gets all rides
const getAllRides = async () => {
  const rides = await RideModel.find({}).sort({ "timestamps.requestedAt": -1 });
  return rides;
};

const getRequestedRides = async () => {
  const rides = await RideModel.find({ rideStatus: "REQUESTED" })
    .sort({ "timestamps.requestedAt": -1 });
  return rides;
};

const getDriverEarnings = async (driverId: string) => {
  const rides = await RideModel.find({
    driverId,
    rideStatus: "COMPLETED",
  })
    .sort({ completedAt: -1 })
    .select("fare timestamps.completedAt riderId")
    .populate("riderId", "name phone");

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

const getRideById = async (rideId: string) => {
  const ride = await RideModel.findById(rideId)
    .populate("driverId", "name email phone vehicleType")
    .populate("riderId", "name email phone")
   

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  return ride;
};


export const RideService = {
  getRideById,
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
   getRequestedRides
};




