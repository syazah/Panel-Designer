import mongoose from "mongoose"



const SalesCollectionModal = new mongoose.Schema(
      {
        name: {
          type: String,
          required: true,
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Sale",
        },
        panels: {
          type: [mongoose.Schema.Types.ObjectId],
          ref: "SalesPanel",
        },
      },
      { timestamps: true }
    );


    export const SalesCollection = mongoose.model("SalesCollection", SalesCollectionModal);