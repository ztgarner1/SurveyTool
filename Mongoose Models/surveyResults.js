const mongoose= require("mongoose");

const SurveySchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    results: Array,
    course_id:String,
})

module.exports= mongoose.model("SurveyResults",SurveySchema);
