import { Order } from "../Models/Order.js";
import { Products } from "../Models/ProductToDisplay.js";
import { User } from "../Models/User.js";

export const getMonthlySales = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // 1st day of current month
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthlySales = await Order.aggregate([
      { $match: { vendorId: req.vendor } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $match: {
          $or: [
            { "_id.year": currentYear, "_id.month": currentMonth },
            {
              "_id.year": currentMonth === 1 ? currentYear - 1 : currentYear,
              "_id.month": currentMonth === 1 ? 12 : currentMonth - 1,
            },
          ],
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const salesByDays = await Order.aggregate([
      {
        $match: {
          $and: [
            { vendorId: req.vendor },
            {
              createdAt: {
                $gte: startOfMonth,
                $lt: startOfNextMonth,
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
          },
          sales: { $sum: "$amount" },
          orders: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          day: "$_id.day",
          sales: 1,
          orders: 1,
        },
      },
      {
        $sort: { day: 1 },
      },
    ]);
    const percentage =
      monthlySales.length > 1
        ? ((monthlySales[0]?.totalSales - monthlySales[1]?.totalSales) /
            monthlySales[1]?.totalSales) *
            100 || 0
        : 0;
    const ordersPercentage =
      monthlySales.length > 1
        ? ((monthlySales[0]?.totalOrders - monthlySales[1]?.totalOrders) /
            monthlySales[1]?.totalOrders) *
            100 || 0
        : 0;

    console.log(monthlySales);
    res.json({
      monthlySales,
      data: monthlySales[0],
      percentage: percentage.toFixed(2),
      ordersPercentage: ordersPercentage.toFixed(2),
      salesByDays,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await Products.aggregate([
      {
        $unwind: "$variantValues",
      },
      {
        $sort: {
          "variantValues.values.sold": -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          name: 1,
          price: "$variantValues.values.price",
          sold: "$variantValues.values.sold",
          inStock: "$variantValues.values.inStock",
          img: { $arrayElemAt: ["$variantValues.values.picture", 0] },
        },
      },
    ]);
    res.status(200).json(topProducts);
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const getOverAllData = async (req, res) => {
  try {
    const month = new Date().getMonth();
    const userCount = await User.countDocuments({ role: "user" });
    const result = await Products.aggregate([
      { $unwind: "$variantValues" },
      { $count: "totalVariants" },
    ]);
    const productCount = result[0]?.totalVariants || 0;
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amount" },
        },
      },
    ]);
    const totalSales = salesData[0]?.totalSales || 0;

    const productsByMonth = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          $or: [{ _id: month + 1 }, { _id: month }],
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          $or: [{ _id: month + 1 }, { _id: month }],
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const productsPercentage =
      productsByMonth.length > 1
        ? ((productsByMonth[0]?.count - productsByMonth[1]?.count) /
            productsByMonth[1]?.count) *
            100 || 0
        : 0;

    const usersPercentage =
      usersByMonth.length > 0
        ? ((usersByMonth[0]?.count - (usersByMonth[1]?.count || 0)) /
            (usersByMonth[1]?.count || 1)) *
            100 || 0
        : 0;
    res.status(200).json({
      userCount,
      productCount,
      productsPercentage,
      usersPercentage,
      totalSales,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const salesByCategory = async (req, res) => {
  try {
    const salesData = await Products.aggregate([
      {
        $unwind: "$variantValues",
      },
      {
        $addFields: {
          variantSold: { $toInt: "$variantValues.values.sold" },
          variantSales: {
            $multiply: [
              { $toInt: "$variantValues.values.sold" },
              { $toInt: "$variantValues.values.price" },
            ],
          },
        },
      },
      {
        $match: {
          variantSold: { $gt: 0 },
        },
      },
      {
        $unwind: "$category",
      },
      {
        $group: {
          _id: "$category.label",
          totalOrders: { $sum: "$variantSold" },
          totalSales: { $sum: "$variantSales" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalOrders: 1,
          totalSales: 1,
        },
      },
    ]);
    res.status(200).json(salesData);
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};
