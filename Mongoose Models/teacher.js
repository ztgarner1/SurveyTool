const mongoose= require("mongoose");

const teacherSchema = mongoose.Schema({
    __id: mongoose.Schema.Types.ObjectId,
    username:String,
    first:String,
    last:String,
    email:String,
    password:String,
    locked:Boolean,
    verified:Boolean,
    teaching:Array,
    confirmCode:String,
    isTeacher:Boolean,
})

module.exports= mongoose.model("Teacher",teacherSchema);