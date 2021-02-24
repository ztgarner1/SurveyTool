//requiring everything thats needed and setting up app.
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
mongoose.connect(""+process.env.MONGO_ATLAS_PW,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true 
  });
//initializing Passport
const initializePassport = require('./passport-config');
//getting Student and Teacher Schema

const Student = require('./Mongoose Models/student');
const Teacher = require('./Mongoose Models/teacher');
//getting the courses 
const Course = require('./Mongoose Models/course');
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
/*
//this is the about me page does not matter if the user is logged in here
app.get('/about', (req,res) => {
  if(req.user == undefined){
    res.render('aboutMe.ejs',{user:null});
  }
  else{
      res.render('aboutMe.ejs', { user: req.user})
  }
})
//this is the contact page that the server serves
app.get('/contact', (req,res) => {
  if(req.user == undefined){
    res.render('contact.ejs',{user:null});
  }
  else{
      res.render('contact.ejs', { user: req.user})
  }
})
//server serving the create page
app.get("/create",(req,res) => {
  if(req.user == undefined){
    res.render('create.ejs',{user:null});
  }
  else{
      res.render('create.ejs', { user: req.user})
  }
})
*/
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
/*
//sends the user back learn page
app.get("/learn",checkAuthenticated,(req,res) => {
  res.render('learn/learn.ejs', { user:req.user, language:"Java"})
})
//
app.get("/learntour",checkAuthenticated,(req,res) => {
res.render('learn/learntour.ejs', { user: req.user, language:"Java"})
})

app.get("/learnVVOE",checkAuthenticated,(req,res) => {
  res.render('learn/learnvvoe.ejs', { user: req.user, language:"Java"})
})
*/
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
        Student.findOne({email:req.body.email})
        .exec()
        .then(data=>{
          if(data==null){
            //if there isnt a student with that email
            let code = sendMail(req.body.email, null);

            var student = new Student({
              __id: new mongoose.Types.ObjectId(),
              username:req.body.name,
              first: "",
              last:"",
              email:req.body.email,
              password:bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(9)),
              locked:false,
              verified:false,
              Enrolled:[],
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
        Teacher.findOne({email:req.body.email})
        .exec()
        .then(data=>{
          if(data==null){
            let code = sendMail(req.body.email, null);
            var teacher = new Teacher({
              __id: new mongoose.Types.ObjectId(),
              username:req.body.name,
              first: "",
              last:"",
              email:req.body.email,
              password:bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(9)),
              locked:false,
              verified:false,
              Enrolled:[],
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
    User.updateOne({__id: req.id, first:req.body.first,last:req.body.last})
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
  if(req.user.isTeacher){
    res.render('classesInfo.ejs',{user:req.user})
  }
  else{
    res.render('myClasses.ejs',{user:req.user})
  }
  
})
app.post('/myClasses', checkAuthenticated,(req,res)=>{
  if(req.user.verified == false){
    sendMail(req.user.email,req.user);
  }
})

//server serving the enrollment page
app.get('/enrollment', checkAuthenticated, (req,res)=>{
  ///console.log(req.user.verified);
  if(courses.length == 0){
    res.render('enrollment.ejs', {user: req.user, courses:null});
  }
  else{
    Course.find()
    .exec()
    .then((data)=>{

    })
    .then(docs=>{
      res.render('enrollment.ejs', {user: req.user, courses:docs});
    })
    .catch(error=>{
      res.render('enrollment.ejs', {user: req.user, courses:courses});
    })
    //console.log(courses[0]);
    
  }
  
})


//server responding to the enrollment Post method.
app.post('/enrollment',checkAuthenticated,(req,res)=>{
  //console.log(req.user)
 if(req.user.verified == false){
   //if the user has not verifed their account yet.
   //and needs another email to verify it.
   //console.log("CHecked here")
  sendMail(req.user.email,req.user);
 }
 else{
   //console.log(req.body.courseToAdd)
   let add = true;
    for(let i=0;i<req.user.Enrolled.length;i++){
      if(req.user.Enrolled[i].course.course_id == req.body.courseToAdd){
        console.log("already added that one")
        add = false;
      }
    }
    if(add){
      console.log("inside here")
      Course.findOne({course_id:req.body.courseToAdd})
      .then(data =>{
        var enroll;
        if(req.user.Enrolled.length == 0){
          enroll = new Enroll(data, true)
        }
        else{
          enroll = new Enroll(data, false)
        }
        req.user.Enrolled.push(enroll);
        //pushing to the arrray that is Enrolled
        User.updateOne({__id:req.user.__id},{$push:{Enrolled:enroll }})
        .then(()=>{
          console.log("successful")
          res.render('enrollment.ejs', {user: req.user, courses:courses});
        })
        .catch(()=>{
          res.render('enrollment.ejs', {user: req.user, courses:courses});
        })
      })
      
    }
    else{
      console.log("tried to add a course that you are already taking")
      res.render('enrollment.ejs', {user: req.user, courses:courses});
    }
     
   
  }   
})

//this is just for the admins
app.get('/addClasses',checkAuthenticated, (req,res)=>{
  if(req.user.isTeacher){
    //if the user equals one of us
    //then render the addClasses page
    res.render('addClasses.ejs',{user:req.user,msg:null});
  }
  else{
    res.render('index.ejs',{user:req.user});
  }
  
})
/**
 * this will be called whenever a post method is made to /addClasses
 */
app.post('/addClasses',(req,res)=>{
  
  if(req.files){
    var file = req.files.fileName,
     filename = file.name
    var results = [];
    var section = 1;
    file.mv(__dirname + "/views/uploads/"+filename,function(err){
      if(err){
        console.log(err);
        res.send("error occured");
      }
      else{
        console.log("No problem")
      }
      
    })
    fs.createReadStream(__dirname +'/views/uploads/'+filename)
    .pipe(csv({}))
    .on("data", (data)=> results.push(data))
    .on("end",() =>{
        console.log(results);
    })
    Course.find()
    .exec()
    .then(data=>{
      
      for(let i = 0; i< data.length;i++){
        if(data[i].course_id == req.body.courseId){
          section++;
        }
      }
      var course = new Course({
        intructor : req.user.__id,
        section: section,
        course_id: req.body.courseId,
        description:req.body.courseDesc,
        students:results,
      })
      course.save()
      .then(check =>{
        res.render('classesInfo.ejs',{user:req.user})
      })
      
      req.user.Enrolled.push(course);
      User.updateOne({__id:req.user.__id},{$push:{Enrolled:req.user.Enrolled }})
        .then(()=>{
          console.log("successful")
          res.render('enrollment.ejs', {user: req.user, courses:courses});
        })
        .catch(()=>{
          res.render('enrollment.ejs', {user: req.user, courses:courses});
        })
    })
    .catch(error=>{
      
    })



  }
  else{
    console.log("did not work")
  }
  console.log(filename);
  res.render('classesInfo.ejs',{user:req.user})
  
    
  /*
  var check = true;
  let emptyArrays = [];
  Course.find()
  .then(data=>{
    courses = data;
    console.log("Checked in here")
  })
  .catch(error=>{})
 var sectionNumber;
  Course.findOne({course_name: req.body.courseName})
  .then(doc =>{
    sectionNumber = doc.length+1; 
  })
  if(check){
      
      //console.log(courses)
      const course = new Course({
      course_name: req.body.courseName,
      course_id:courses.length,
      course_language:req.body.courseLanguage,
      description:''+req.body.courseDesc+'',
      tutorials:emptyArrays,
      quizes:emptyArrays,
      programming_task:emptyArrays,
    })
    course.save()
    .then(result=>{

      res.render("addClasses.ejs",{profile:req.user,msg:null})
    })
  }
  */
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
const e = require('express')
const { render } = require('ejs')
const user = require('./Mongoose Models/user')
sgMail.setApiKey(''+process.env.SENDGRID_PW+'');

//sendMail("zacharygarner7@gmail.com")
//a function that sends a email the a checks to see if this is from register or resending an email
//in order to see if we need to go to the Users account to get the confirmation code to resend
// or create a new one(if user == null)
function sendMail(to,user){
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
  let link = "https://wcu-surveytool.herokuapp.com/confirm" + randomString;
  //let link = "http://localhost:3000/confirm/" + randomString;
  //console.log(link);
  const msg = {
    to: to,
    from:"Progranimate7@gmail.com",
    subject: "Confirmation",
    text: "Hello,\nYou are recieving this email because you have registered " + 
    "for Progranimates website.\nThank you for registering!\n" +
    "Please verify your email address using this link below "+ link +
    "\n\n--Progranimate"
  }
  sgMail.send(msg);
  if(user == null){
    return randomString;
  }
  
  
}



//makes sure the server is listening on a specified port number. 
app.listen(process.env.PORT || 3000)
