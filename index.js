if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  var dotenv=require('dotenv');
  const express = require('express')
  const app = express()
  dotenv.config();
  const bcrypt = require('bcrypt')
  const passport = require('passport')
  const flash = require('express-flash')
  app.use(cookieParser());
  const session = require('express-session')
  const methodOverride = require('method-override')
  const mongoClient=require('mongodb').MongoClient;
  const ObjectID = require('mongodb').ObjectID;
  app.use(express.static('public'));

 
  //const port=3002;
  //connection string 
  //const dburl="mongodb://localhost:27017"
  //const dburl='mongodb+srv://testuser:testuser@cluster0.ie8km.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
  
 
  const dburl=process.env.MONGODB_URI;
  console.log(dburl);
  //with body parser we create a middleware defined down
  const bodyParser=require('body-parser');
  //each req this is executed before route
  const urlEncodedParser=bodyParser.urlencoded({extended:false});
  //connection is below 
  // mongoClient.connect(dburl,function(err,client){
  //  console.log('Connected with DB');
  //   })
  
  const initializePassport = require('./passport-config')
  initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  )
  
  const users = []
  
  app.set('view-engine', 'pug')
  app.use(express.urlencoded({ extended: false }))
  app.use(flash())
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(methodOverride('_method'))
  app.set('view-engine', 'pug')
  app.get('/',checkAuthenticated, function(req, res){
    mongoClient.connect(dburl,function(err,client){
      const myDataBase = client.db('resumes');
      const myCollection = myDataBase.collection('data');
      myCollection.find({}).toArray((err,documents)=>{
        console.log( documents);
        client.close();
        res.render('index.pug',{documents})
      })
      })
  });
  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.pug')
  })
  
  app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))
  
  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.pug')
  })
  
  app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
  })
  // const resumes=[
     
  //   {id:1.0,description:'Fresher Software Developer'},
  //   {id:1.1,aspiration:'As a developer trainee, I am specialized in creating frontend and backend application merged to be a Full-Stack application'},
  //   {id:1.2,technologies:'Node.js,MongoDB,'}
  // ]
   
  //below step links to line 11 of index.pug ie details it
  //fetches backend information for details 
  app.get('/resumes/:id', function(req,res){
    const selectedId = req.params.id;
    //resumes.filter from line 8
    // let selectedResumeHero= resumes.filter(resume => {
    //   //filter function
    //   return resume.id === +selectedId;    
    // });
    //Array is returned by default ,we need first object
    // selectedResumeHero = selectedResumeHero[0];
    //res.render('resume', {resume:selectedResumeHero});
    mongoClient.connect(dburl,function(err,client){   
      const myDataBase = client.db('resumes');
      const myCollection = myDataBase.collection('data'); 
      const filter = {_id: ObjectID(selectedId)}   
      myCollection.find(filter).toArray((err,documents)=>{
        var selectedResumeHero = documents[0];
            client.close();
        res.render('resume.pug', {resume:selectedResumeHero});
      });
    });
  });
  //**************Edit**Getting Information from backend ****************
  app.get('/edit/:id',function(req,res){
    const selectedId = req.params.id;
    mongoClient.connect(dburl,function(err,client){   
      const myDataBase = client.db('resumes');
      const myCollection = myDataBase.collection('data'); 
      const filter = {_id: ObjectID(selectedId)}   
      myCollection.find(filter).toArray((err,documents)=>{
        var selectedResumeHero = documents[0];
            client.close();
        res.render('edit.pug', {resume:selectedResumeHero});
      });
    });
  })
  
  // ***************Delete *************************
  
  app.get('/delete/:id',function(req,res){
    const selectedId = req.params.id;
    mongoClient.connect(dburl,function(err,client){   
      const myDataBase = client.db('resumes');
      const myCollection = myDataBase.collection('data'); 
      const filter = {_id: ObjectID(selectedId)}   
      myCollection.deleteOne(filter, function(err,result){
        client.close();
        res.redirect('/');
      });
    });
  })
  //below code post for name information
  app.post('/name',urlEncodedParser,function(req,res){
   // const newId=resumes [resumes.length-1].id+1;
    const newNameHero={
    //id:newId,
    //below uses encoded parser
    name:req.body.named,
    additional:req.body.addisional
      }
  
      mongoClient.connect(dburl,function(err,client){   
        const myDataBase = client.db('resumes');
        const myCollection = myDataBase.collection('data'); 
        myCollection.insertOne(newNameHero,(err,result)=>{
          client.close();
          res.redirect('/');
      });
  
    })
    // resumes.push(newNameHero);
    // //same home page ,no redirect
    // res.redirect('/');
    });
    //below code post education information names create.pug 
  app.post('/create',urlEncodedParser,function(req,res){
   // const newId=resumes [resumes.length-1].id+1;
    const newEducationHero={
   // id:newId,
    //below uses encoded parser
    education:req.body.educasion,
    additional:req.body.addisional
      }
  
      mongoClient.connect(dburl,function(err,client){   
        const myDataBase = client.db('resumes');
        const myCollection = myDataBase.collection('data'); 
        myCollection.insertOne(newEducationHero,(err,result)=>{
          client.close();
          res.redirect('/');
      });
  
    })
  
   // resumes.push(newEducationHero);
    //same home page ,no redirect
   // res.redirect('/');
    });
  
  
    app.post('/contacts',urlEncodedParser,function(req,res){
      // const newId=resumes [resumes.length-1].id+1;
       const newContactHero={
      // id:newId,
       //below uses encoded parser
       email:req.body.gmail,
       additional:req.body.addisional
         }
     
         mongoClient.connect(dburl,function(err,client){   
           const myDataBase = client.db('resumes');
           const myCollection = myDataBase.collection('data'); 
           myCollection.insertOne(newContactHero,(err,result)=>{
             client.close();
             res.redirect('/');
         });
     
       })
      })
    //below code post project information
    app.post('/projects',urlEncodedParser,function(req,res){
      //const newId=resumes [resumes.length-1].id+1;
      const newProjectHero={
     // id:newId,
      //below uses encoded parser
    projects:req.body.projecd,
    additional:req.body.addisional
        }
        mongoClient.connect(dburl,function(err,client){   
          const myDataBase = client.db('resumes');
          const myCollection = myDataBase.collection('data'); 
          myCollection.insertOne(newProjectHero,(err,result)=>{
            client.close();
            res.redirect('/');
        });
        })
     // resumes.push(newProjectHero);
      //same home page ,no redirect
    //  res.redirect('/');
      });
      //below code post Aspiration information
      app.post('/aspiration',urlEncodedParser,function(req,res){
        //const newId=resumes [resumes.length-1].id+1;
        const newAspirationHero={
       // id:newId,
        //below uses encoded parser
      aspiration:req.body.aspiradion,
      additional:req.body.addisional
          }
          mongoClient.connect(dburl,function(err,client){   
            const myDataBase = client.db('resumes');
            const myCollection = myDataBase.collection('data'); 
            myCollection.insertOne(newAspirationHero,(err,result)=>{
              client.close();
              res.redirect('/');
          });
          })
       // resumes.push(newProjectHero);
        //same home page ,no redirect
      //  res.redirect('/');
        });
  //below code post information for description
  app.post('/description',urlEncodedParser,function(req,res){
    //const newId=resumes [resumes.length-1].id+1;
    const newDescriptiontHero={
   // id:newId,
    //below uses encoded parser
  description:req.body.descripdion,
  additional:req.body.addisional
      }
      mongoClient.connect(dburl,function(err,client){   
        const myDataBase = client.db('resumes');
        const myCollection = myDataBase.collection('data'); 
        myCollection.insertOne(newDescriptiontHero,(err,result)=>{
          client.close();
          res.redirect('/');
      });
      })
    })
    //below code post information for technologies 
  
    app.post('/technologies',urlEncodedParser,function(req,res){
      //const newId=resumes [resumes.length-1].id+1;
      const newTechnologiesHero={
     // id:newId,
      //below uses encoded parser
    technologies:req.body.technolojies,
    additional:req.body.addisional
        }
        mongoClient.connect(dburl,function(err,client){   
          const myDataBase = client.db('resumes');
          const myCollection = myDataBase.collection('data'); 
          myCollection.insertOne(newTechnologiesHero,(err,result)=>{
            client.close();
            res.redirect('/');
        });
        })
      })
  
  
      //below is posting information once edit is done,hidden id is used 
      app.post('/edit', urlEncodedParser, function(req, res){
        const selectedId = req.body._id;
        const filter = {_id: ObjectID(selectedId)};
        const set = {$set: {name: req.body.named,description:req.body.descripdion,technologies:req.body.technolojies,aspiration:req.body.aspiradion,education:req.body.educasion, projects:req.body.projecd,email:req.body.gmail, additional:req.body.addisional}};
        mongoClient.connect(dburl,function(err,client){       
          const myDataBase = client.db('resumes');
          const myCollection = myDataBase.collection('data');  
          myCollection.updateOne(filter,set,(err,result)=>{
            client.close();
            res.redirect('/resumes/' + selectedId);
          });
        });
      });

      app.delete('/logout', (req, res) => {
        req.logOut()
        res.redirect('/login')
      })
      
      function checkAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
          return next()
        }
      
        res.redirect('/login')
      }
      
      function checkNotAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
          return res.redirect('/')
        }
        next()
      }
      // app.listen(port, () => {
      //   console.log(`Server running on port ${port}`);
      // });

      const host = '0.0.0.0';
      const port = process.env.PORT || 3000;

      app.listen(port, host, function() {
        console.log("Server started.......");
      });


// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config()
//   }

// const express = require('express');
// const app = express();

// const bcrypt=require('bcrypt');
// const passport = require('passport');
// const flash=require('express-flash')
// const session=require('express-session')
// app.set('view-engine', 'pug')
// const port=3000;

// const initializePassport=require('./passport-config')
// initializePassport(passport,
    
//     email =>users.find(user=>user.email===email)
// );
// const users=[];
// app.use(express.urlencoded({extended:false}));
// app.use(flash())
// app.use(session({

//     secret:process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }))
// app.use(passport.initialize())
// app.use(passport.session())
// // app.use(methodOverride('_method'))

// app.get('/',(req,res)=>{
//     app.set('view-engine', 'pug')
// res.render('index.pug',{name:'Suraj'})
// })


// app.get('/login',passport.authenticate('local',{

// successRedirect:'/',
// failureRedirect:'/login',
// failureFlash:true

// }))

// app.get('/register',(req,res)=>{

//     res.render('register.pug');
// })
// app.post('/register',(req,res)=>{
  
//     try{

//     const hashedP=bcrypt.hash(req.body.password,10)
//     users.push({
//         id:Date.now().toString(),
//         name:req.body.name,
//         email :req.body.email,
//        password:req.body.hashedP
//     })
//     res.redirect('/login')
//     }catch{
//         res.redirect('/register')
       
//     }
//   console.log(users);
// })

// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
//   });