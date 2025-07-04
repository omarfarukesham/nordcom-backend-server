import express from "express";
import validateRequest from "../../middleware/validateRequest";
import AuthGurd from "../../middleware/authGurd";
import { UserRole } from "@prisma/client";
import { ProductSchemas } from "./product.zodvalidation";
import { ProductControllers } from "./product.controller";
import { UploadImageInServer } from "../../middleware/UploadImage";
import { UploadToCloudinary } from "../../../helpers/CloudinaryUpload";

const router = express.Router();

router.get("/", ProductControllers.GetProducts);

router.post(
  "/",
  AuthGurd(UserRole.ADMIN),
  UploadImageInServer.single("file"),
  UploadToCloudinary,
  validateRequest(ProductSchemas.createProductSchema),
  ProductControllers.CreateProduct
);

router.patch(
  "/update/:id",
  AuthGurd(UserRole.ADMIN),
  UploadImageInServer.single("file"),
  UploadToCloudinary,
  validateRequest(ProductSchemas.updateProductSchema),
  ProductControllers.UpdateProduct
);

router.delete("/delete/:id",  AuthGurd(UserRole.ADMIN), ProductControllers.DeleteProduct);

router.get("/:id", ProductControllers.GetProductById);

router.get(
  "/view/popular-product",
  ProductControllers.PopularProduct
);

export const ProductRoutes = router;
