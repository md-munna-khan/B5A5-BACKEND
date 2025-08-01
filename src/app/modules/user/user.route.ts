
import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { userControllers } from "./user.controller";

import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router()

router.get("/all-users", checkAuth(Role.ADMIN), userControllers.getAllUsers)

router.get("/me", checkAuth(...Object.values(Role)), userControllers.getMe)

router.post("/register",
    validateRequest(createUserZodSchema),
    userControllers.createUser)
// ✅ Block or Unblock user (ADMIN only)
router.patch(
  "/block/:id",
  checkAuth(Role.ADMIN),
  userControllers.updateUserStatus
);

router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), userControllers.updateUser)
router.get("/:id",checkAuth(Role.ADMIN), userControllers.getSingleUser)

export const UserRoutes = router