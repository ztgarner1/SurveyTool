const mongoose = require("mongoose");
const courseSchema = mongoose.Schema({
    intructor:String,
    section:Number,
    semester:String,
    year:String,
    course_id: String,
    course_language:String,
    description:String,
    students:Array,
    
})

module.exports = mongoose.model("Course", courseSchema);