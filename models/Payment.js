const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    bill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill",
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    paymentMode: {
        type: String,
        default: "Cash"
    },

    receiptNumber: {
        type: String,
        unique: true
    },

    paymentDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Payment", paymentSchema);