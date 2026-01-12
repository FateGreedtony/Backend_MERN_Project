// memanggil dependensi mongoose
const mongoose = require("mongoose")
// Data produk yang akan di simpan di server mongoose
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
    },
    thumbnail: {
        type: String,
        required: true,
    },
    cloudinaryId: {
        type: String
    }
});

module.exports = mongoose.model("Products", userSchema)