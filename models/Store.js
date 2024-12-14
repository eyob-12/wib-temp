
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  storeId: {
    type: String,
    unique: true,
},
    storeName: {
    type: String,
    required: true
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true, 
  },
  address: {
    type: String,
    required: true
  },
  
  created_at: {
    type: Date,
    default: Date.now
  },
  
});


const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
