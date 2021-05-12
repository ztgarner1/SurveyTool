var allCourses = document.getElementById("addCourse");
var courseData = document.getElementById("courseInfo");
var parentDiv = document.getElementById("replace");


fetch('/getCourses')
    .then(response => response.json())
    .then(data => {
        //console.log(data)
        if(data.length == 0){
            parentDiv.innerHTML = "There are no classes yet"
        }
        else{
            allCourses.innerHTML="";
            for(let i = 0; i < data.length; i++){
                if(data[i].surveys.length==0){
                    allCourses.innerHTML += "<option value = "+data[i]._id+">  "+data[i].course_id+"  "
                    +data[i].section+", No Surveys Yet </option>"

                }
                else{
                    allCourses.innerHTML += "<option value =  "+data[i]._id+">  "+data[i].course_id+"  "
                    +data[i].section+", Surveys Available </option>"
                }

            }
        }
        
        
        
    })
    .catch(error=>{
        console.log(error)
    })