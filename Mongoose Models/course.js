const mongoose = require("mongoose");
const courseSchema = mongoose.Schema({
    intructor:String,
    section:Number,
    course_id: String,
    course_language:String,
    description:String,
    students:Array,
    
})

module.exports = mongoose.model("Course", courseSchema);