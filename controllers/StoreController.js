const Store = require("../models/Store.js");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId.js");
const { v4: uuidv4 } = require('uuid');
const ActivityLog = require("../models/Activity");
const Product = require("../models/Product.js");


const createStore = asyncHandler(async (req, res) => {
    try {
        const { storeName, address, owner_id } = req.body;
      
        console.log("Request Body:", req.body);
  
      if (!storeName || !address || !owner_id) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const newStore = await Store.create({
        storeId: req.body.storeId || uuidv4(),
        storeName,
        owner_id,
        address
        
      });
      

      await ActivityLog.create({
            action: "Create store",
            resource: "Store",
            resourceId: newStore._id,
            user: newStore.owner_id, 
            details: { newStore},
        });
  
      res.status(201).json({ message: "Store created successfully", store: newStore });
    } catch (error) {
    console.error("Error creating store:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  

const getStoresByUser = async (req, res) => {
    const { id } = req.params; 

    try {
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const stores = await Store.find({owner_id: id }); 

        if (stores.length === 0) {
            return res.status(404).json({ message: "No stores found for this user" });
        }
        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateStore = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(id)
    validateMongoDbId(id);
    try {
        const updatedStore = await Store.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        await ActivityLog.create({
            action: "Update store",
            resource: "Store",
            resourceId: updatedStore._id,
            user: updatedStore.owner_id, 
            details: { updatedStore: req.body },
        });
        res.json(updatedStore);
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
});
const deleteStore = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate the MongoDB ID
    validateMongoDbId(id);

    try {
        // Find and delete the store by its ID
        const deletedStore = await Store.findByIdAndDelete(id);

        if (!deletedStore) {
            return res.status(404).json({ message: "Store not found" });
        }

        // Log the delete action in the ActivityLog
        await ActivityLog.create({
            action: "Delete store",
            resource: "Store",
            resourceId: deletedStore._id,
            user: deletedStore.owner_id,
            details: { deletedStore },
        });

        // Delete associated products for the store
        await Product.deleteMany({ store: id });

        res.status(200).json({
            message: "Store and associated products deleted successfully",
            deletedStore,
        });
    } catch (error) {
        console.error("Error deleting store:", error.message);
        res.status(500).json({ message: "Failed to delete store", error: error.message });
    }
});

const getStore = asyncHandler(async (req, res) => {
    const { id } = req.params; 
    
    try {
        const store = await Store.find({owner_id:id});
        if (!store) {
            console.log("Store not found")
            return res.status(404).json({ message: "Store not found" }); 
        }

        res.json(store);
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: "Server error", error: error.message }); 
    }
});

const getallStore = asyncHandler(async (req, res) => {
    try {
        const getallStore = await Store.find();
        res.json(getallStore);

    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {
    createStore,
    updateStore,
    deleteStore,
    getStore,
    getallStore,
    getStoresByUser,
};