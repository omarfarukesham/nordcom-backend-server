import prisma from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import { Brand } from "@prisma/client";

const GetBrandsFromDB = async () => {
  const brand = await prisma.brand.findMany({
    where: { isDeleted: false },
    include: {
      products: true,
    },
  });
  if (brand.length === 0) {
    throw new ApiError(status.NOT_FOUND, "No Brand Available");
  }
  return brand;
};

const GetBrandByIdFromDB = async (id: string) => {
  const uniqueBrand = await prisma.brand.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  if (uniqueBrand === null) {
    throw new ApiError(status.NOT_FOUND, "No Brand Available");
  }
  return uniqueBrand;
};

const CreateBrandIntoDB = async (payload: Brand & {imageUrl:string}) => {
  const { name, imageUrl } = payload;
  const modifiedPayload = {
    name,
    logoUrl: imageUrl,
    description: payload.description,
    isFeatured: payload.isFeatured,
  };
  const isBrandExists = await prisma.brand.findFirst({
    where: {
      name: name,
    },
  });
  if (isBrandExists !== null) {
    throw new ApiError(status.BAD_REQUEST, "Brand already exists!");
  }
  const result = await prisma.brand.create({
    data: modifiedPayload,
  });
  return result;
};


const UpdateBrandIntoDB = async (id: string, payload: Partial<Brand & {imageUrl:string}>) => {
  const { name, imageUrl } = payload;
  const modifiedPayload = {
    name,
    logoUrl: imageUrl,
    description: payload.description,
    isFeatured: payload.isFeatured,
  };
  const isBrandExists = await prisma.brand.findUnique({
    where: {
      id,
    },
  });
  if (isBrandExists == null) {
    throw new ApiError(status.BAD_REQUEST, "Brand does not exists!");
  }
  const result = await prisma.brand.update({
    where: { id },
    data: imageUrl ? { ...modifiedPayload, logoUrl: imageUrl } : payload,
  });
  return result;
};

const DeleteBrandFromDB = async (id: string) => {
  const isBrandExists = await prisma.brand.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  if (isBrandExists === null) {
    throw new ApiError(status.NOT_FOUND, "No Brand Available");
  }
  await prisma.brand.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
  return null;
};

export const BrandServices = {
  GetBrandsFromDB,
  GetBrandByIdFromDB,
  CreateBrandIntoDB,
  UpdateBrandIntoDB,
  DeleteBrandFromDB,
};
