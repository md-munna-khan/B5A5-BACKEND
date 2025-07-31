/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { RideService } from "./ride.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";

const requestRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const rider = req.user as JwtPayload;
  const riderId  = rider.userId 
  const rideData = req.body;
  const result = await RideService.requestRide(riderId, rideData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Ride requested successfully",
    data: result,
  });
});

const cancelRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
 const rider = req.user as JwtPayload;
  const riderId  = rider.userId 
  const rideId = req.params.id;
  const result = await RideService.cancelRide(riderId, rideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride cancelled successfully",
    data: result,
  });
});

const getRiderRides = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const rider = req.user as JwtPayload;
  const riderId  = rider.userId 
  const result = await RideService.getRiderRides(riderId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rider's rides retrieved successfully",
    data: result,
  });
});

const getAvailableRides = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await RideService.getAvailableRides();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Available rides retrieved successfully",
    data: result,
  });
});

const acceptRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const driver = req.user as JwtPayload;
  const driverId  = driver.userId 
  const rideId = req.params.id;
  const result = await RideService.acceptRide(driverId, rideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride accepted successfully",
    data: result,
  });
});

const pickUpRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const driver = req.user as JwtPayload;
  const driverId  = driver.userId 
  const rideId = req.params.id;
  const result = await RideService.pickUpRide(driverId, rideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Pickup marked successfully",
    data: result,
  });
});

const markInTransit = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const driver = req.user as JwtPayload;
  const driverId  = driver.userId 
  const rideId = req.params.id;
  const result = await RideService.markInTransit(driverId, rideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride marked as in transit",
    data: result,
  });
});

const completeRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const driver = req.user as JwtPayload;
  const driverId  = driver.userId 
  const rideId = req.params.id;
  const result = await RideService.completeRide(driverId, rideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride completed successfully",
    data: result,
  });
});

const getDriverRides = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const driver = req.user as JwtPayload;
  const driverId  = driver.userId 
  const result = await RideService.getDriverRides(driverId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver's rides retrieved successfully",
    data: result,
  });
});

const getAllRides = catchAsync(async (_req: Request, res: Response, next: NextFunction) => {
  const result = await RideService.getAllRides();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All rides retrieved successfully",
    data: result,
  });
});

export const RideControllers = {
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
