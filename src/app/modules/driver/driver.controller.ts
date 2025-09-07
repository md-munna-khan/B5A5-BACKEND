


/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { DriverService } from "./driver.service";
import { IDriver } from "./driver.interface";



// Apply as Driver (for RIDERs)
const applyAsDriver = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as JwtPayload;

  // const payload =  {
  //   ...req.body,
  //   drivingLicense: req.file?.path,
  // }
  const payload:IDriver = {
 userId: user.userId,
  vehicle: {
    vehicleNumber: req.body.vehicle.vehicleNumber,
    vehicleType: req.body.vehicle.vehicleType,
  },
  location: {
    type: "Point",
    coordinates: req.body.location.coordinates || [90.4125, 23.8103]
  },
  drivingLicense: req.file?.path,
};


  console.log(payload)

  const result = await DriverService.applyAsDriver(user, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver application submitted successfully",
    data: result,
  });
});

// Approve Driver (for ADMINs)
const approveDriver = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const driverId = req.params.id;

  const result = await DriverService.approveDriver(driverId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver approved and role updated successfully",
    data: result,
  });
});

const suspendDriver = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.params.id;
  const result = await DriverService.suspendDriver(driverId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Driver suspended successfully',
    data: result,
  });
});

const getAllDrivers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query;
  const result = await DriverService.getAllDrivers(query as Record<string, string>);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All drivers retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleDriver = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const result = await DriverService.getSingleDriver(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver retrieved successfully",
    data: result,
  });
});

const updateDriver = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const payload = req.body;
  const result = await DriverService.updateDriver(id, payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver updated successfully",
    data: result,
  });
});

const deleteDriver = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const result = await DriverService.deleteDriver(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver deleted successfully",
    data: result,
  });
});
const getDriverByUserId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Assuming userId comes from req.user (decoded JWT) or from params/query
  // Adjust based on your auth middleware implementation
  const userId = (req.user as JwtPayload).userId;

  const result = await DriverService.getDriverByUserId(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver retrieved by userId successfully",
    data: result,
  });
});

// Update online status
const updateOnlineStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const driverId = req.params.id;
  const { onlineStatus } = req.body;

  const updatedDriver = await DriverService.updateOnlineStatus(driverId, onlineStatus);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver online status updated successfully",
    data: updatedDriver,
  });
});

// Update riding status
const updateRidingStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const driverId = req.params.id;
  const { ridingStatus } = req.body;

  const updatedDriver = await DriverService.updateRidingStatus(driverId, ridingStatus);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver riding status updated successfully",
    data: updatedDriver,
  });
});

// Update location
const updateLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const driverId = req.params.id;

  const updatedDriver = await DriverService.updateLocation(driverId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver location updated successfully",
    data: updatedDriver,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const driver = req.user as JwtPayload;

  // console.log(driver)

  const result = await DriverService.getMyProfile(driver.userId);

  // console.log(result)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const driver = req.user as JwtPayload;
  const result = await DriverService.updateMyProfile(driver.userId, req.body);
console.log(result)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver profile updated successfully",
    data: result,
  });
});





export const DriverControllers = {
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
