import express from "express";
const route = express.Router();
import {
  SalesSignInController,
  SalesManGetDetailsController,
  SalesManEditQuotationCostController,
  SalesManSendToAdmin,
  SalesAddCustomerController,
  SalesGetCustomerController,
  SalesGetPanelsController,
  SalesCreateOrderController,
  SalesCreateCollectionController,
  SalesGetCollectionController,
  SalesGetCollectionsController,
  SalesAddPanelsToCollectionController,
  SalesPanelCreateController,
  SalesDeleteCollectionController,
  SalesGetCompleteDetailController
} from "../controllers/sale.controllers.js";
route.post("/signin", SalesSignInController);
route.post("/salesman-details", SalesManGetDetailsController);
route.post("/quotation-cost", SalesManEditQuotationCostController);
route.post("/send-admin", SalesManSendToAdmin);
route.post("/create-order", SalesCreateOrderController);
route.post("/add-customer", SalesAddCustomerController);
route.post("/get-customer", SalesGetCustomerController);
route.post("/get-panels", SalesGetPanelsController);

//panel
route.post("/create-panel", SalesPanelCreateController)

//collection
route.post("/create-collection", SalesCreateCollectionController)
route.post("/get-collection", SalesGetCollectionsController);
route.get("/get-collection/:id", SalesGetCollectionController);
route.post("/add-panels-to-collection", SalesAddPanelsToCollectionController);
route.delete("/delete-collection/:id", SalesDeleteCollectionController)

//Complete Detail
route.get("/completeDetail/:id", SalesGetCompleteDetailController);
export default route;
