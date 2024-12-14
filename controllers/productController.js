const Product = require("../models/Product");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongoDbId");
const ActivityLog = require("../models/Activity");

const createProduct = asyncHandler(async (req, res) => {
    try {
      
        console.log("Data from client:", req.body);
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }

        // Map colorImagePairs to the colors array
        if (req.body.colorImagePairs) {
            req.body.colors = req.body.colorImagePairs.map(pair => ({
                color: pair.color, // Assuming this is an ObjectId
                images: pair.images
            }));
        }

        // Create the new product with the updated body
        const newProduct = await Product.create(req.body);

        // Activity log for category creation
        await ActivityLog.create({
            action: "create Product",
            resource: "Product",
            resourceId: newProduct._id,
            user: newProduct.PostedByuserId,
            details: { newProduct},
        });

        // Return the created product
        res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
        });
       

        // Activity log for category creation
        await ActivityLog.create({
            action: "Update Product",
            resource: "Product",
            resourceId:updateProduct._id,
            user: updateProduct.PostedByuserId,
            details: { updateProduct},
        });
        res.json(updateProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.body;
    
     const user=userId.userId;
    validateMongoDbId(id);
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        
        
        // Activity log for category creation
        await ActivityLog.create({
            action: "Delete Product",
            resource: "Product",
            resourceId: id,
            user: user,
            details: { deletedProduct},
        });

        res.json(deletedProduct);
    } catch (error) {
        console.log(error)
        throw new Error(error);
    }
});

const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params; // Assuming the product ID is passed as a URL parameter

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error finding product:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

const getAllProduct = asyncHandler(async (req, res) => {
    try {
        // Filtering
        const queryObj = { ...req.query };
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        let query = Product.find(JSON.parse(queryStr));

        // Sorting

        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }

        // limiting the fields

        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }

        // pagination

        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error("This Page does not exists");
        }
        const product = await query;
        res.json(product);
    } catch (error) {
        throw new Error(error);
    }
});
const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { productId } = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyadded = user.wishlist.find((id) => id.toString() === productId);
        if (alreadyadded) {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $pull: { wishlist: productId },
                },
                {
                    new: true,
                }
            );
            res.json(user);
        } else {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $push: { wishlist: productId },
                },
                {
                    new: true,
                }
            );
            res.json(user);
        }
    } catch (error) {
        throw new Error(error);
    }
});

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    try {
        const product = await Product.findById(prodId);
        let alreadyRated = product.ratings.find(
            (userId) => userId.postedby.toString() === _id.toString()
        );
        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated },
                },
                {
                    $set: { "ratings.$.star": star, "ratings.$.comment": comment },
                },
                {
                    new: true,
                }
            );
        } else {
            const rateProduct = await Product.findByIdAndUpdate(
                prodId,
                {
                    $push: {
                        ratings: {
                            star: star,
                            comment: comment,
                            postedby: _id,
                        },
                    },
                },
                {
                    new: true,
                }
            );
        }
        const getallratings = await Product.findById(prodId);
        let totalRating = getallratings.ratings.length;
        let ratingsum = getallratings.ratings
            .map((item) => item.star)
            .reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingsum / totalRating);
        let finalproduct = await Product.findByIdAndUpdate(
            prodId,
            {
                totalrating: actualRating,
            },
            { new: true }
        );
        res.json(finalproduct);
    } catch (error) {
        throw new Error(error);
    }
});

// new



// getStoreProducts
const getStoreProducts = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const products = await Product.find({ store: id }).populate('store', 'storeName');
        if (!products) {
            return res.status(404).json({ message: 'error is occure' });
        }
        else if ( products.length === 0){
            return res.status(202).json({ message: 'No products found for this store' });
        }
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});



// Update product status
const updateProductStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        if (!req.body.status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { status: req.body.status },
            { new: true }
        );
        await Activity.create({
            action: "Update Product status",
            resource: "Product",
            resourceId:updatedProduct._id,
            user: updatedProduct.PostedByuserId,
            details: { updatedProduct },
        });


        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(updatedProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const getProductCountByCategory = async (req, res) => {
    try {
      const { merchantId } = req.params; 
      const products = await Product.find({postesby_id: merchantId });
      const uniqueCategories = [...new Set(products.map((product) => product.category))];
      const categoryCounts = uniqueCategories.map((category) => {
        const count = products.filter((product) => product.category === category).length;
        return { category, count };
      });
      res.status(200).json({
        success: true,
        message: "Product count by unique category retrieved successfully",
        data: categoryCounts,
      });
    } catch (error) {
      console.error("Error fetching product categories:", error);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  };

  const fetchRecentProducts = async (req, res) => {
  try {
    const { id } = req.params;
  

    // Fetch recent products and populate the store details
    const recentProducts = await Product.find({  PostedByuserId: id })
      .sort({ createdAt: -1 }) 
      .limit(10)
      .populate('store', 'storeName'); 

    if (recentProducts.length === 0) {
      return res.status(202).json({ message: 'No products found for this merchant.' });
    }
   

    res.status(200).json({ data: recentProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

  const  EachMerchantProducts = async (req, res) => {
    try {
      const { id} = req.params;
      console.log(id)
      const recentProducts = await Product.find({PostedByuserId :  id })
        .sort({ createdAt: -1 }) 
  
      if (recentProducts.length === 0) {
        return res.status(202).json({ message: 'No products found for this merchant.' });
      }
  
      res.status(200).json({ data: recentProducts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error, please try again later.' });
    }
  };


  const AllGetProductCountByCategory = async (req, res) => {
    try {
      
      const products = await Product.find();
      const uniqueCategories = [...new Set(products.map((product) => product.category))];
      const categoryCounts = uniqueCategories.map((category) => {
        const count = products.filter((product) => product.category === category).length;
        return { category, count };
      });
      res.status(200).json({
        success: true,
        message: "Product count by unique category retrieved successfully",
        data: categoryCounts,
      });
    } catch (error) {
      console.error("Error fetching product categories:", error);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  };

  const AllfetchRecentProducts = async (req, res) => {
    try {
      const recentProducts = await Product.find()
        .sort({ createdAt: -1 }) 
        .limit(10)
        .populate('store', 'storeName'); // Moved the semicolon to the correct position
  
      if (recentProducts.length === 0) {
        return res.status(202).json({ message: 'No products found' });
      }
  
      res.status(200).json({ data: recentProducts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error, please try again later.' });
    }
  };
  
  const  AllEachMerchantProducts = async (req, res) => {
    try {
      
      const recentProducts = await Product.find()
        .sort({ createdAt: -1 }) 
  
      if (recentProducts.length === 0) {
        return res.status(200).json({ message: 'No products found for this merchant.' });
      }
  
      res.status(200).json({ data: recentProducts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error, please try again later.' });
    }
  };
 

module.exports = {
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    //new
    updateProductStatus,
    getStoreProducts,
    getProductCountByCategory,
    fetchRecentProducts,
    EachMerchantProducts,
    AllGetProductCountByCategory,
    AllfetchRecentProducts,
    AllEachMerchantProducts,
};