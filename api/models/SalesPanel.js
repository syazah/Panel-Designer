import mongoose from "mongoose";

const SalesPanelSchema = new mongoose.Schema({
  panelName: {
    type: String,
    required: true,
  },
  parentCollection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection",
  },
  panelData: {
    type: mongoose.Schema.Types.Mixed,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  remarks:{
    type: String,
    default: "",
  }
});

export const SalesPanel = mongoose.model("SalesPanel", SalesPanelSchema);
