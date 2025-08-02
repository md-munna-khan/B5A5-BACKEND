


/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { DriverService } from "./driver.service";


// Apply as Driver (for RIDERs)
const applyAsDriver = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as JwtPayload;

  const payload =  {
    ...req.body,
    drivingLicense: req.file?.path,
  }

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
  const { id } = req.params;
  const result = await DriverService.suspendDriver(id);

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



export const DriverControllers = {
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
