import { Router } from "express";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { RideControllers } from "./ride.controller";
import { createRideZodSchema, updateRideZodSchema,  } from "./ride.validation";

const router = Router();
// Driver views their rides
router.get(
  "/driver",
  checkAuth(Role.DRIVER),
  RideControllers.getDriverRides
);

// Admin gets all rides
// router.get(
//   "/",
//   checkAuth(Role.DRIVER),
//   RideControllers.getRequestedRides
// );
// Admin routes
router.get("/all", checkAuth(Role.ADMIN), RideControllers.getAllRides);

router.get(
 "/requested",
  checkAuth(Role.DRIVER),
  RideControllers.getRequestedRides
);

// Rider creates a ride request
router.post(
  "/request",
  checkAuth(Role.RIDER,Role.DRIVER,Role.ADMIN),
  validateRequest(createRideZodSchema),
  RideControllers.requestRide
);
router.get("/active", checkAuth(Role.DRIVER), RideControllers.getActiveRides);


router.patch(
  "/:id/status",
    checkAuth(Role.DRIVER),
  validateRequest(updateRideZodSchema),
  RideControllers.updateRideStatus
);
// admin oversight
router.get("/oversight", 
  checkAuth(Role.ADMIN), 
  RideControllers.getRidesOversight)
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
// ride details
router.get("/:id", 
  checkAuth(Role.RIDER, Role.DRIVER, Role.ADMIN),
  RideControllers.getRideById);

// driver feedback
router.post("/:rideId/driver-ratings", 
  checkAuth(Role.DRIVER),
  RideControllers.giveDriverFeedback);
// rider feedback
router.put(
  "/:id/feedback",
  checkAuth(Role.RIDER),  
  RideControllers.giveRiderFeedback
);
// Rider cancels a ride request   
router.patch(
  "/:id/cancel",
  checkAuth(Role.RIDER,Role.DRIVER),
  RideControllers.cancelRide
);


// Driver accepts a ride
router.patch(
  "/:id/accept",
  checkAuth(Role.DRIVER),
  RideControllers.acceptRide
);

// driver reject
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




// router.patch("/:id/location",checkAuth(Role.DRIVER),
//  RideControllers.getAllRides
// )

export const RideRoutes = router;
