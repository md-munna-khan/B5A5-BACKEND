import { Router } from "express";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { RideControllers } from "./ride.controller";
import { createRideZodSchema,  } from "./ride.validation";

const router = Router();

// Rider creates a ride request
router.post(
  "/request",
  checkAuth(Role.RIDER,Role.DRIVER,Role.ADMIN),
  validateRequest(createRideZodSchema),
  RideControllers.requestRide
);

// Rider cancels a ride request   
router.patch(
  "/:id/cancel",
  checkAuth(Role.RIDER),
  RideControllers.cancelRide
);

// Rider views their rides
router.get(
  "/me",
  checkAuth(Role.RIDER),
  RideControllers.getRiderRides
);

router.get(
  "/earnings/me",
  checkAuth(Role.DRIVER),
  RideControllers.getDriverEarnings
);

// Driver views available rides to accept
router.get(
  "/available",
  checkAuth(Role.DRIVER),
  RideControllers.getAvailableRides
);

// Driver accepts a ride
router.patch(
  "/:id/accept",
  checkAuth(Role.DRIVER),
  RideControllers.acceptRide
);

router.patch(
  "/:id/reject",
  checkAuth(Role.DRIVER),
  RideControllers.rejectRide
);


// Driver marks pickup complete
router.patch(
  "/:id/pickup",
  checkAuth(Role.DRIVER),
  RideControllers.pickUpRide
);

// Driver marks ride as in transit
router.patch(
  "/:id/transit",
  checkAuth(Role.DRIVER),
  RideControllers.markInTransit
);

// Driver completes the ride
router.patch(
  "/:id/complete",
  checkAuth(Role.DRIVER),
  RideControllers.completeRide
);

// Driver views their rides
router.get(
  "/driver",
  checkAuth(Role.DRIVER),
  RideControllers.getDriverRides
);

// Admin gets all rides
router.get(
  "/",
  checkAuth(Role.ADMIN),
  RideControllers.getAllRides
);

// router.patch("/:id/location",checkAuth(Role.DRIVER),
//  RideControllers.getAllRides
// )

export const RideRoutes = router;
