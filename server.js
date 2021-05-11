//requiring everything thats needed and setting up app.
const dotenv = require('dotenv');
dotenv.config()
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const fileUpload = require('express-fileupload')
const csv = require('csv-parser')
const fs = require('fs');
app.use(fileUpload());
const path = require('path');
var courses;
//this helps log a user out
const methodOverride = require('method-override')
//sendgrid for the mail.
//setting up the database
const mongoose = require("mongoose");
mongoose.connect("" +process.env.MONGO_ATLAS_PW+"",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true 
  });
//initializing Passport
const initializePassport = require('./passport-config');
//getting Student and Teacher Schema

const User = require('./Mongoose Models/user');
//getting the courses 
const Course = require('./Mongoose Models/course');
const SurveyResults = require('./Mongoose Models/surveyResults');
const SurveyTemplates = require('./Mongoose Models/surveyTemplate');
//calling the initializePassport function;
initializePassport(
  passport,
);
//changing the view engine to ejs so it can read my new files
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: ""+process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}))
//telling the server which files to look at
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(__dirname + "/Mongoose Models"));
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


//this is the home screen
app.get('/', (req, res) => {
  
  if(req.user == undefined){
      res.render('index.ejs',{user:null});
  }
  else{
      res.render('index.ejs', { user: req.user})
  }
})

app.get('/survey', (req, res) => {
  
  if(req.user == undefined){
      res.render('questions.ejs',{user:null});
  }
  else{
      res.render('questions.ejs', { user: req.user})
  }
})

app.get('/algtest', (req, res) => {
  
  if(req.user == undefined){
      res.render('algorithmTest.ejs',{user:null});
  }
  else{
      res.render('algorithmTest.ejs', { user: req.user})
  }
})


//server serving the login page where user cant be logged in
app.get("/login", checkNotAuthenticated, (req,res)=>{
    res.render("login.ejs");
})

//this authenticates the user if the email and password are correct.
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get("/contactImport",checkAuthenticated,(req,res)=>{
  res.render('contactImport.ejs',{ user: req.user});
})

//server serving the register page where the user cant be logged in
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs',{error: null})
})
//server getting a post request to register a new account.
app.post('/register', checkNotAuthenticated, (req, res) => {
  try {
      //initializing a boolean
      
      let emailExists = false;
      //getting all the users from the database
      if(req.body.question.toLowerCase == "no"){
        User.findOne({email:req.body.email})
        .exec()
        .then(data=>{
          if(data==null){
            //if there isnt a student with that email
            
            let code = sendMail(req.body.email, null, null);

            var student = new User({
              _id: new mongoose.Types.ObjectId(),
              username:req.body.name,
              first: "",
              last:"",
              email:req.body.email,
              password:bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(9)),
              locked:false,
              verified:false,
              courses:[],
              confirmCode:code,
              isTeacher:false,
            })

            student.save()
            .then( () => {
             //if no error occured then the user will be taken to the login page
              res.redirect('/login');
            })
            .catch(err =>{
              //if an error occured then they stay on the page but given an error message for the user to see
              res.render("register.ejs",{error: "User not added"})
            })
            
          }
          else{
            //console.log("should be here")
            res.render("register.ejs",{error: "Email already in use"});
          
          }
        })
      }
      else{
        User.findOne({email:req.body.email})
        .exec()
        .then(data=>{
          if(data==null){
            let code = sendMail(req.body.email, null, null);
            var teacher = new User({
              _id: new mongoose.Types.ObjectId(),
              username:req.body.name,
              first: "",
              last:"",
              email:req.body.email,
              password:bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(9)),
              locked:false,
              verified:false,
              courses:[],
              confirmCode:code,
              isTeacher:true,
            })

            teacher.save()
            .then( () => {
              
             //if no error occured then the user will be taken to the login page
              res.redirect('/login');
            })
            .catch(err =>{
              //if an error occured then they stay on the page but given an error message for the user to see
              res.render("register.ejs",{error: "User not added"})
            })
          }
          else{
            res.render("register.ejs",{error: "Email already in use"});
          }
        })
      }
  } catch(error) {
      console.log(error);
  }
})

//getting the post request from the profile page which means the user is updating their profile
app.post("/profile",checkAuthenticated, (req,res)=>{
  //console.log(req.user)
  //if there is a button on the page called SaveProfile which means they are in edit mode currently.
  if(req.body.SaveProfile != null){
    //console.log("In edit mode");
    //updating the user in the database
    User.updateOne({_id: req.user._id},{ first:req.body.first,last:req.body.last})
    .exec()
    .then(docs =>{
      //updating the current user logged in so the data displays right away after saving.
      req.user.first = req.body.first;
      req.user.last = req.body.last;
      res.render('profile.ejs', {user:req.user, edit: false});
    })
  }
  else{
    //the profile is not in edit mode. So they are just viewing everything they have to their account. 
    res.render('profile.ejs', {user:req.user, edit: true,language:req.body.language});
  }
})
//server serving the profile page
app.get("/profile" ,checkAuthenticated,(req,res)=>{
  
  res.render("profile.ejs",{user:req.user, edit:false})
})

//server responding to the myCourses post
app.get('/myClasses',checkAuthenticated,(req,res)=>{
  //console.log(req.user.isTeacher);
  if(req.user.isTeacher){
    res.redirect('/classesInfo');
  }
  else{
    var allCourses = [];
    
    
    if(req.user.courses.length == 0){
      res.render('myClasses.ejs',{user:req.user, courses:allCourses})
    }
    //console.log(req.user.courses.length)
    for(let i = 0; i < req.user.courses.length; i++ ){
      Course.findOne({_id:req.user.courses[i]})
      .then(courseData=>{
        //console.log("adding course")
        allCourses.push(courseData);
        if(i == req.user.courses.length -1){
        
          res.render('myClasses.ejs',{user:req.user, courses:allCourses})
        }
      })
      .catch(error =>{
        console.log("Error : " + error )
      })
      
    }
  }
  
})
app.post('/myClasses', checkAuthenticated,(req,res)=>{
  if(req.user.verified == false){
    sendMail(req.user.email,req.user, null);
  }
  else{

    Course.findOne({_id:req.body.classes})
    .then(classData =>{
      res.redirect("/viewCourse/"+classData._id)
    })
    .catch(error=>{
      console.log("ERROR: " + error)
    })
  }
})

app.get("/viewCourse/:variable",checkAuthenticated,(req,res) =>{
  var allSurveys = [];
  
  Course.findOne({_id: req.params.variable})
  .exec()
  .then(classData =>{
    if(classData.surveys.length == 0){
      res.render("viewCourse.ejs",{user:req.user, course:classData,surveys:allSurveys, error: null});
    }
    //console.log("Survey number is >> "+ classData.surveys.length)
    for(let i = 0; i < classData.surveys.length;i++){
      SurveyTemplates.findOne({_id:classData.surveys[i]})
      .exec()
      .then(surveyData=>{
        
        allSurveys.push(surveyData);
        if(i == classData.surveys.length -1){
          //console.log(allSurveys.length)
          res.render("viewCourse.ejs",{user:req.user, course:classData,surveys:allSurveys, error: null});
        }
      })
      .catch(error =>{
        console.log(error)
      })
    }
    
  })
  .catch(error =>{
    console.log("Error : "+error);
  })
})

app.post("/viewCourse/:variable",checkAuthenticated, (req,res)=>{
  SurveyTemplates.findOne({_id:req.body.survey})
  .then(surveyData=>{
    //res.render("studentSurvey.ejs",{user:req.user,error:null, survey:surveyData});
    res.redirect("/studentSurvey/"+surveyData.id)
  })
  .catch(error=>{
    res.redirect("/classesInfo");
  })
})

app.get("/studentSurvey/:variable",checkAuthenticated,(req,res)=>{
    surveyTemplate.findOne({_id:req.params.variable})
    .exec()
    .then(surveyData =>{
      res.render("studentSurvey.ejs",{user:req.user, survey:surveyData})
    })
    .catch(error=>{
      res.redirect("/");
    })
})
app.post("/studentSurvey/:course_id&:survey_id",checkAuthenticated,(req,res)=>{
  User.findOne({_id:req.user._id})
  .then(studentData=>{
    //console.log(studentData.takenSurveys)
    if(studentData.takenSurveys != null || studentData.takenSurveys != undefined || studentData.takenSurveys.length == 0){
      User.updateOne({_id:studentData._id},{$push:{takenSurveys:req.params.survey_id}})
      .catch(error=>{
        //req.user.takenSurveys.push(req.params.survey_id);
        console.log(error);
      })
    }
    else{
      var temp = [];
      temp.push(req.params.survey_id)
      req.user.takenSurveys = temp;
      User.updateOne({_id:studentData._id},{takenSurveys:temp})
      .catch(error=>{
        console.log(error);
      })
    }
  })
  .catch(error=>{
    console.log(error);
  })
  
  //varible will be the course_id
  var student = {};
  var results = [];
  var schedule = [];
  var check = false;
  student._id = req.user._id;
  for( let i in req.body){ 
    //console.log(i)
    if(i.includes("schedule")){
      
      check = true;
      schedule.push(i);
    }
    else{
      check = false;
      results.push(req.body[i]);
    }
    
  }
  if(check){
    results.push(schedule);
  }
  student.results = results;
  //console.log(results);
  
  
  SurveyResults.findOne({survey_id:req.params.survey_id})
  .exec()
  .then(survey=>{
    if(survey == null){
      //then we need to create a survey Results here
      var settUp = [];
      settUp.push(student);
      var results = SurveyResults({
        _id: new mongoose.Types.ObjectId(),
        results:settUp,
        course_id:req.params.course_id,
        survey_id:req.params.survey_id,
      })
      results.save()
      .then(()=>{
        //console.log("saved into database")
        res.redirect("/myClasses");
      })
      .catch(error=>{
        console.log("ERROR in student survey post >> " + error);
      })
    }
    else{
      SurveyResults.updateOne({survey_id:survey.survey_id},{$push:{results:student}})
      .then(()=>{
        //console.log("added to the database")
        res.redirect("/myClasses");
      })
      .catch(error=>{
        console.log(error)
      })
    }
  })
  .catch(error=>{
    console.log(error)
  })

  res.redirect("/myClasses");
  
})

app.get('/createSurvey/:variable',checkAuthenticated, (req, res) => {
  var check;
  
  Course.findOne({_id: req.params.variable})
  .exec()
  .then(courseData =>{
    if(courseData != null){
      res.render('createSurvey.ejs',{user:req.user,course:courseData});
    }
    
  })
  .catch(error=>{
    console.log("ERROR in get (createSurvey): " + error);
  })
  
})

app.post('/createSurvey/:course_id',(req,res)=>{
  
	var questionsArray = [];
  var tempSchedule= [];
	var weight = 0;
	var count = 0;
	
	var questionObj = {
		ask: "",
		type: "",
		answers: "",
		weight: 0
	};
	
	for (c in req.body) {
		
		if (count == 0 || count == 1) {
			count++;
			continue;
		}
		//console.log(req.body[c]);
		if ((count % 4) == 2) {
			questionObj.ask = req.body[c];
		} else if ((count % 4) == 3) {
			questionObj.type = req.body[c];
		} else if ((count % 4) == 0) {
			questionObj.answers = req.body[c];
		} else if ((count % 4) == 1) {
			questionObj.weight = req.body[c];
      if(questionObj.type=="schedule"){
        tempSchedule.push(questionObj);
      }
      else{
        questionsArray.push(questionObj);
      }
			
			questionObj = {
				ask: "",
				type: "",
				answers: "",
				weight: 0
			};
		}
		count++;
	}
  for(let i = 0; i < tempSchedule.length; i++){
    questionsArray.push(tempSchedule[i]);
  }
  
	
	SurveyTemplates.findOne({title:req.body.surveyTitle,course_id:req.params.course_id})
  .then(data=>{
    if(data == null) {
      var template = new SurveyTemplates({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.surveyTitle,
        questions: questionsArray,
        course_id: req.params.course_id ,
      })
      template.save()
      .then(check=>{
        res.redirect('/classesInfo');
      }).catch(()=>{
        res.redirect('/classesInfo');
      })
      var string = req.body.courseName.split(",");
      Course.updateOne({course_id:string[0],section:string[1]},{$push:{surveys:template._id}})
      .catch(error=>{
        console.log("ERROR in post(createSurvey) >>" + error);
      })
    }
  })
	
})

//renders the addClasses.ejs page
app.get('/addClasses',checkAuthenticated,(req,res)=>{
  res.render('addClasses.ejs',{user: req.user})
})

/**
 * this will be called whenever a post method is made to /addClasses
 */
app.post('/addClasses',(req,res)=>{
  var courseData = null;
  Course.findOne({course_id:req.body.courseId,section:req.body.courseSection})
  .then(data=>{
    if(data == null){
      var course = new Course({
        _id: new mongoose.Types.ObjectId(),
        intructor : req.user._id,
        section: req.body.courseSection,
        course_id: req.body.courseId,
        description:req.body.courseDesc,
        students:results,
        groups:[],
      })
      courseData = course;
      course.save()
      
      .then(check =>{
        req.user.courses.push(course._id);
        User.updateOne({_id:req.user._id},{$push:{courses:course._id}})
        .exec()
        .then(()=>{
          //console.log("updated Teacher")
        })
      })
      //adding the course to the teachers teaching array
    }
    else{
      
      res.redirect('/classesInfo');
    }
  })
  if(req.files){
    var file = req.files.fileName,
     filename = file.name
    var results = [];
  
    var moveAndParse =   function(callback){
      file.mv(__dirname + "/views/uploads/"+filename, err =>{
        //console.log(err)
        if(err){
          console.log(err);
          //res.send("error occured" + err);
        }
      })
      callback()
    }
    moveAndParse(  function(){
      fs.createReadStream(__dirname +'/views/uploads/'+filename)
      .pipe(csv({}))
      .on("data", (data) => {
        User.findOne({email:data.email})
        .then(tempStudent=>{
          if(tempStudent== null){
            //send student email later
            const slash = /\//gi;
            const period =/\./gi;
            //create String for the link
            var randomString = bcrypt.hashSync(""+data.first[0]+data.last+"", bcrypt.genSaltSync(9));
            randomString = randomString.replace(slash,"");
            randomString = randomString.replace(period,"");
            //create temp password
            var password = bcrypt.hashSync(""+data.first[0]+data.last+"", bcrypt.genSaltSync(6));
            password = password.replace(slash,"");
            password = password.replace(slash,"");
            var confirmCode = sendMail(data.email,null,password) 
            //create temp password for student
            var courseArray =[];
            var student = new User({
              _id: mongoose.Types.ObjectId(),
              username: ""+data.first[0]+data.last+"",
              first: data.first,
              last: data.last,
              email: data.email,
              password: password,
              locked: false,
              verified:false,
              courses: courseArray,
              confirmCode: confirmCode,
              isTeacher:false,
              studentId: data.id,
            })
            student.save()
            .then(check=>{

              Course.updateOne({_id:courseData._id},{$push:{students:student._id}})
              .exec()
              .then(()=>{
                console.log("Updating with student")
              })
              .catch(error=>{
                console.log(error)
              })
              
            })
            .catch(error =>{
              console.log("Did not add to database")
            })
          }
          else{
            console.log("adding student that already exists in database")

            Course.updateOne({_id:courseData._id},{$push:{students:tempStudent._id}})
            .catch(error =>{
              console.log(error);
            })
            User.updateOne({_id:tempStudent._id},{$push:{courses:courseData._id}})
            .catch(error =>{
              console.log(error);
            })

          }
        })
        //console.log("test is >> \n" + test);
      })
      .on("end",() =>{
        res.redirect('/classesInfo')
      })
    })

  }
  else{
    //console.log("did not work")
  }
})

/**
 * This will call when a user goes to classesInfo page. This page is only for teachers
 * if the user is not a teacher they get redirected to /myClasses
 */
app.get("/classesInfo",checkAuthenticated,(req,res)=>{
  if(req.user.isTeacher){
    var courses = [];
    
    Course.find({intructor:req.user.id})
    .exec() 
    .then(data=>{
      if(data != null){
        res.render('classesInfo.ejs', {user: req.user,courses:data, error: null});
      }
    })
    .catch(error=>{
      console.log(error);
    })
  }
  else{
    res.redirect('/myClasses');
  }
})
/**
 * this post method gets what class is chosen to edit 
 */
app.post('/classesInfo',checkAuthenticated, (req,res)=>{
  //console.log(req.body.classes);
  if(req.body.classes == undefined){
    Course.find({intructor:req.user.id})
    .then(data=>{
      if(data != null){
        
        res.render('classesInfo.ejs', {user: req.user,courses:data, error: null});
      }
    })
    .catch(error=>{
      console.log(error);
    })
    res.redirect('/classesInfo');
  }
  else{
    var result = req.body.classes.split(",");
    
    res.redirect("/editCourse/"+result[0]+"&"+result[1])
    
  }
})

app.get("/editCourse/:course_id&:section",checkAuthenticated,(req,res)=>{
  //console.log(req.params.course_id)
  //console.log(req.params.section)
  
  var students = [];
  Course.findOne({course_id:req.params.course_id, section:req.params.section})
  .then(courseData=>{
    
    for(let i = 0; i < courseData.students.length; i++){
      User.findOne({_id:courseData.students[i]})
      .then(studentObj =>{
        //go through and grab the data for each student in the course
        students.push(studentObj);
        
      })
      .catch(error=>{
        console.log(error);
      })
      
    }
    var surveys = [];
    if(courseData.surveys.length == 0){
      res.render('editCourse.ejs', {user: req.user, students:students,course: courseData,surveys:surveys, error: null});
    }
    else{
      //console.log(courseData.surveys.length)
      for(let i = 0; i < courseData.surveys.length; i++){
        SurveyTemplates.findOne({_id:courseData.surveys[i]})
        .then(surveyData =>{
          surveys.push(surveyData);
          if(i == courseData.surveys.length -1){
            //console.log("Student data length is >> ")
            //console.log(students.length)
            res.render('editCourse.ejs', {user: req.user, students:students,course: courseData,surveys:surveys, error: null});
          }
        })
          
      }
    }
  })
  .catch(error=>{
    console.log(error);
  })

  
})
/**
 * 
 */
app.post("/editCourse",checkAuthenticated,(req,res)=>{
  var courseData = null;
  var courseName = req.body.courseName.split(",");
  var courseObjectID;
  Course.findOne({course_id:courseName[0],section:courseName[1]})
  .exec()
  .then(data=>{
    courseObjectID = data._id;
  })
  .catch(error=>{
    console.log("ERROR " + error);
  })
  
  res.redirect('/group/:'+courseName[0]+"&:") 

})

app.get("/group/:courseName&:section",checkAuthenticated,(req,res)=>{
  var courseData = null;
 
  Course.findOne({course_id:req.params.courseName,section:req.params.section})
  .then(courseData=>{
    if(courseData != null){
      
      //console.log(courseData[groups])
      


      var completeGroups = [];
      
      if(courseData.groups != undefined){
        for(let i = 0; i < courseData.groups.length; i++){
          completeGroups[i] = [];
        }
      
        for(let i = 0; i < courseData.groups.length;i++){
          for(let j = 0; j < courseData.groups[i].length; j++){
            User.findOne({_id:courseData.groups[i][j]})
            .then(studentData=>{
              var studObj = {};
              studObj.first = studentData.first;
              studObj.last = studentData.last;
              completeGroups[i].push(studObj);
              if(j == courseData.groups[0].length -1 && i ==courseData.groups.length-1){
                res.status(200)
                //console.log(completeGroups)
                res.send(completeGroups)
              }
            })
            .catch(error=>{
              console.log()
            })
          }
        }
      }
      else{
        res.status(404)
        res.send()
      }
      
      
      

      
      //console.log(completeGroups)
      //res.status(200)
      //res.send(completeGroups)
    }
    
  })
  .catch(error=>{
    console.log("ERROR : "+error)
  })
  
})

//this is the confirmation the email sent to the user gets sent to. 
//checking to see if the code passed through as :variable is the same verification code
//on the users account. if it is the same then the users verified boolean turns to true.
app.get('/confirm/:variable',checkNotAuthenticated,(req,res)=>{
  //console.log("Made it here");
  const confirmCode = req.params.variable;

  User.updateOne({confirmCode:confirmCode},{verified:true})
  .exec()
  .then(docs =>{
    if(req.user!=null){
      req.user.verified = true;
    }
    res.redirect("/");
  })
        
})

app.get("/setPassword/:variable",checkNotAuthenticated,(req,res)=>{
  //console.log(req.params.variable)
  User.findOne({temporaryPassword:req.params.variable})
  .then(data=>{
    
    res.render('setPassword.ejs',{user:data,error:null})
  })
     
})
app.post("/setPassword/:variable",checkNotAuthenticated,(req,res)=>{
  if(req.body.firstPassword == req.body.secondPassword){

    User.updateOne({temporaryPassword:req.params.variable},{password:bcrypt.hashSync(req.body.firstPassword, bcrypt.genSaltSync(9)),temporaryPassword:""})
    .then(()=>{
      //console.log("Added new password")
      res.redirect('/login');
    })

  }
  else{
    User.findOne({temporaryPassword:req.params.variable})
    .then(data=>{
      res.render('setPassword.ejs',{user:data, error:"Passwords do not match"});
    })
    
  }
  
})

//if the user has forgotten their password
app.get("/resetPassword",checkNotAuthenticated,(req,res)=>{
  res.render('resetPassword.ejs',{user:null,error:null})

})

app.post("/resetPassword",checkNotAuthenticated,(req,res)=>{
  
  var to = req.body.email;
  var user;
  User.findOne({email:to})
  .exec()
  .then((data)=>{
    user = data;
    console.log("successful")
    var randomString;
    const slash = /\//gi;
    const period =/\./gi
    randomString = bcrypt.hashSync(to, bcrypt.genSaltSync(9));
    randomString = randomString.replace(slash,"");
    randomString = randomString.replace(period,"");
    User.updateOne({_id: data._id},{temporaryPassword: randomString})
    .exec()
    .then(()=>{
      //console.log("assigned temporaryPassword")
      sendResetPassword(to, data._id,randomString)
    })
    .catch(error=>{
      //console.log("failed to assign temporaryPassword")
    })
    
  })
  .catch(error=>{
    console.log(error)
  })
  
  res.render('resetPassword.ejs',{user:null,error:"Password Successfully changed, Please check your email"})
})
app.get("/getGroups/:courseName&:courseSection",(req,res)=>{
  
  
})

//logs the user out and redirects them to the home page
app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/')
})
//checks to see if the user is Authenticated or not
function checkAuthenticated(req, res, next) {
  
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect("/");
  
}
//checks to see if the user is not authenitcated 
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

//mailing info
const sgMail = require("@sendgrid/mail");
const user = require('./Mongoose Models/user');
const surveyTemplate = require('./Mongoose Models/surveyTemplate');
const { exec, execSync } = require('child_process');
const { group } = require('console');
const { exit } = require('process');
const { json } = require('body-parser');
const course = require('./Mongoose Models/course');
const { SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG } = require('constants');
sgMail.setApiKey(''+process.env.SENDGRID_PW+'');


//a function that sends a email the a checks to see if this is from register or resending an email
//in order to see if we need to go to the Users account to get the confirmation code to resend
// or create a new one(if user == null)
function sendMail(to,user,tempPassword){
  let randomString;
  if(user == null){
    const slash = /\//gi;
    const period =/\./gi
    randomString = bcrypt.hashSync(to, bcrypt.genSaltSync(9));
    randomString = randomString.replace(slash,"");
    randomString = randomString.replace(period,"");
  }
  else{
    //console.log("getting from user")
    randomString = user.confirmCode;
  }
  let link = "https://wcu-surveytool.herokuapp.com/confirm/" + randomString;
  //let link = "http://localhost:3000/confirm/" + randomString;
  //console.log(link);
  
  var msg = {
    to: to,
    from:"wcu.SurveyTool@gmail.com",
    subject: "Confirmation",
    text: "Hello,\nYou are recieving this email because you have been registered " + 
    "for wcu-surveytool website.\n\n" +
    "Please verify your email address using this link below "+ link +
    "\n\n--WCU-SurveyTool"
  }
  if(tempPassword != null){
    msg = {
      to: to,
      from: "wcu.SurveyTool@gmail.com",
      subject: "Confirmtion",
      text: "Hello,\nYou are recieving this email because you have been registered " + 
      "for wcu-surveytool website.\n\n" +
      "Your tempary password has been set to: "+ tempPassword + "\n" + 
      "Please verify your email address using this link below "+ link +
      "\n\n--WCU-SurveyTool"
    }
  }
  sgMail.send(msg)
  .then(()=>{
    console.log("Email sent")
  })
  .catch(error=>{
    console.log(error);
  })
  if(user == null){
    return randomString;
  }
}

 function searchForSurvey(id,groupsize){
  var survey_id;
  var studentsResults;
  //goes and grabs the surveyResults from the database
  SurveyResults.findOne({_id:id})
  .exec()
  .then(allResults =>{
    studentsResults = allResults.results
    survey_id = allResults.survey_id
    //grabs the surveyTemplate from the database
    SurveyTemplates.findOne({_id:survey_id})
    .exec()
    .then(surveyObj =>{
      //console.log("here first")
      makesTeam(studentsResults,surveyObj,groupsize,allResults.course_id)
    })
    .catch(error=>{
      console.log(error);
    })
  })
  .catch(error =>{
    console.log(error)
  })
  
}

function makesTeam(studentsResults, survey, groupsize,course_id){
  
  var added = {};
  var maxScore = 0;
  var objcompare = {};
  for(let i = 0; i < studentsResults.length; i++){
    //now go through all the students comparing them to each other.
    
    var firstStudent = studentsResults[i];
    objcompare[firstStudent._id] = [];
    //console.log(firstStudent);
    for(let j = 0; j < studentsResults.length; j++){
      var secondStudent = studentsResults[j];
      if(firstStudent._id == secondStudent._id){
        continue;
      }
      //now go through all the answers for each student
      var score = 0;
      for(let k = 0; k < survey.questions.length; k++){
        if(Array.isArray(firstStudent.results[k])){
          let arrayScore = 0;
          for(let m = 0; m < firstStudent.results[k].length; m++){
            for(let n = 0; n < secondStudent.results[k].length; n++){
              if(firstStudent.results[k][m] === secondStudent.results[k][n]){
                arrayScore++;
              }
            }
          }
          //making the weight 
          score+= arrayScore * (survey.questions[k].weight/5 );
          
        }
        else if(firstStudent.results[k] == secondStudent.results[k]){
          //adding another similarity
          score+= 1 * (survey.questions[k].weight/5); 
        }
      }
      //adds one way

      objInner = {};
      objInner[secondStudent._id]=false;
      objInner.score = score;
      
      let h = j;
      let location = 0;
      //checks to see if objcompare[firstStudent._id]'s array is empty
      //checks to see where to place the the objInner. this is so that the highest score will be at objcompare[firstStudent._id][0]
      if(objcompare[firstStudent._id] != undefined && !objcompare[firstStudent._id].includes(objInner)){
        while(objcompare[firstStudent._id][location]!= undefined && objInner.score < objcompare[firstStudent._id][location].score){
          location++;
        }
        //assigning into location where objInner score needs to be.
        objcompare[firstStudent._id].splice(location,0,objInner);
      }
      else{
        objcompare[firstStudent._id] = [];
      }
      
      if(!objcompare[firstStudent._id].includes(objInner)){
        added[firstStudent._id]= true;
        objcompare[firstStudent._id].push(objInner)
      }
      
    }
    if(i == studentsResults.length -1){
      //console.log(objcompare)
      makeBestTeams(objcompare,groupsize,studentsResults.length,course_id)
    }
  }

}

function makeBestTeams(tempTeams,groupSize,resultsSize,course_id){
  //console.log(tempTeams);
  
  check = false;
  if(resultsSize % groupSize  == 0){
    check == true;
  }
  else{
    while(resultsSize % groupSize != 0){
       groupSize--;
    }
    //console.log("now it will work >>" + groupSize)
  }
  
  
  var groupNumber = (resultsSize / groupSize);
  //console.log(groupNumber)
  var completeTeams = [];
  var added = {};
  //console.log(Object.keys(tempTeams).length)
  //start adding them into groups
  for(let i = 0; i < groupNumber; i++){
    let j = 0;
    var smallerTeams = [];
    var current = Object.keys(tempTeams)[0]
    //goes through until it reaches the groupsize
    while(j < groupSize){
      
      //checking to see if current has already been added to a group
      if(added[current] != true){
        added[current]= true;
        smallerTeams.push(tempTeams[current][0])
      }
      else{
        
        //this while loop is finding the next location in the array of choses
        while(added[Object.keys(tempTeams[current][0])[0]] == true){
          //shifts so that the first one
          tempTeams[current].shift();
        }
        //adds the student_id to the added to check later
        added[Object.keys(tempTeams[current][0])[0]] = true;
        //pushes the student object to the smallerTeams 
        smallerTeams.push(tempTeams[current][0])
      }
      
      //sets the current to the next one to continue
      current = Object.keys(tempTeams[current][0])[0]
      j++;
    }
    completeTeams.push(smallerTeams); 
  }
  sendGroupData(completeTeams,course_id);
}

function sendGroupData(completeTeams,course_id){
  
  console.log(completeTeams)
  //going through the each team and each subset
  var finalGroups = [];
  for(let i = 0; i < completeTeams.length; i++){
    var smallerGroups = [];
    for(let j = 0; j < completeTeams[i].length; j++){
      
      smallerGroups.push(Object.keys(completeTeams[i][j])[0])
    }
    finalGroups.push(smallerGroups)
  }
  var final
  //console.log(finalGroups)
  
  console.log(course_id)
  Course.updateOne({_id:course_id},{groups:finalGroups})
  .then(()=>{
    console.log("updated")
  })
  .catch(error=>{
    console.log("did not update")
  })
  
  /*
  User.findOne({_id:Object.keys(completeTeams[i][j])[0]})
  .then(studentData=>{
    console.log("Group " +(i+1) +":")
    console.log(studentData.first + ", " + studentData.last )
    console.log("\n")
  })
  .catch(error=>{
    console.log(error)
  })
  */
  
}


function messageToSend(to,message,sub){
  const msg = {
    to: to,
    from: "wcu.SurveyTool@gmail.com",
    subject: sub,
    text: message
  }
  sgMail.send(msg)
  .then(()=>{
    console.log("Email sent")
    return true;
  })
  .catch(error=>{
    console.log(error);
    return false;
  })
}


function sendResetPassword(to, id,string){

  let link = "https://wcu-surveytool.herokuapp.com/setPassword/" + string ;
  //let link = "http://localhost:3000/confirm/" + randomString;
  //console.log(link);
  
  const msg = {
    to: to,
    from:"wcu.SurveyTool@gmail.com",
    subject: "Password Reset",
    text: "Hello,\nYou are recieving this email because you have requested a password reset " + 
    "for wcu-surveytool website.\n\n" +
    "\nLogin with this your new password here:\t" +link +
    "\n\n--WCU-SurveyTool"
  }
  
  sgMail.send(msg)
  .then(()=>{
    console.log("Email sent")
    return true;
  })
  .catch(error=>{
    console.log(error);
    return false;
  })
}

var deleteAllClasses = function(){
  Course.find()
  .then(data=>{
    for(let i = 0; i < data.length; i++){
      Course.deleteOne({course_id:data[i].course_id})
      .then(data1=>{
        if(data1 != null){
          console.log("deleted")
        }
        
      })
    }
    
  })
}
var deleteEveryonesCourses = function(){
  User.find()
  .then(data=>{
    for(let i = 0; i < data.length; i++){
      User.updateOne({_id:data[i]._id},{courses:[]})
      .then(result=>{
        console.log("deleted >> "+ i);
      })
    }
  })
}

var deleteAllStudents = function(){
  User.deleteMany({isTeacher:false})
  .then(data=>{
    console.log(data);
  })
  .catch(error=>{
    console.log(error)
  })
}

function addStudentsFromFile(){
  var filename = "Example_Survey_Data.csv";
  var results = []
  fs.createReadStream(__dirname +'/views/Example_Survey_Data.csv')
  .pipe(csv({}))
  .on("data", (data) => {
    console.log(data);
    results.push(data);
  })
  .on("end",() =>{
    for(let i = 0; i < results.length; i++){
      console.log(results[i])
      User.findOne({email:results[i].Email})
      .then(studentData =>{
        if(i != 0){
          var objResults = {}
          var arrResults = [];
          objResults._id = studentData._id;
          //populate arrResults
          arrResults.push(results[i][0])
          arrResults.push(results[i][1])
          arrResults.push(results[i][2])
          console.log(arrResults)
          objResults.results = arrResults;
          console.log(objResults)
          SurveyResults.updateOne({_id:"60938cb5bd111245a8984cdb"},{$push:{results:objResults}})
          .then(()=>{
            //console.log("made it")
          })
        }
        
        //
      })
      
    }
  })


}

//searchForSurvey("60938cb5bd111245a8984cdb",3) 
//addStudentsFromFile()

//deleteAllStudents();
//deleteAllClasses();
//deleteEveryonesCourses()

//makes sure the server is listening on a specified port number. 
app.listen(process.env.PORT || 3000)
