const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    first:String,
    last:String,
    email:String,
    password:String,
    locked:Boolean,
    verified: Boolean,
    courses: Array,
    confirmCode: String,
    isTeacher: Boolean,
})

module.exports = mongoose.model("User", userSchema);

