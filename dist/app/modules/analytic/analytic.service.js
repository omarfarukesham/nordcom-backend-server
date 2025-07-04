"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticServices = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const OverviewFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    //total sales calculation
    const totalEarnings = yield prisma_1.default.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            status: client_1.PaymentStatus.PAID,
        },
    });
    //total order
    const totalPaidOrder = yield prisma_1.default.order.count();
    //total product totalSelOut
    const totalProductSelOut = yield prisma_1.default.order.aggregate({
        _sum: {
            totalProduct: true,
        },
        where: {
            paymentStatus: client_1.PaymentStatus.PAID,
        },
    });
    const result = {
        totalEarnings,
        totalPaidOrder,
        totalProductSelOut,
    };
    return result;
});
exports.AnalyticServices = {
    OverviewFromDB,
};
