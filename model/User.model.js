import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : String,
    email: String,
    password: String,
    role: {
        type : String,
        enum : ["user", "admin"],
        default: "user"
    },

    isVerified : {
        type: Boolean,
        default : false
    },

    verficationToken : {
        type : String
    }
})



const User = mongoose.model("User", userSchema)


export default User