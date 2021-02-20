
//var fileName = "./addEnrollments.txt";
//getting the classes
//const course = require("../../Enrolment_Materials/Course");
//const progress = require("../../Enrolment_Materials//progress");
//const enrollement = require("../../Enrolment_Materials/Enrollment");
//getting the div class
const addingTo = document.getElementById("addingItems");
//setting up buttons
const addCourseButton = document.getElementById("addCourse");
const addTutButton = document.getElementById("addTut");
const addQuiz = document.getElementById
const addProgramTaskButton = document.getElementById("");
var space;
addCourseButton.addEventListener("click", ()=>{
    
    addingTo.innerHTML= ""+
    "<form action='/addClasses' method ='POST' name = 'addCourse'>"+
        "<div class = 'w3-row'>"+
            "<input placeholder='Enter name of course' name='courseName'></div>"+
        "<div class = 'w3-row'>"+
            "<input placeholder='Enter Language of course' name='courseLanguage'></div>"+
        "<div class = 'w3-row' >"+
            "<input placeholder='Enter description of course' name='courseDesc'style = width:50%,height: 25%;></div>"+
        "<div class = 'w3-row' >"+
            "<input placeholder='Enter description of course' type = 'file' name='courseDesc'style = width:50%,height: 25%;></div>"+
        "<div class = 'w3-row'>"+
            "<button type = 'submit'>Add Class</button></div>"+
    "</form>"
    space= document.getElementById("largeSpace");
    space.style = "style = width:50%,height: 25%;"
    
})
/*
addTutButton.addEventListener("click"()=>{
    addingTo.innerHTML=""
})
*/
function writeToFile(msg){

}