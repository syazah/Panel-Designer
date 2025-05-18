import mongoose from "mongoose";

const SalesPersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    orders: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Order",
    },
    customers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Customer",
    },
  },
  { timestamps: true }
);

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    orderRaised:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    collections:{
      type: [mongoose.Schema.Types.ObjectId],
      ref: "SalesCollection",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
    },
  },
  { timestamps: true }
);

export const Sale = mongoose.model("Sale", SalesPersonSchema);
export const Customer = mongoose.model("Customer", CustomerSchema);
