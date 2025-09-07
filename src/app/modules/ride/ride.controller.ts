/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { RideService } from "./ride.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { IDriverFeedback, IRiderFeedback } from "./ride.interface";
import { RideModel } from "./ride.model";



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


// const cancelRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//  const rider = req.user as JwtPayload;
//   const riderId  = rider.userId 
//   const ridesId = req.params.id;
//   const result = await RideService.cancelRide(riderId, ridesId);

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Ride cancelled successfully",
//     data: result,
//   });
// });

const cancelRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as JwtPayload; 
  const rideId = req.params.id;

 
  const result = await RideService.cancelRide(
    { userId: user.userId, role: user.role },
    rideId
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride cancelled successfully",
    data: result,
  });
});


const getRiderRides = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const rider = req.user as JwtPayload;
  const riderId = rider.userId;

  // query params from frontend
  const { page = 1, limit = 10, status, startDate, endDate, minFare, maxFare } = req.query;

  const result = await RideService.getRiderRides(
    riderId,
    Number(page),
    Number(limit),
    status as string,
    startDate as string,
    endDate as string,
    minFare ? Number(minFare) : undefined,
    maxFare ? Number(maxFare) : undefined
  );

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
// Get active rides (driver's rides in progress)
export const getActiveRides = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const driver = req.user as any; // JwtPayload
  const driverId = driver.userId;

  const rides = await RideModel.find({
    driverId,
    rideStatus: { $in: ["ACCEPTED", "PICKED_UP", "IN_TRANSIT"] },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Active rides retrieved successfully",
    data: rides,
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

const getDriverRides = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const driver = req.user as JwtPayload;
    const driverId = driver.userId;

    const { status, page = 1, limit = 10 } = req.query;

    const result = await RideService.getDriverRides(
      driverId,
      status as string,
      Number(page),
      Number(limit)
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver's rides retrieved successfully",
      data: result,
    });
  }
);

const getAllRides = catchAsync(async (_req: Request, res: Response, next: NextFunction) => {
  const result = await RideService.getAllRides();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All rides retrieved successfully",
    data: result,
  });
});

const getRequestedRides = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
  const result = await RideService.getRequestedRides();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Requested rides fetched successfully",
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

 const updateRideStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedRide = await RideService.updateRideStatus(id, status);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Ride status updated successfully",
    data: updatedRide,
  });
});


const getRideById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
const rideId = req.params.id;
console.log(rideId)

  const ride = await RideService.getRideById(rideId);


  res.status(200).json({
    success: true,
    message: "Ride fetched successfully",
    data: ride,
  });
});

export const getRidesOversight = catchAsync(async (req: Request, res: Response) => {
  const { rideStatus, driverId, riderId, startDate, endDate, page = 1, limit = 20 } = req.query;

  const filter: any = {};

  if (rideStatus) filter.rideStatus =rideStatus;
  if (driverId) filter.driverId = driverId;
  if (riderId) filter.riderId = riderId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }

  const rides = await RideModel.find(filter)
    .populate("driverId", "name email")
    .populate("riderId", "name email")
    .sort({ createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);

  const total = await RideModel.countDocuments(filter);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rides fetched successfully",
    data: rides,
    meta: { page: +page, limit: +limit, total,totalPage: Math.ceil(total / +limit)  },
  });
});
export const RideControllers = {
  getRidesOversight,
  getRideById,
  getDriverEarnings,
  getActiveRides,
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
  updateRideStatus,
  getRequestedRides
};
