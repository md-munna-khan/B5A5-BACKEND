/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { RideService } from "./ride.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { IDriverFeedback, IRiderFeedback } from "./ride.interface";

// const requestRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   const rider = req.user as JwtPayload;
//   const riderId  = rider.userId 
//   const rideData = req.body;
//   const result = await RideService.requestRide(riderId, rideData);

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.CREATED,
//     message: "Ride requested successfully",
//     data: result,
//   });
// });

 const requestRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rider = req.user as JwtPayload;
    const riderId = rider.userId;
    const rideData = req.body;

    const result = await RideService.requestRide(riderId, rideData);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Ride requested and driver matched successfully",
      data: result,
    });
  }
);


const cancelRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
 const rider = req.user as JwtPayload;
  const riderId  = rider.userId 
  const ridesId = req.params.id;
  const result = await RideService.cancelRide(riderId, ridesId);

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

const rejectRide = catchAsync(async (req: Request, res: Response) => {
  const { id: rideId } = req.params;
  const driver = req.user as JwtPayload;
  const driverId = driver.userId;

  const result = await RideService.rejectRide(rideId, driverId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride rejected successfully",
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

const getDriverEarnings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const driver = req.user as JwtPayload;
    const driverId = driver.userId;

    const result = await RideService.getDriverEarnings(driverId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver earnings retrieved successfully",
      data: result,
    });
  }
);
const giveRiderFeedback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rider = req.user as JwtPayload;
    const riderId = rider.userId;
    const rideId = req.params.id;

   
    const feedbackInput: IRiderFeedback = req.body;

    const result = await RideService.giveRiderFeedback(riderId, rideId, feedbackInput);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Feedback and rating submitted successfully",
      data: result,
    });
  }
);

 const giveDriverFeedback = catchAsync(async (req: Request, res: Response) => {

   const driver = req.user as JwtPayload;
  const rideId = req.params.rideId;
  const driverId = driver.userId; 
  const feedback: IDriverFeedback = req.body;

  const updatedRide = await RideService.submitDriverFeedback(rideId, driverId, feedback);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver feedback submitted successfully",
    data: updatedRide,
  });
});

export const updateRideStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedRide = await RideService.updateRideStatus(id, status);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Ride status updated successfully",
    data: updatedRide,
  });
});

export const RideControllers = {
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
  giveDriverFeedback,
  updateRideStatus
};
