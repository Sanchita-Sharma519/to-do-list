require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
//const ejs=require("ejs");
const morgan=require("morgan");
const mongoose = require("mongoose");
const path=require("path");
//const errorHandler = require("./middleware/error");
//const session=require("express-session");
//const passport=require("passport");
//onst passportLocalMongoose=require("passport-local-mongoose");
var cors = require('cors');
//const fs = __non_webpack_require__("fs")
const cookieParser = require("cookie-parser");
const User=require("./models/userSchema")
const List=require("./models/listSchema")
const { StatusCodes } = require("http-status-codes");
const bcrypt=require('bcrypt')
const ejs = require('ejs');
//port



mongoose.connect('mongodb://127.0.0.1/usersdb',
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
);

mongoose.connection.on('connecting', () => { 
    console.log('DB connecting')
   // console.log(mongoose.connection.readyState); //logs 2
  });
  mongoose.connection.on('connected', () => {
    console.log('DB connected');
   // console.log(mongoose.connection.readyState); //logs 1
  });
  mongoose.connection.on('disconnecting', () => {
    console.log('DB disconnecting');
    //console.log(mongoose.connection.readyState); // logs 3
  });
  mongoose.connection.on('disconnected', () => {
    console.log('DB disconnected');
    //console.log(mongoose.connection.readyState); //logs 0
  });

  //app.use(express.json());
  app.use(morgan('dev'));
  app.use(express.json());
app.use(express.urlencoded({extended:false}));
  app.use(cookieParser());
  app.use(cors());

  app.use(express.static(path.join(__dirname , 'public')));

  //app.use(express.static('./public'));
  //app.use(express.static('./frontend/public'));
  //app.use('static', express.static('public'))

  var engines = require('consolidate');
app.set('views', path.join(__dirname,"public/views"));
app.engine('html', engines.mustache);
app.set('view engine', 'ejs');

  app.get("/",(req,res)=>{
    res.render("home");
  })

  app.get("/registration",(req,res)=>{
    res.render("signup");
  })

  app.get("/login",(req,res)=>{
    res.render("loginform");
  })

  let userdetails;

  app.get("/userPage",(req,res)=>{
    //User.findOne({ email: userdetails.email }).populate('list')
    //user.populate('list')
    return res.render('userPage', userdetails);
  })

  app.post("/login",bodyParser.urlencoded({extended : true}),async(req,res)=>{
    try {
      //console.log(req.body.email)
      //console.log(req.body.password)
      if(!req.body.email){
        console.log("email")
      }
      if(!req.body.password){
        console.log("password")
      }
      if (!req.body.email || !req.body.password) {
         return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Please enter email and password",
         });
      }
  
      const user = await User.findOne({ email: req.body.email }).populate('list');
     
      if (user) {
        console.log(user)
        //console.log(user.list[0].name)
      if (user.authenticate(req.body.password)) {
            /*res.status(200).json({
              success:true,
              message:"signed in"
            })*/
            //res.render("userPage")
            userdetails={
              tittle: "userPage",
              id:user._id,
              user: user
            }
            res.redirect('/userPage')
            /*return res.render('userPage', {
              tittle: "userPage",
              user: user,
              name:user.name,
              email:user.email,
              password:user.password
          });*/
  } else {
   res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Something went wrong!",
   });
  }
 } else {
   res.status(StatusCodes.BAD_REQUEST).json({
       message: "User does not exist..!",
   });
 }
 } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error });
   }
})
// fetch data using name field of html div 

app.post("/registration",bodyParser.urlencoded({extended : true}),async(req,res)=>{
  const { name, email, password } = req.body;
  console.log(name)
  const confirmPassword=req.body.confirmPassword;
  if (!name || !email || !password || !confirmPassword) {
     return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Please Provide Required Information",
     });
  }
  if(password!=confirmPassword){
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "password and confirm password do not match",
   });
  }

  const hash_password = await bcrypt.hash(password, 10);
 
  const userData = {
     name,
     email,
     password:hash_password
  };
//console.log(userData)
  const user = await User.findOne({ email });
  if (user) {
     return res.status(StatusCodes.BAD_REQUEST).json({
        message: "User already registered",
     });
  } else {
     User.create(userData).then((user, err) => {
      //console.log(user.email)
     if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
     else{
      user.populate('list')
      //console.log(user)
      /*return res.render('userPage', {
        tittle: "userPage",
        user: user,
        name:user.name,
        email:user.email
    });*/
    res.redirect("/")
     }
       /*res
        .status(StatusCodes.CREATED)
        .json({ message: "User created Successfully" });*/
     });
  }
    //res.render("loginform")
})

app.post("/addTask/:id",bodyParser.urlencoded({extended : true}),async(req,res)=>{
  const {name,description,date}=req.body;
  const user = await User.findById(req.params.id).populate('list')
  //console.log(user.name)

  const listData={
    name,
    description,
    date
  };
  console.log(listData)
  const list = await List.findOne({ name,description,date });
  if (list) {
     return res.status(StatusCodes.BAD_REQUEST).json({
        message: "List already existing",
     });
  } else {
     List.create(listData).then((list, err) => {
     if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
     else{
      console.log(list)
      user.list.push(list)
      
      user.save();

      console.log(user)
      userdetails={
        tittle: "userPage",
        id:user._id,
        user: user
      }
      //console.log(user.list.name)
      return res.redirect("/userPage")
     }
     //return res.render("userPage",userdetails)
       /*res
        .status(StatusCodes.CREATED)
        .json({ message: "User created Successfully" });*/
     });
  }
})

app.post("/delete/:id/:userid",bodyParser.urlencoded({extended : true}),async(req,res)=>{
  const user = await User.findById(req.params.userid).populate('list')
  const listitem = await List.findById(req.params.id)
  console.log("displaying user")
  console.log(user)
    console.log(listitem)
    await List.deleteOne( { name:listitem.name } )
    //console.log(value)
    /*var i=0;
    for (let listitem of user.list){
      if(listitem.id==req.params.id){
        break;
      }
      i++;
    }*/
    /*const index = user.list.indexOf(listitem.id);
    console.log(index)
    console.log("listing")
    console.log(user.list[index])
    if (index > -1) {
      const x = user.list.splice(index, 1);
    }
    /*console.log(user.list[index])
    if (index > -1) { 
      user.list.splice(index, 1);
    }*/
    User.updateOne({ _id: req.params.userid },
      { $pull: {list: listitem.id,
        }}
      );
      console.log("list id"+listitem)
    user.save()
    userdetails={
      tittle: "userPage",
      id:user._id,
      user: user
    }
    console.log("display user")
    console.log(user)
    res.redirect('/userPage')
  }
)

  const port = process.env.PORT || 9000;

app.listen(port,function(){
    console.log("Server started on port 9000");
});