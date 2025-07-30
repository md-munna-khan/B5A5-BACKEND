
import { Router } from "express";
import { Role } from "../user/user.interface";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createDriverZodSchema, updateDriverZodSchema } from "./driver.validation";
import { DriverControllers } from "./driver.controller";

const router = Router();

// Create Driver (admin or super admin only)
router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.array("files"),
  validateRequest(createDriverZodSchema),
  DriverControllers.createDriver
);

// Get all drivers (admin, super admin)
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DriverControllers.getAllDrivers
);

// Get single driver by ID (admin, super admin, or the driver themself)
router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DRIVER),
  DriverControllers.getSingleDriver
);

// Update driver info (admin, super admin)
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN,Role.DRIVER),
  validateRequest(updateDriverZodSchema),
  DriverControllers.updateDriver
);

// Delete a driver (super admin only)
router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  DriverControllers.deleteDriver
);

// Update online status (driver only)
router.patch(
  "/:id/online-status",
  checkAuth(Role.SUPER_ADMIN),
  DriverControllers.updateOnlineStatus
);

// Update riding status (driver only)
router.patch(
  "/:id/riding-status",
  checkAuth(Role.DRIVER),
  DriverControllers.updateRidingStatus
);

// Update driver's current location (driver only)
router.patch(
  "/:id/location",
  checkAuth(Role.DRIVER),
  DriverControllers.updateLocation
);

export const DriverRoutes = router;
