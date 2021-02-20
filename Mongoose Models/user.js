const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    __id: mongoose.Schema.Types.ObjectId,
    name: String,
    first:String,
    last:String,
    email:String,
    password:String,
    locked:Boolean,
    verified: Boolean,
    Enrolled: Array,
    confirmCode: String,
    isTeacher: Boolean,
})

module.exports = mongoose.model("User", userSchema);

