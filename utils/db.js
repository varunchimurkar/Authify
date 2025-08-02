import mongoose from "mongoose";


const db = () => {
mongoose.connect(process.env.MONGO_URL)
 .then(() => {
    console.log("connected to MongoDB")
 })
 .catch((err) => {
    console.log("Error connectiong to MongoDB")
 })
}

export default db