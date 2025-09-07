/* eslint-disable @typescript-eslint/no-explicit-any */


import AppError from "../../errorHelpers/AppError";
import { Driver } from "./driver.model";
import httpStatus from "http-status-codes";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IDriver } from "./driver.interface";
import { User } from "../user/user.model";
import { RideModel } from "../ride/ride.model";

const applyAsDriver = async (user: any, payload: IDriver) => {
  // Check if user has already applied
  const existing = await Driver.findOne({ userId: user.userId });
  console.log(existing)
  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, "You have already applied as a driver");
  }

  const driverData = {
    ...payload,
    userId: user.userId,
    status: "Pending", // initially pending
  };

  console.log(driverData)

  const newDriver = await Driver.create(driverData);
  return newDriver;
};




const approveDriver = async (driverId: string) => {
  const driver = await Driver.findById(driverId);

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  if (driver.status === "Approved") {
    throw new AppError(httpStatus.BAD_REQUEST, "Driver is already approved");
  }

  // Update the driver status
  driver.status = "Approved";
  await driver.save();

  // Update the user's role to 'DRIVER' if userId exists
  if (driver.userId) {
    await User.findByIdAndUpdate(driver.userId, { role: "DRIVER" });
  }

  return driver;
};

const suspendDriver = async (driverId: string) => {
  const driver = await Driver.findById(driverId);

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  if (driver.status === "Suspended") {
    throw new AppError(httpStatus.BAD_REQUEST, "Driver is already suspended");
  }

  // Update the driver status
  driver.status = "Suspended";
  await driver.save();

  // Optional: Downgrade user role to 'USER'
  // if (driver.userId) {
  //   await User.findByIdAndUpdate(driver.userId, { role: "USER" });
  // }

  return driver;
};



const getAllDrivers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Driver.find(), query);
  const driverData = queryBuilder.filter().search([]).sort().fields().paginate();

  const [data, meta] = await Promise.all([
    driverData.build(),
    queryBuilder.getMeta(),
  ]);

  return { data, meta };
};

const getSingleDriver = async (id: string) => {
  const driver = await Driver.findById(id);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }
  return driver;
};

const updateDriver = async (id: string, payload: Partial<IDriver>) => {
  const driver = await Driver.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }
  return driver;
};

const deleteDriver = async (id: string) => {
  const driver = await Driver.findByIdAndDelete(id);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }
  return driver;
};

const getDriverByUserId = async (userId: string) => {
  const driver = await Driver.findOne({ userId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found by userId");
  }
  return driver;
};
const updateOnlineStatus = async (driverId: string, onlineStatus: 'Active' | 'Offline') => {
  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  driver.onlineStatus = onlineStatus;
  await driver.save();
  return driver;
};

const updateRidingStatus = async (
  driverId: string,
  ridingStatus: 'idle' | 'waiting_for_pickup' | 'in_transit' | 'unavailable'
) => {
  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  driver.ridingStatus = ridingStatus;
  await driver.save();

  // ✅ Sync with current active ride
  const activeRide = await RideModel.findOne({
    driverId: driver._id,
    rideStatus: { $in: ["ACCEPTED", "PICKED_UP", "IN_TRANSIT"] },
  });

  if (activeRide) {
    switch (ridingStatus) {
      case "waiting_for_pickup":
        activeRide.rideStatus = "ACCEPTED";
        break;
      case "in_transit":
        activeRide.rideStatus = "IN_TRANSIT";
        break;
      case "idle":
      case "unavailable":
        // Optionally, cancel or pause ride if needed
        break;
    }
    await activeRide.save();
  }

  return driver;
};


const updateLocation = async (driverId: string, payload : any) => {
  const location = payload
  
  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  driver.location = {
    type: 'Point',
    coordinates: [location.coordinates[0], location.coordinates[1]],
  };
  await driver.save();
  return driver;
};

// const getMyProfile = async (driverId: string) => {
//   return await Driver.findOne({userId:driverId})
// };
const getMyProfile = async (driverId: string) => {
  return await Driver.findOne({userId:driverId})
};

const updateMyProfile = async (driverId: string, payload: any) => {
  return await Driver.findOneAndUpdate(
    { userId: driverId },
    { $set: payload },   
    { new: true }
  );
};
 


export const DriverService = {
  getMyProfile,
updateMyProfile,
  applyAsDriver,
  approveDriver,
 suspendDriver,
  getAllDrivers,
  getSingleDriver,
  updateDriver,
  deleteDriver,
  getDriverByUserId,
    updateOnlineStatus,
  updateRidingStatus,
  updateLocation,
};
