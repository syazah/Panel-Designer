import mongoose from "mongoose";

const PanelSchema = new mongoose.Schema({
  panelName: {
    type: String,
    required: true,
  },
  panelType: {
    type: String,
    required: true,
    enum: ["normal", "extension"],
  },
  parentCollection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection",
  },
  panelData: {
    type: mongoose.Schema.Types.Mixed,
  },
  quantity:{
    type: Number,
    default: 1,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export const Panel = mongoose.model("Panel", PanelSchema);
