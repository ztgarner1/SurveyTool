var allStudents = document.getElementById("clases");
var courseData = document.getElementById("courseInfo")
var courseName = courseData.innerText.split(/ |-/)[1]
var courseSection = courseData.innerText.split(/ |-/)[2]

fetch('/getStudents/'+courseName+"&"+courseSection)
    .then(response => response.json())
    .then(data => {
        
        for(let i = 0; i < data.length; i++){
            allStudents.innerHTML += "<option value = "+data[i]._id+" > "+data[i].first+", "+data[i].last+" , "+data[i].email+" , "+data[i].studentId+" </option>"

        }
        
    })
    .catch(error=>{
        console.log(error)
    })