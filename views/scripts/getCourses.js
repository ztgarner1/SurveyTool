var allCourses = document.getElementById("addCourse");
var parentDiv = document.getElementById("replace");

//fetch('http://localhost:3000')
fetch('/getCourses')
    .then(response => response.json())
    .then(data => {
        
        if(data.length == 0){
            parentDiv.innerHTML = "There are no classes yet"
        }
        else{
            allCourses.innerHTML="";
            for(let i = 0; i < data.length; i++){
                allCourses.innerHTML += "<option value = "+data[i].course_id+","+ data[i].section +">  "+data[i].course_id+"  "+data[i].section+" </option>"

            }
        }
        
        
        
    })
    .catch(error=>{
        console.log(error)
    })