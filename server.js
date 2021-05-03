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
app.use(express.static(__dirname + "/views"));
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

app.get('/createSurvey', (req, res) => {
  
  if(req.user == undefined){
      res.render('createSurvey.ejs',{user:null});
  }
  else{
      res.render('createSurvey.ejs', { user: req.user})
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
app.post('/register', checkNotAuthenticated, async (req, res) => {
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
  console.log(req.user.isTeacher);
  if(req.user.isTeacher){
    res.redirect('/classesInfo');
  }
  else{
    var allCourses = [];
    
    
    if(req.user.courses.length == 0){
      res.render('myClasses.ejs',{user:req.user, courses:allCourses})
    }
    console.log(req.user.courses.length)
    for(let i = 0; i < req.user.courses.length; i++ ){
      Course.findOne({_id:req.user.courses[i]})
      .then(courseData=>{
        console.log("adding course")
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

app.get("/viewCourse/:variable",(req,res) =>{
  var allSurveys = [];
  Course.findOne({_id: req.params.variable})
  .then(classData =>{
    if(classData.surveys.length == 0){
      res.render("viewCourse.ejs",{user:req.user, course:classData,surveys:allSurveys, error: null});
    }
    for(let i = 0; i < classData.surveys.length;i++){
      SurveyTemplates.findOne({_id:classData.surveys[i]})
      .then(surveyData=>{
        allSurveys.push(surveyData);
        if(i == classData.surveys.length -1){
          res.render("viewCourse.ejs",{user:req.user, course:classData,surveys:allSurveys, error: null});
        }
      })
      .catch()
      
    }
    
  })
  .catch(error =>{
    console.log("Error : "+error);
  })
})


app.post('/createSurvey',(req,res)=>{
	var questionsArray = [];
	var weight = 0;
	var count = 0;
	
	var questionObj = {
		ask: "",
		type: "",
		answers: "",
		weight: 0
	};
	
	for (c in req.body) {
		
		if (count == 0) {
			count++;
			continue;
		}
		console.log(req.body[c]);
		if ((count % 4) == 1) {
			questionObj.ask = req.body[c];
		} else if ((count % 4) == 2) {
			questionObj.type = req.body[c];
		} else if ((count % 4) == 3) {
			questionObj.answers = req.body[c];
		} else if ((count % 4) == 0) {
			questionObj.weight = req.body[c];
			questionsArray.push(questionObj);
			questionObj = {
				ask: "",
				type: "",
				answers: "",
				weight: 0
			};
		}
		count++;
	}
	
	SurveyTemplates.findOne({title:req.body.surveyTitle})
		.then(data=>{
			if (data == null) {
				var template = new SurveyTemplates({
					_id: new mongoose.Types.ObjectId(),
					title: req.body.surveyTitle,
					questions: questionsArray,
				})
				template.save()
					.then(check=>{
						res.redirect('/createSurvey');
					}).catch(()=>{
						res.redirect('/createSurvey');
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
        .then(()=>{
          console.log("updated Teacher")
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
  
    var moveAndParse = function(callback){
      file.mv(__dirname + "/views/uploads/"+filename, err =>{
        console.log(err)
        if(err){
          console.log(err);
          //res.send("error occured" + err);
        }
      })
      callback()
    }
    moveAndParse( function(){
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
            var courseArray = [];
            if(courseData != null){
              courseArray.push(courseData._id);
            }
            
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
            //console.log("adding student that already exists in database")

            Course.updateOne({_id:courseArray._id},{$push:{students:tempStudent._id}});
            User.updateOne({_id:tempStudent._id},{$push:{courses:courseArray._id}})

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
    console.log("did not work")
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
app.post('/classesInfo',checkAuthenticated,(req,res)=>{
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
    var course = null; 
    
    
    Course.findOne({course_id:result[0],section:result[1]})
    .exec()
    .then(data=>{
      course= data;
      //console.log(data);
      var students = [];
      for(let i= 0; i < data.students.length;i++){
        User.findOne({_id:data.students[i]})
        .exec()
        .then(student=>{
          
          students.push(student);
          //console.log("adding student")
          if(i == data.students.length-1){
            res.render('editCourse.ejs', {user: req.user, students:students,course: course, error: null});
          }
        })
        
      }
    
    })
    
  }
})
/**
 * 
 */
app.post("/editCourse",(req,res)=>{
  var courseData = null;
  var courseName = req.body.courseName.split(",");
  var courseObjectID;
  Course.findOne({course_id:courseName[0],section:courseName[1]})
  .then(data=>{
    courseObjectID = data._id;
  })
  .catch(error=>{
    console.log("ERROR " + error);
  })
  if(req.files){
    var file = req.files.fileName,
     filename = file.name
    var results = [];
  
    var moveAndParse = function(callback){
      file.mv(__dirname + "/views/uploads/"+filename, err =>{
        console.log(err)
        if(err){
          console.log(err);
          //res.send("error occured" + err);
        }
      })
      callback()
    }
    moveAndParse( function(){
      fs.createReadStream(__dirname +'/views/uploads/'+filename)
      .pipe(csv({}))
      .on("data", (data) => {
        User.findOne({email:data.email})
        .then(tempStudent=>{
          var object = {};
          if(tempStudent== null){
            //send student email later
            const slash = /\//gi;
            const period =/\./gi;
            //create String for the link
            var wholeName = data.Name.split(', ');
            var randomString = bcrypt.hashSync(""+wholeName[0]+wholeName[1]+"", bcrypt.genSaltSync(9));
            randomString = randomString.replace(slash,"");
            randomString = randomString.replace(period,"");
            //create temp password
            var password = bcrypt.hashSync(""+wholeName[0]+wholeName[1]+"", bcrypt.genSaltSync(6));
            password = password.replace(slash,"");
            password = password.replace(slash,"");
            //var confirmCode = sendMail(data.email,null,password) 
            //create temp password for student
            var courseArray = [];
            if(courseData != null){
              courseArray.push(courseData._id);
            }
            
            var student = new User({
              _id: mongoose.Types.ObjectId(),
              username: ""+data.Name[0]+wholeName[0]+"",
              first: data.first,
              last: data.last,
              email: data.email,
              password: password,
              locked: false,
              verified:false,
              courses: courseArray,
              confirmCode: randomString,
              isTeacher:false,
              studentId: data.id,
            })
            student.save()
            .then(check=>{
              
              Course.updateOne({_id:courseData._id},{$push:{students:student._id}})
              .then(()=>{
                //console.log("Updating with student")
              })
              .catch(error=>{
                console.log(error)
              })
              
            })
            .catch(error =>{
              //console.log("Did not add to database")
            })
            object.student_id = student._id;
            for(let i in data){
              //Name,Student ID,Email
              //console.log(i);
              if(i != "Name"||i!="Student ID"|| i!="Email"){
                object[i] = data[i];
              }
            }
            results.push(object);
          }
          else{
            //student existed in the database
            object.student_id = tempStudent._id;
            for(let i in data){
              //Name,Student ID,Email
              //console.log(i);
              if(i != "Name"||i!="Student ID"|| i!="Email"){
                object[i]= data[i];
              }
            }
            results.push(object);
            var check = true;
            //checking to see if the user has already been put in the course
            for(let i = 0; i<tempStudent.courses.length; i++){
              if(tempStudent.courses[i] == courseObjectID){
                check = false;
                break;
              }
            }
            if(check){
              Course.updateOne({_id:courseArray._id},{$push:{students:tempStudent._id}});
            }
          }
        })
        //console.log("test is >> \n" + test);
      })
      .on("end",() =>{
        console.log(results.length);
        var surveyResults = new SurveyResults({
          _id: mongoose.Types.ObjectId(),
          results:results,
          course_id:courseObjectID, 
        })
        surveyResults.save()
        .then(comfirm =>{
          console.log("saved surveyResults into database")
        })
        .catch(error=>{
          console.log("ERROR : " + error);
        })
      })
    })
    res.redirect('/classesInfo')
  }
  else{
    console.log("did not work")
  }

})

//this is the confirmation the email sent to the user gets sent to. 
//checking to see if the code passed through as :variable is the same verification code
//on the users account. if it is the same then the users verified boolean turns to true.
app.get('/confirm/:variable',(req,res)=>{
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
  console.log(req.params.variable)
  User.findOne({temporaryPassword:req.params.variable})
  .then(data=>{
    
    res.render('setPassword.ejs',{user:data,error:null})
  })
     
})
app.post("/setPassword/:variable",checkNotAuthenticated,(req,res)=>{
  if(req.body.firstPassword == req.body.secondPassword){

    User.updateOne({temporaryPassword:req.params.variable},{password:bcrypt.hashSync(req.body.firstPassword, bcrypt.genSaltSync(9))})
    .then(()=>{
      console.log("Added new password")
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
  
  User.findOne({email:to})
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
    .then(()=>{
      console.log("assigned temporaryPassword")
      sendResetPassword(to, data._id,randomString)
    })
    .catch(error=>{
      console.log("failed to assign temporaryPassword")
    })
    
  })
  .catch(error=>{
    console.log(error)
  })
  
  res.render('resetPassword.ejs',{user:null,error:"Password Successfully changed, Please check your email"})
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

//deleteAllStudents();
//deleteAllClasses();
//updateStudentsCourses("60729871cb153b3a249b2f5d");
//deleteEveryonesCourses()

//makes sure the server is listening on a specified port number. 
app.listen(process.env.PORT || 3000)
