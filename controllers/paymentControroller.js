const dotenv = require("dotenv");
const axios = require("axios");
const Order = require("../models/Order.js");
const Notification = require("../models/Notification.js");

dotenv.config();

const initializePayment = async (req, res) => {
    const {
        totalPrice, currency, email, first_name, tx_ref,
        last_name, phone_number, address, country, city,
        postalCode, totalPriceAfterDiscount, cart
    } = req.body;

    const userId = req.user._id;

    try {
        // Make the API call directly using axios
        const chapaResponse = await axios.post('https://api.chapa.co/v1/transaction/initialize', {
            amount: totalPrice,
            currency: "ETB",
            tx_ref: tx_ref,
            callback_url: "http://localhost:4000/api/payment/verify", // or your deployed URL
            return_url: "http://localhost:3000/payment/success", // your frontend URL
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone_number: phone_number
        }, {
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (chapaResponse.data.status === "success") {
            // Create a pending order
            const newOrder = new Order({
                user: userId,
                currency,
                first_name,
                last_name,
                email,
                phone_number,
                address,
                city,
                postalCode,
                tx_ref,
                cart,
                country,
                totalPrice,
                totalPriceAfterDiscount,
                status: "pending"
            });

            await newOrder.save();

            // Create a new notification
            const notification = new Notification({
                user: userId,
                message: `New order created with ref: ${newOrder.tx_ref}`,
                order: newOrder._id,
            });
            await notification.save();

            //const io = req.app.get("io");
            //io.emit("notification", {
            //    message: "New order created",
            //    order: newOrder,
            //});

            // Send payment initialization link back to frontend
            res.status(200).json({ payment_url: chapaResponse.data.data.checkout_url });
        } else {
            res.status(400).json({ message: "Payment initialization failed" });
        }
    } catch (error) {
        console.error("Chapa payment error:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Payment failed", error: error.response ? error.response.data : error.message });
    }
};

// Verify Chapa Payment
// Verify Chapa Payment
const verifyPayment = async (req, res) => {
    const { tx_ref } = req.query;

    try {
        const verifyResponse = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
            }
        });

        if (verifyResponse.data.status === "success") {
            const order = await Order.findOneAndUpdate(
                { tx_ref },
                { status: "completed" },
                { new: true }
            );

            res.status(200).json({
                message: "Payment verified successfully",
                order,
                success: true, // Add a success flag
            });
        } else {
            res.status(400).json({ message: "Payment verification failed", success: false });
        }
    } catch (error) {
        console.error("Chapa verification error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    verifyPayment,
    initializePayment
};
