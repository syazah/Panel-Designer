import errorHandler from "../utils/errorHandler.js";
import validator from "validator";
import PasswordValidator from "password-validator";
import { Admin } from "../models/Admin.js";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { Business } from "../models/Business.js";
import { Manufacturer } from "../models/Manufacturer.js";
import { Customer, Sale } from "../models/Sale.js";
import { NormalPanel } from "../models/NormalPanel.js";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { SalesCollection } from "../models/SalesCollection.js";
import { SalesPanel } from "../models/SalesPanel.js";
dotenv.config();

export const SalesSignInController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(errorHandler(400, "Send All The Details"));
    }
    const sale = await Sale.findOne({ email });
    if (!sale) {
      return next(errorHandler(400, "No Salesman Found With This Mail"));
    }
    const correctPassword = bcryptjs.compareSync(password, sale.password);
    if (!correctPassword) {
      return next(errorHandler(400, "Password is not correct"));
    }
    const token = jwt.sign({ id: sale._id }, process.env.JWT_SECRET);
    res.status(200).json({ success: true, token, type: 2 });
  } catch (error) {
    return next(error);
  }
};

// SALES MAN GET DETAILS CONTROLLER
export const SalesManGetDetailsController = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return next(errorHandler(400, "Admin Token Not Found"));
    }
    const { id } = await jwt.verify(token, process.env.JWT_SECRET);
    if (!id) {
      return next(
        errorHandler(
          400,
          "Something went wrong while getting correct id of admin"
        )
      );
    }
    const salesman = await Sale.findOne({ _id: id }).select(
      "name username email"
    );
    const orders = await Order.find({ currentStage: "Sale" }).sort({
      updatedAt: -1,
    });
    const history = await Order.find({ detailedStage: "sales-to-admin" }).sort({
      updatedAt: -1,
    });
    if (!salesman) {
      return next(errorHandler(400, "No Salesman found"));
    }
    res.status(200).json({ success: true, salesman, orders, history });
  } catch (error) {
    return next(error);
  }
};

//SALES MAN EDIT QUOTATION CONTROLLER
export const SalesManEditQuotationCostController = async (req, res, next) => {
  try {
    const { id, cost } = req.body;
    if (!id || !cost) {
      return next(errorHandler(400, "Your credentials are not correct"));
    }
    const order = await Order.findOneAndUpdate(
      { _id: id },
      { quotationCost: cost }
    );
    if (!order) {
      return next(errorHandler(400, "Order not found"));
    }
    return res.status(200).json({ success: true, cost });
  } catch (error) {
    return next(error);
  }
};

//SALES MAN SEND TO ADMIN
export const SalesManSendToAdmin = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      return next(
        errorHandler(400, "Could not find an id linked to the order")
      );
    }

    await Order.findOneAndUpdate(
      { _id: id },
      {
        currentStage: "Admin",
        detailedStage: "sales-to-admin",
      }
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

//SALES ADD CUSTOMER
export const SalesAddCustomerController = async (req, res, next) => {
  try {
    const { name, email, phone, address, city, state, panelData, token } =
      req.body;
    if (!name || !email || !phone || !address || !city || !state || !token) {
      return next(errorHandler(400, "Required Fields Not Provided"));
    }
    const { id } = await jwt.verify(token, process.env.JWT_SECRET);
    const newCustomer = new Customer({
      name,
      email,
      phone,
      address,
      city,
      state,
      panelData: [],
      createdBy: id,
    });
    await newCustomer.save();
    await Sale.findOneAndUpdate(
      { _id: id },
      { $addToSet: { customers: newCustomer._id } }
    );
    if (!newCustomer) {
      return next(errorHandler(500, "Adding data to database sent error"));
    }
    return res.status(200).json({ success: true, newCustomer });
  } catch (error) {
    return next(error);
  }
};

//SALES GET CUSTOMER CONTROLLER
export const SalesGetCustomerController = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return next(errorHandler(400, "Token not found"));
    }
    const { id } = await jwt.verify(token, process.env.JWT_SECRET);
    if (!id) {
      return next(errorHandler(500, "Something went wrong while getting id"));
    }
    const salesman = await Sale.findOne({ _id: id });
    if (!salesman) {
      return next(500, "No salesman exists with given token");
    }
    const data = await Customer.find({ createdBy: id });
    if (!data) {
      return next(
        errorHandler(500, " Something went wrong while fetching customers")
      );
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

// SALES GET PANELS
export const SalesGetPanelsController = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      return next(errorHandler(400, "Required ID not provided"));
    }
    const customer = await Customer.findOne({ _id: id });
    if (!customer) {
      return next(errorHandler(400, "Panels Not found for this id"));
    }
    return res.status(200).json({ success: true, data: customer });
  } catch (error) {
    return next(error);
  }
};

export const SalesCreateOrderController = async (req, res, next) => {
  try {
    const { panelData, token, customerId } = req.body;
    if (!panelData) {
      return next(errorHandler(400, "Required Fields Not Provided"));
    }
    if (!token) {
      return next(errorHandler(400, "Sales Token Not Found"));
    }
    const { id } = await jwt.verify(token, process.env.JWT_SECRET);
    if (!id) {
      return next(
        errorHandler(
          400,
          "Something went wrong while getting correct id of admin"
        )
      );
    }
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let referenceNumber = "";

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      referenceNumber += chars[randomIndex];
    }

    const newOrder = new Order({
      panelData,
      raisedBy: id,
      referenceNumber: referenceNumber,
      currentStage: "Sale",
      detailedStage: "admin-to-sales",
      pdfLink: null,
      assignedTo: id
    });
    await newOrder.save();

    await Sale.findOneAndUpdate(
      { _id: id },
      { $addToSet: { orders: newOrder._id } }
    );

    await Customer.findOneAndUpdate(
      { _id: customerId },
      { $addToSet: { orderRaised: newOrder._id } }
    );

    return res.status(200).json({ success: true, newOrder });
  } catch (error) {
    return next(error);
  }
};

export const SalesCreateCollectionController = async (req, res, next) => {
  try {
    const { _id, name } = req.body
    const customer = await Customer.findOne({ _id })
    if (!customer) {
      return next(errorHandler(400, "Customer not found"))
    }
    if (!_id || !name) {
      return next(errorHandler(400, "Required Fields Not Provided"))
    }

    const collection = new SalesCollection({
      name,
      author: _id,
    })

    await collection.save()

    await Customer.findOneAndUpdate(
      { _id },
      { $addToSet: { collections: collection._id } }
    )

    // Convert to plain object to avoid circular references
    const collectionObj = collection.toObject();

    return res.status(200).json({ success: true, collection: collectionObj })
  } catch (error) {
    console.error("Error in SalesCreateCollectionController:", error);
    return next(error);
  }
}

export const SalesGetCollectionsController = async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!id || id === "undefined") {
      return next(errorHandler(400, "Required Fields Not Provided - Valid ID is required"));
    }

    // Use lean() to get plain JavaScript objects instead of Mongoose documents
    const customer = await Customer.findOne({ _id: id })
      .populate({
        path: "collections",
        select: 'name author', // Only select necessary fields,
        populate: {
          path: "panels",
        }
      })
      .lean();

    if (!customer) {
      return next(errorHandler(400, "Collection not found"))
    }
    return res.status(200).json({ success: true, data: customer })
  } catch (error) {
    console.error("Error in SalesGetCollectionsController:", error);
    return next(error);
  }
}

export const SalesGetCollectionController = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(errorHandler(400, "Required Fields Not Provided"))
    }

    // Add await keyword and use lean() to get a plain JavaScript object instead of a Mongoose document
    const collection = await SalesCollection.findOne({ _id: id }).populate({
      path: 'author',
      select: 'name email phone' // Only select necessary fields to avoid circular references
    }).populate({
      path: 'panels',
      select: 'panelName panelData' // Include panelData to get more details
    }).lean();

    if (!collection) {
      return next(errorHandler(400, "Collection not found"))
    }
    return res.status(200).json({ success: true, data: collection })
  } catch (error) {
    console.error("Error in SalesGetCollectionController:", error);
    return next(error);
  }
}

export const SalesAddPanelsToCollectionController = async (req, res, next) => {
  try {
    const { panelData, collectionId, token } = req.body;

    if (!panelData || !collectionId || !token) {
      return next(errorHandler(400, "Required fields not provided"));
    }

    // Verify token
    const { id } = await jwt.verify(token, process.env.JWT_SECRET);
    if (!id) {
      return next(errorHandler(400, "Invalid token"));
    }

    // Find the collection
    const collection = await SalesCollection.findById(collectionId);
    if (!collection) {
      return next(errorHandler(404, "Collection not found"));
    }

    // Add panels to collection
    collection.panels = collection.panels ? [...collection.panels, ...panelData] : panelData;
    await collection.save();

    return res.status(200).json({
      success: true,
      message: "Panels added to collection successfully"
    });
  } catch (error) {
    console.error("Error adding panels to collection:", error);
    return next(error);
  }
};

export const SalesPanelCreateController = async (req, res, next) => {
  try {
    const { panelData, collectionId } = req.body;
    if (!panelData || !collectionId) {
      return next(errorHandler(400, "Required fields not provided"));
    }
    // Find the collection
    const collection = await SalesCollection.findById(collectionId);
    if (!collection) {
      return next(errorHandler(404, "Collection not found"));
    }
    // Create a new panel
    const newPanel = new SalesPanel({
      panelName: panelData.panelName,
      parentCollection: collectionId,
      panelData: panelData,
    })
    await newPanel.save();
    // Add the new panel to the collection
    await SalesCollection.findByIdAndUpdate(
      collectionId,
      { $addToSet: { panels: newPanel._id } }
    );
    return res.status(200).json({ success: true, newPanel });
  } catch (error) {
    return next(error);
  }
}

export const SalesDeleteCollectionController = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(errorHandler(400, "Required Fields Not Provided"));
    }

    // Find the collection
    const collection = await SalesCollection.findById(id);
    if (!collection) {
      return next(errorHandler(404, "Collection not found"));
    }

    // Delete the collection
    await SalesCollection.findByIdAndDelete(id);
    // Remove the collection reference from the customer
    await Customer.findByIdAndUpdate(
      collection.author,
      { $pull: { collections: id } }
    );
    // Delete the associated panels
    await SalesPanel.deleteMany({ parentCollection: id });
    return res.status(200).json({ success: true, message: "Collection deleted successfully" });
  } catch (error) {
    return next(error);
  }
}

export const SalesGetCompleteDetailController = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(errorHandler(400, "Required Fields Not Provided"));
    }

    // Find the collection
    const customer = await Customer.findById(id).populate({
      path: 'collections',
      populate: {
        path: 'panels'
      }
    })
    if (!customer) {
      return next(errorHandler(404, "Customer not found"));
    }
    // Convert to plain object to avoid circular references
    const customerObj = customer.toObject();
    // Remove the __v field
    delete customerObj.__v;
    return res.status(200).json({ success: true, data: customerObj });
  } catch (error) {
    return next(error);
  }
}