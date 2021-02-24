const mongoose= require("mongoose");

const studentSchema = mongoose.Schema({
    __id: Number,
    username:String,
    first:String,
    last:String,
    email:String,
    password:String,
    locked:Boolean,
    verified:Boolean,
    Enrolled:Array,
    confirmCode:String,
    isTeacher:Boolean,
})

module.exports= mongoose.model("Student",studentSchema);