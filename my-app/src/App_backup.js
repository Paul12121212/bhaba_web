import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";
import { MeiliSearch } from 'meilisearch';
import serverless from 'serverless-http';

const app = express();
app.use(cors());
app.use(express.json());

const client = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_API_KEY
});
const index = client.index('vendor_store_data');

// =================== All Your Routes Below ===================

// Get all vendor stores
app.get("/vendors", async (req, res) => {
  try {
    const searchResult = await index.search('', {
      limit: 1000
    });

    // Extract unique vendors
    const vendorsMap = new Map();
    searchResult.hits.forEach(hit => {
      if (!vendorsMap.has(hit.vendorId)) {
        vendorsMap.set(hit.vendorId, {
          id: hit.vendorId,
          store_name: hit.vendor_name,
          store_logo: hit.store_logo
        });
      }
    });

    const vendors = Array.from(vendorsMap.values());
    res.json(vendors);
  } catch (error) {
    console.error("Error getting vendors:", error);
    res.status(500).send("Server error");
  }
});

// Get specific vendor store by ID
app.get("/vendors/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const searchResult = await index.search('', {
      limit: 1000
    });
    
    // Find vendor by ID
    const vendor = searchResult.hits.find(hit => hit.vendorId === vendorId);
    
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    
    res.json({
      id: vendor.vendorId,
      store_name: vendor.vendor_name,
      store_logo: vendor.store_logo
    });
  } catch (error) {
    console.error("Error getting vendor:", error);
    res.status(500).send("Server error");
  }
});

// Get categories for a specific vendor
app.get("/vendors/:vendorId/categories", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const searchResult = await index.search('', {
      limit: 1000
    });
    
    // Filter by vendorId and extract unique categories
    const categoriesMap = new Map();
    searchResult.hits.forEach(hit => {
      if (hit.vendorId === vendorId && !categoriesMap.has(hit.categoryId)) {
        categoriesMap.set(hit.categoryId, {
          id: hit.categoryId,
          category_name: hit.category_name
        });
      }
    });

    const categories = Array.from(categoriesMap.values());
    res.json(categories);
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).send("Server error");
  }
});

// Get products for a specific vendor and category
app.get("/vendors/:vendorId/categories/:categoryId/products", async (req, res) => {
  try {
    const { vendorId, categoryId } = req.params;
    const searchResult = await index.search('', {
      limit: 1000
    });
    
    // Filter products by vendorId and categoryId
    const products = searchResult.hits
      .filter(hit => hit.vendorId === vendorId && hit.categoryId === categoryId)
      .map(hit => ({
        id: hit.productId,
        productId: hit.productId,
        product_name: hit.product_name,
        price: hit.price,
        description: hit.description,
        discount: hit.discount,
        details: hit.details,
        tier_pricing: hit.tier_pricing,
        product_images: hit.product_images,
       // product_images: ["https://i.ibb.co/cm382jK/images-2.jpg"],
        //product_video_url: hit.product_video_url,
        mobile_number: hit.mobile_number,
        isAvailable: hit.isAvailable,
        moq: hit.moq,
        added_at: hit.added_at
      }));
    
    res.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).send("Server error");
  }
});

// Get all products from all vendors (flattened structure)
app.get("/products", async (req, res) => {
  try {
    const searchResult = await index.search('', {
      limit: 10000
    });
    
    const products = searchResult.hits.map(hit => ({
      id: hit.productId,
      productId: hit.productId,
      product_name: hit.product_name,
      price: hit.price,
      description: hit.description,
      discount: hit.discount,
      details: hit.details,
      tier_pricing: hit.tier_pricing,
      product_images: hit.product_images,
      //product_images: ["https://i.ibb.co/cm382jK/images-2.jpg"],
      //product_video_url: hit.product_video_url,
      mobile_number: hit.mobile_number,
      isAvailable: hit.isAvailable,
      moq: hit.moq,
      added_at: hit.added_at,
      vendorId: hit.vendorId,
      vendorName: hit.vendor_name,
      categoryId: hit.categoryId,
      categoryName: hit.category_name,
      //store_logo: hit.store_logo
    }));
    
    res.json(products);
  } catch (error) {
    console.error("Error getting all products:", error);
    res.status(500).send("Server error");
  }
});

// Get products from a specific vendor (all categories)
app.get("/vendors/:vendorId/products", async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    const searchResult = await index.search('', {
      limit: 1000
    });
    
    // Filter products by vendorId
    const products = searchResult.hits
      .filter(hit => hit.vendorId === vendorId)
      .map(hit => ({
        id: hit.productId,
        productId: hit.productId,
        product_name: hit.product_name,
        price: hit.price,
        description: hit.description,
        discount: hit.discount,
        details: hit.details,
        tier_pricing: hit.tier_pricing,
        product_images: hit.product_images,
        // product_images: ["https://i.ibb.co/cm382jK/images-2.jpg"],
        //product_video_url: hit.product_video_url,
        mobile_number: hit.mobile_number,
        isAvailable: hit.isAvailable,
        moq: hit.moq,
        added_at: hit.added_at,
        categoryId: hit.categoryId,
        categoryName: hit.category_name,
        vendorName: hit.vendor_name,
        //store_logo: hit.store_logo
      }));
    
    if (products.length === 0) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    
    res.json(products);
  } catch (error) {
    console.error("Error getting vendor products:", error);
    res.status(500).send("Server error");
  }
});

// Get vendor subscriptions (this endpoint might not be applicable for MeiliSearch data)
app.get("/vendors/:vendorId/subscriptions", async (req, res) => {
  try {
    // Since subscriptions are not part of the product data structure,
    // this endpoint returns empty array or you can modify based on your needs
    res.json([]);
  } catch (error) {
    console.error("Error getting subscriptions:", error);
    res.status(500).send("Server error");
  }
});

// Add a new product to MeiliSearch
app.post("/vendors/:vendorId/categories/:categoryId/products", async (req, res) => {
  try {
    const { vendorId, categoryId } = req.params;
    const productId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const productData = {
      productId: productId,
      vendorId: vendorId,
      categoryId: categoryId,
      ...req.body,
      added_at: new Date().toISOString(),
      isAvailable: true,
    };
    
    await index.addDocuments([productData]);
    
    res.status(201).json({
      id: productId,
      productId: productId,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).send("Server error");
  }
});

// Update a product
app.put("/vendors/:vendorId/categories/:categoryId/products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Get all documents and find the one to update
    const searchResult = await index.search('', {
      limit: 1000
    });
    
    const existingProduct = searchResult.hits.find(hit => hit.productId === productId);
    
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const updatedProduct = {
      ...existingProduct,
      ...req.body,
      productId: productId // Ensure productId stays the same
    };
    
    await index.addDocuments([updatedProduct]);
    
    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Server error");
  }
});

// Delete a product
app.delete("/vendors/:vendorId/categories/:categoryId/products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    
    await index.deleteDocument(productId);
    
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Server error");
  }
});

// Search products with query
app.get("/search", async (req, res) => {
  try {
    const { q, limit = 20, offset = 0, filter } = req.query;
    
    const searchOptions = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
    
    // Only use filter if it's for category_name (the only filterable attribute)
    if (filter && filter.includes('category_name')) {
      searchOptions.filter = filter;
    }
    
    const searchResult = await index.search(q || '', searchOptions);
    
    const products = searchResult.hits.map(hit => ({
      id: hit.productId,
      productId: hit.productId,
      product_name: hit.product_name,
      price: hit.price,
      description: hit.description,
      discount: hit.discount,
      details: hit.details,
      tier_pricing: hit.tier_pricing,
      product_images: hit.product_images,
      //product_images: ["https://i.ibb.co/cm382jK/images-2.jpg"],
      //product_video_url: hit.product_video_url,
      mobile_number: hit.mobile_number,
      isAvailable: hit.isAvailable,
      moq: hit.moq,
      added_at: hit.added_at,
      vendorId: hit.vendorId,
      vendorName: hit.vendor_name,
      categoryId: hit.categoryId,
      categoryName: hit.category_name,
      //store_logo: hit.store_logo
    }));
    
    res.json({
      hits: products,
      totalHits: searchResult.totalHits,
      totalPages: Math.ceil(searchResult.totalHits / parseInt(limit)),
      currentPage: Math.floor(parseInt(offset) / parseInt(limit)) + 1
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).send("Server error");
  }
});

// =================== Export for Vercel ===================
export default serverless(app);
