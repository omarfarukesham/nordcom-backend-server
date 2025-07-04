import bcrypt from "bcrypt";
import status from "http-status";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import { TUpdateUser, TUser } from "./user.zodvalidations";
import { UserStatus } from "@prisma/client";

const registerUserIntoDB = async (payload: TUser) => {
  const { name, email, password } = payload;
  // Check if user already exists
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (user) throw new ApiError(status.CONFLICT, "User Already Exists.");

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userData = {
    name,
    email,
    password: hashedPassword,
  };
  const result = await prisma.$transaction(async (prisma) => {
    // Create user in DB
    const result = await prisma.user.create({
      data: userData,
    });
    if (!result)
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to create user."
      );
    // Add user in user_extension table

    const userExtension = await prisma.user_Extension.create({
      data: {
        userId: result.id,
        email: result.email,
      },
    });
    if (!userExtension)
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to create user."
      );

    return result;
  });

  if (!result)
    throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to create user.");

  return {};
};

const updateUserInDB = async (user: JwtPayload, payload: TUpdateUser) => {
  // Check if user already exists
  const existingUser = await prisma.user_Extension.findUnique({
    where: {
      email: user.email,
    },
  });
  if (!existingUser) throw new ApiError(status.NOT_FOUND, "User Not Found.");
  const updatedUser = await prisma.user_Extension.update({
    where: {
      email: user.email,
    },
    data: payload,
  });

  return updatedUser;
};

const getUserById = async (id:string) => {

  const userInfo = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      User_Extension: true,
    },
  });
  if (!userInfo) throw new ApiError(status.NOT_FOUND, "User Not Found.");
  return userInfo;
};

const getUserProfile = async (user: JwtPayload) => {

  const userInfo = await prisma.user.findFirst({
    where: {
      email:user?.email,
      status: UserStatus.ACTIVE,
    },
    include: {
      User_Extension: true,
    },
  });
  if (!userInfo) throw new ApiError(status.NOT_FOUND, "User Not Found.");
  return userInfo;
};

const getAdminProfile = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      email: true,
      name: true,
      User_Extension: {
        select: {
          phone: true,
          address: true,
          country: true,
          postalCode: true,
          bio: true,
          imageUrl: true,
        },
      },
    },
  });
  if (!user) throw new ApiError(status.NOT_FOUND, "User Not Found.");
  return {
    name: user.name,
    email: user.email,
    phone: user?.User_Extension?.phone,
    address: user?.User_Extension?.address,
    country: user?.User_Extension?.country,
    postalCode: user?.User_Extension?.postalCode,
    bio: user?.User_Extension?.bio,
    imageUrl: user?.User_Extension?.imageUrl,
  };
};

const getAllUsersFromDB = async (id: string) => {
  const user = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      email: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      User_Extension: {
        select: {
          phone: true,
          address: true,
          country: true,
          imageUrl: true,
        },
      },
    },
  });
  const modifiedUsers = user.map((user) => {
    return {
      ...user,

      phone: user?.User_Extension?.phone,
      address: user?.User_Extension?.address,
      country: user?.User_Extension?.country,
      imageUrl: user?.User_Extension?.imageUrl,
    };
  });
  return modifiedUsers ? modifiedUsers : [];
};


export const UserServices = {
  registerUserIntoDB,
  updateUserInDB,
  getUserById,
  getUserProfile,
  getAdminProfile,
  getAllUsersFromDB
};
