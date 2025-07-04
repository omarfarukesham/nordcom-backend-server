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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductServices = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const GetProductsFromDB = (viewAllType) => __awaiter(void 0, void 0, void 0, function* () {
    let select;
    let Product;
    if (viewAllType === "admin") {
        select = {
            brand: {
                select: {
                    name: true,
                },
            },
            brandId: true,
            categoryId: true,
            category: {
                select: {
                    name: true,
                },
            },
            createdAt: true,
            id: true,
            images: true,
            name: true,
            price: true,
            stock: true,
            sku: true,
            stockStatus: true,
            isFeatured: true,
            discountPrice: true,
        };
        Product = yield prisma_1.default.product.findMany({
            where: {
                isDeleted: false,
            },
            select,
        });
        Product = Product === null || Product === void 0 ? void 0 : Product.map((product) => (Object.assign(Object.assign({}, product), { brand: product.brand, category: product.category })));
    }
    else {
        Product = yield prisma_1.default.product.findMany({
            where: {
                isDeleted: false,
            },
            include: {
                brand: true,
                category: true,
                Review: true,
            },
        });
    }
    return Product;
});
const GetProductByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const uniqueProduct = yield prisma_1.default.product.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            brand: true,
            category: true,
            Review: true,
        },
    });
    if (uniqueProduct === null) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No Product Found");
    }
    return uniqueProduct;
});
const CreateProductIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { sku, specification, seoInformation, imageUrl } = payload, rest = __rest(payload, ["sku", "specification", "seoInformation", "imageUrl"]);
    const isProductExists = yield prisma_1.default.product.findFirst({
        where: { sku },
    });
    if (isProductExists !== null) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Product already exists!");
    }
    const result = yield prisma_1.default.product.create({
        data: Object.assign(Object.assign({}, rest), { images: imageUrl ? [imageUrl] : [], sku, specification: specification, seoInformation: seoInformation }),
    });
    return result;
});
const UpdateProductIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { specification, imageUrl, seoInformation, variants } = payload, rest = __rest(payload, ["specification", "imageUrl", "seoInformation", "variants"]);
    //cheking existing
    const isProductExists = yield prisma_1.default.product.findUnique({
        where: {
            id,
        },
    });
    if (isProductExists === null) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No Product Available");
    }
    if (imageUrl !== undefined) {
        const imageArray = [...isProductExists.images, imageUrl];
        yield prisma_1.default.product.update({
            where: { id: isProductExists.id },
            data: { images: imageArray },
        });
    }
    // checking for variant
    if (variants !== undefined) {
        const newVariants = variants;
        const dbVariants = isProductExists.variants;
        const mergedVariants = [...newVariants];
        dbVariants === null || dbVariants === void 0 ? void 0 : dbVariants.forEach((item) => {
            let found = mergedVariants.find((variant) => variant === item);
            if (!found) {
                mergedVariants.push(item);
            }
        });
        yield prisma_1.default.product.update({
            where: { id: isProductExists.id },
            data: { variants: mergedVariants },
        });
    }
    // if specific exist
    if (specification !== undefined) {
        const newSpecifcation = specification;
        const dbSpecifcation = isProductExists.specification;
        const mergedSpecification = [...newSpecifcation];
        dbSpecifcation === null || dbSpecifcation === void 0 ? void 0 : dbSpecifcation.forEach((item) => {
            let found = mergedSpecification.find((i) => i.label === item.label && i.value === item.value);
            if (!found) {
                mergedSpecification.push(item);
            }
        });
        yield prisma_1.default.product.update({
            where: { id: isProductExists.id },
            data: { specification: mergedSpecification },
        });
    }
    if (seoInformation !== undefined) {
        const newSeoInformation = seoInformation;
        const dbSeoInformation = isProductExists.seoInformation;
        const mergedSeoInformation = [...newSeoInformation];
        dbSeoInformation === null || dbSeoInformation === void 0 ? void 0 : dbSeoInformation.forEach((item) => {
            let found = mergedSeoInformation.find((i) => i.title === item.title &&
                i.keyword === item.keyword &&
                i.description === item.description);
            if (!found) {
                mergedSeoInformation.push(item);
            }
        });
        yield prisma_1.default.product.update({
            where: { id: isProductExists.id },
            data: { seoInformation: mergedSeoInformation },
        });
    }
    yield prisma_1.default.product.update({
        where: { id: isProductExists.id },
        data: rest,
    });
    const result = yield prisma_1.default.product.findUnique({
        where: {
            id,
            isDeleted: false,
        },
    });
    return result;
});
const DeleteProductFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isProductExists = yield prisma_1.default.product.findUnique({
        where: {
            id,
        },
    });
    if (isProductExists === null) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No Product Available");
    }
    yield prisma_1.default.product.update({
        where: { id },
        data: { isDeleted: true },
    });
    return null;
});
const PopularProductFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const productGroup = yield prisma_1.default.orderItem.groupBy({
        by: ["productId"],
        _sum: {
            quantity: true,
        },
        orderBy: {
            _sum: {
                quantity: "desc",
            },
        },
        take: 10, // Top 10 most popular products
    });
    const popularProductId = productGroup.map((product) => product.productId);
    const popularProducts = yield prisma_1.default.product.findMany({
        where: {
            id: {
                in: popularProductId,
            },
        },
        take: 10,
    });
    if (popularProducts.length === 0) {
        throw new ApiError_1.default(http_status_1.default.OK, "No Popular Product Found");
    }
    return popularProducts;
});
exports.ProductServices = {
    GetProductsFromDB,
    GetProductByIdFromDB,
    CreateProductIntoDB,
    UpdateProductIntoDB,
    DeleteProductFromDB,
    PopularProductFromDB,
};
