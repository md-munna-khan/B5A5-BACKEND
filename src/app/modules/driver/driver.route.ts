
import { Router } from "express";
import { Role } from "../user/user.interface";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createDriverZodSchema, updateDriverZodSchema } from "./driver.validation";
import { DriverControllers } from "./driver.controller";

const router = Router();

// Rider applies to be a driver
router.post(
  "/apply-driver",
  checkAuth(Role.RIDER),
  multerUpload.single("file"),
  validateRequest(createDriverZodSchema),
  DriverControllers.applyAsDriver
);

// driver.route.ts
router.get("/me", checkAuth(Role.DRIVER), 
DriverControllers.getMyProfile);

// Update current driver profile
router.patch(
  "/me",
  checkAuth(Role.DRIVER),

  DriverControllers.updateMyProfile
);




// Admin approves a driver application
router.patch(
  "/approve/:id",
  checkAuth(Role.ADMIN),
  DriverControllers.approveDriver
);


// Suspend driver
router.patch('/suspend/:id',
   checkAuth(Role.ADMIN), 
   DriverControllers.suspendDriver);

// Get all drivers (admin, super admin)
router.get(
  "/",
  checkAuth(Role.ADMIN),
  DriverControllers.getAllDrivers
);



// Get single driver by ID (admin, super admin, or the driver themself)
router.get(
  "/:id",
  checkAuth(Role.ADMIN,  Role.DRIVER),
  DriverControllers.getSingleDriver
);

// Update driver info (admin, super admin)
router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(updateDriverZodSchema),
  DriverControllers.updateDriver
);

// Delete a driver (super admin only)
router.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  DriverControllers.deleteDriver
);

// Update online status (driver only)
router.patch(
  "/online-status/:id",
  checkAuth(Role.DRIVER),
  DriverControllers.updateOnlineStatus
);

// Update riding status (driver only)
router.patch(
  "/riding-status/:id",
  checkAuth(Role.DRIVER),
  DriverControllers.updateRidingStatus
);

// Update driver's current location (driver only)
router.patch(
  "/location/:id",
  checkAuth(Role.DRIVER),

  DriverControllers.updateLocation
);

export const DriverRoutes = router;
