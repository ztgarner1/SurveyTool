const mongoose = require("mongoose");
const courseSchema = mongoose.Schema({
    course_name: String,
    course_id: Number,
    course_language:String,
    description:String,
    file:Object,
})

module.exports = mongoose.model("Course", courseSchema);