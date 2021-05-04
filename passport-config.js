//this file sets up a passport an allows you to get 
//the user(if logged in) from the request sent to server.js
const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
var bcrypt = require("bcrypt");
const User = require('./Mongoose Models/user');
var user;
function initialize(passport){
    const authenticateUser = async (email, password, done) =>{
        //console.log(email)
        //const user = getUserByEmail(email)
        User.findOne({email:email})
        .exec()
        .then(data=>{
            user = data;
            var date;
            try {
                if(user== null){
                    return done(null, false, {message: "Email or password is incorrect"})
                }
                else{
                    date = new Date()
                    if(bcrypt.compareSync(password, user.password)){
                    //console.log(docs[i]);
                        //console.log("comparing password")
                        //console.log(date.getTime());
                        
                        // console.log(date.getTime());
                        if(user.locked){
                            
                            if(date.getTime() - user.timeLocked  < 18000000){
                                return done(null, false, {message: "Account is locked"})
                            }
                            else{
                                User.updateOne({email:user.email},{attempts:0,locked:false})
                                .catch(error=>{
                                    console.log(error)
                                })
                                return done(null, user);
                            }
                            
                        }
                        else{
                            User.updateOne({email:user.email},{attempts:0})
                            .catch(error=>{
                                console.log(error)
                            })
                            return done(null, user)
                        }
                        
                    }
                    else{
                        let date = new Date()
                        
                        if(user.attempts == null || user.attempts == undefined){
                            user.attempts = 1;
                        }
                        else{
                            user.attempts+= 1;
                        }
                        User.updateOne({email:user.email},{attempts:user.attempts})
                        .catch(error=>{
                            console.log(error)
                        })
                        if(user.attempts == 5){

                            User.updateOne({email:user.email}, {attempts:user.attempts,locked:true,timeLocked:date.getTime()})
                            .catch(error=>{
                                console.log(error)
                            })
                        }
                        
                        return done(null, false, {message: "Email or password is incorrect"})
                    }
                }
                
            } catch (error) {
                return done(error);
            }
        })
        .catch(error=>{
            return done(null, false, {message: "Email or password is incorrect"})
        })
     
    }
    //return done(null, false, {message: "Email or password is incorrect"})
    
    passport.use(new localStrategy({usernameField: "email"}, authenticateUser));
    passport.serializeUser((user,done) => {
        done(null, user);
    })
    
    passport.deserializeUser((user,done) => {
        User.findById(user, (error,user)=>{
            done(error, user);
        })
    });

}

module.exports = initialize;
