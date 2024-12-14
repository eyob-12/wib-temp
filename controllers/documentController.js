const Document = require('../models/document'); // Mongoose model for documents
const cloudinary = require('../utils/cloudinary'); // Cloudinary utility for image handling
const ActivityLog = require("../models/Activity"); 

// Create a new document
const createDocument = async (req, res) => {
  try {
    const { TinNumber, images, idCardImages,PostedByuserId } = req.body;

    const newDocument = await Document.create({
      TinNumber,
      images,
      idCardImages,
      PostedByuserId,
    });

    await ActivityLog.create({
      action: "Create Document",
      resource: "Document",
      resourceId: newDocument ._id,
      user: newDocument.PostedByuserId,
      details: { newDocument  },
  });

    

    res.status(201).json({
      success: true,
      data: newDocument,
    });
  } catch (error) {
    console.log(error),
    res.status(400).json({
      success: false,
      message: 'Error creating document',
      error: error.message,
    
    });
  }
};
const getDocuments= async (req, res) => {
  try {
    const documents = await Document.find({ status: "pending" });

    if (!documents.length) {
      return res.status(404).json({
        success: false,
        message: 'No documents found with status not approved.',
      });
    }

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {

    console.error('Error fetching documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

const updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { status } = req.body; 
    
    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }
    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { status },
      { new: true } 
    );
    if (!updatedDocument) {
      return res.status(404).json({ message: "Document not found." });
    }
    await ActivityLog.create({
      action: "Update Document",
      resource: "Document",
      resourceId: updatedDocument._id,
      user:updatedDocument.PostedByuserId,
      details: { updatedDocument  },
  });

    res.status(200).json({
      message: "Document status updated successfully.",
      document: updatedDocument,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Upload images
const uploadImage = async (req, res) => {
  try {
    const files = req.files;
    const uploadedImages = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'documents',
      });
      uploadedImages.push({
        public_id: result.public_id,
        secure_url: result.secure_url,
      });
    }

    res.status(200).json({
      success: true,
      payload: uploadedImages,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Image upload failed',
      error: error.message,
    });
  }
};

// Delete an image
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cloudinary.uploader.destroy(id);

    await ActivityLog.create({
      action: "Delete Document",
      resource: "Document",
      resourceId: result._id,
      user: result.PostedByuserId,
      details: { result  },
  });

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } else {
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Image deletion failed',
      error: error.message,
    });
  }
};

module.exports = {
  createDocument,
  uploadImage,
  deleteImage,
  getDocuments,
  updateDocumentStatus,
};
