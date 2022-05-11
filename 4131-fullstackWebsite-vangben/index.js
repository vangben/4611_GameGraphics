// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT
//USAGE: node index.js -- open a web browser window to "localhost:port"

// Include the express module
const express = require('express');

//fs module for interacting with file system
const fs = require('fs');

// module for reading XML files
const xml = require('xml2js');

// Helps in managing user sessions
const session = require('express-session');

// include the mysql module
var mysql = require('mysql');
var connection;

var parser = new xml.Parser();
var info;

//server reads in connection via parsing dbconfig.xml file
fs.readFile(__dirname + '/dbconfig.xml', function(err, data){
  if(err) throw err;

  //asynchronous, info is not set at time of start all the time
  parser.parseString(data, function(err,result){
    if(err) throw err;
    info = result;
    XMLConnect(); //asynchro call to access "info"
  });
});
// establish connection to database
function XMLConnect(){
  connection = mysql.createConnection({
    host: info.dbconfig.host[0],//"localhost", final project update
    user: info.dbconfig.user[0],//"root",               
    password: info.dbconfig.password[0],//"Uywreazz1!",           
    database: info.dbconfig.database[0],//"project",          
    port: info.dbconfig.port[0],//3306
  });
  connection.connect(function(err){
    if(err){
      throw err;
    };
    console.log("Server connected to MYSQL database!");
  });
}

// Bcrypt library for comparing password hashes
const bcrypt = require('bcrypt');

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');

const url = require('url');

const port = 8757;

// create an express application
const app = express();

// apply the body-parser middleware to all incoming requests
app.use(bodyparser());

// Use express-session - a middle ware to manage session data on server between http requests
// In-memory session is sufficient for this assignment
app.use(session({
        secret: "csci4131secretkey",
        saveUninitialized: true,
        resave: false
    }
));

// middle ware to serve static files
app.use('/client', express.static(__dirname + '/client'));

// server listens on port set to value above for incoming connections
app.listen(port, () => console.log('Listening on port', port));

app.get('/',function(req, res) {  // first page user sees
  if(!req.session.user){ //user is not logged in, redirect to login page
    //res.send('Session Not Started');
    res.sendFile(__dirname + '/client/login.html');
  } else {
    res.sendFile(__dirname + '/client/welcome.html');
    //returns list of contacts from querying the contact_table
  }
  // res.sendFile(__dirname + '/client/welcome.html');
});


// GET method route for the contacts page.
// It serves MyContacts.html present in client folder
app.get('/MyContacts', function(req, res) {
    if(!req.session.user){ //user is not logged in, redirect to login page
      //res.send('Session Not Started');
      res.sendFile(__dirname + '/client/login.html');
    } else{
      res.sendFile(__dirname + '/client/MyContacts.html');
    }
});
app.get('/getContacts', function(req, res) {
    // MyContacts page calls this when clicking on "Academic, Industry or Personal"
    let category = url.parse(req.url, true).query.category;
    //console.log(category);
    //console.log("index.js category:" +category);
    connection.query('SELECT * FROM contact_table WHERE contact_category = ?', [category], function(err,rows,fields){
      if(err) throw err;
      //console.log(rows[0]);
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.write(JSON.stringify(rows));//important! sends queried data to client
      res.end(); 

    });
});

//called upon going to Add Contacts page
app.get('/AddContact', function(req,res) {
  if(!req.session.user){
      //res.send('Session Not Started');
    res.sendFile(__dirname + '/client/login.html');
  } else{
    res.sendFile(__dirname + '/client/AddContact.html');
  }
});

app.get('/AllContacts', function(req,res) {
  if(!req.session.user){ //user is not logged in, redirect to login page
    //res.send('Session Not Started');
    res.sendFile(__dirname + '/client/login.html');
  } else {
    res.sendFile(__dirname + '/client/AllContacts.html');
    //returns list of contacts from querying the contact_table
  }
});

app.get('/getAllContacts', function(req, res) {
    connection.query('SELECT * FROM contact_table ORDER BY contact_name ASC', function(err,rows,fields){
      if(err) throw err;
      console.log(rows);
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.write(JSON.stringify(rows));//important! sends queried data to client
      res.end(); 
    });
});
app.get('/Stocks', function(req,res) {
  if(!req.session.user){ //user is not logged in, redirect to login page
    res.sendFile(__dirname + '/client/login.html');
  } else {
    res.sendFile(__dirname + '/client/Stocks.html');

  }
});
//called when welcome page's button is clicked
app.get('/login', function(req,res) {
  if(!req.session.user){ //user is not logged in, redirect to login page
    res.sendFile(__dirname + '/client/login.html');
  } else {
    res.sendFile(__dirname + '/client/AllContacts.html'); //user is already logged in, redirect to AllContacts

  }
});

//called when logout button is clicked
app.get('/logout', function(req,res) {
  req.session.destroy(); //end the session
  res.sendFile(__dirname + '/client/login.html');
});

//called upon clicking submit in Add Contacts
app.post('/AddContact', function(req,res) {
  //TODO
  console.log("addingcontact...");
  const insertionPoint = {
    contact_category : req.body.category.toLowerCase(),
    contact_name : req.body.name,
    contact_location : req.body.location,
    contact_info : req.body.info,
    contact_email : req.body.email,
    website_title : req.body.website_title,
    website_url: req.body.url
  }; 

  connection.query('INSERT contact_table SET ?', insertionPoint, function(err, rows, fields){
    if(err) throw err;
    console.log("successful insertion");
    res.redirect(302, '/AllContacts')
    //res.json({status: 'fail'});
    
  });
});

app.post('/login', function(req, res) {
  // login page calls this upon clicking "submit"
  var loginInfo = req.body;
  var login = loginInfo.login; //accesses client-given "username" field
  var pwd = loginInfo.password; //accesses client-given password

  //query the database tbl_login using "login" and SELECT
  connection.query('SELECT * FROM tbl_accounts WHERE acc_login = '+'"'+login+'"', function(err,rows,fields){
    if(err) throw err;
    //if no error and "results set is assigned to a variable named rows??"
    if (rows.length >=1){
      if(bcrypt.compareSync(pwd, rows[0].acc_password)){ 
        //success, set the session, return success
        req.session.user = login;
        res.json({status: 'success'});
      } else {
        res.json({status: 'fail'});
      }
    } else {
      res.json({status: 'fail'});
    }
  }); //end of query
}); //end of login endpoint

app.get('/admin', function(req,res) {
  //res.sendFile(__dirname + '/client/Admin.html');
  if(!req.session.user){ //user is not logged in, redirect to login page
    res.sendFile(__dirname + '/client/login.html');
  } else {
    res.sendFile(__dirname + '/client/Admin.html'); //user is already logged in, redirect to AllContacts
  }
}); //end of /admin



//server retrieves userdata from database, sends to admin page client
app.get('/userlist', function(req,res) {
  //res.sendFile(__dirname + '/client/Admin.html');
  if(!req.session.user){ //user is not logged in, redirect to login page
    res.sendFile(__dirname + '/client/login.html');
  } else {
    connection.query('SELECT * FROM tbl_accounts', function(err,rows,fields){
      if(err) throw err;
      var objArray = [];
      for (var i in rows){
        //console.log("i is: " + i);
        var obj = {id:rows[i].acc_id,
                    name: rows[i].acc_name,
                  login: rows[i].acc_login,
                  password: rows[i].acc_password
        };
        objArray.push(obj);
      }
      res.json(objArray);
    }); 
  }
});//end of /userlist

//add a user to tbl_accounts table in DB
app.post('/addUser', function(req,res){ 
  let login2 = req.body.login;

  if(!req.session.user){ //user is not logged in, redirect to login page
    res.sendFile(__dirname + '/client/login.html');
  } else {
    //add given user into DB
    connection.query('SELECT * FROM tbl_accounts WHERE acc_login =?',[login2], function(err,rows,fields){
      if(err) throw err;
      //console.log("login: " + login2);// + "\nlogin2: "+login2);
      if(rows.length == 0){ //login doesnt exist in tbl_accounts yet, add it to db
        const insertionPoint = {
          acc_name: req.body.name,
          acc_login: req.body.login,
          acc_password:  bcrypt.hashSync(req.body.password, 10)//         req.body.password
        };

        connection.query('INSERT tbl_accounts SET ?', insertionPoint, function(err,result){
          if(err) throw err;
          //console.log("successfully added new user");
          //res.json(obj);
          console.log(result);
          console.log(insertionPoint);
          res.send({flag:true, id:result.insertId}); //let client know done
        });
      } else
      {
        //login already exists, flag to false to notify client an error
        res.send({flag:false});
      }
    });
  }
});

//allows changes to an existing user in the DB
app.post('/updateUser', function(req,res){
  if(!req.session.user){ //user is not logged in, redirect to login page
    res.sendFile(__dirname + '/client/login.html');
  } else {
    connection.query('SELECT * FROM tbl_accounts WHERE acc_login=? and acc_id != ?', 
    [req.body.login,req.body.id], function(err,result,fields){
      if(err) throw err;
      console.log("searching for row to update: " + req.body.name); //prints out TO SERVER not web console
      if(result.length == 0){ //new change to login doesnt already exist
        if(req.body.password != null){ //if new password is given, update all three name,password,login
          bcrypt.hash(req.body.password, 10, function(err,hash){
            if(err) throw err;
            connection.query("UPDATE tbl_accounts SET acc_login=?, acc_name=?,acc_password=? WHERE acc_id=?",
              [req.body.login,req.body.name,hash,req.body.id], function(err, result){ //5_6 changes: put "hashed" pass into DB
                if(err) throw err;
                console.log("updating table with: " + req.body.name + " and pass: " + hash);
              });
          });
        } else { //no new password is given, only update name, login
          connection.query("UPDATE tbl_accounts SET acc_login=?, acc_name=? WHERE acc_id=?",
            [req.body.login,req.body.name,req.body.id], function(err, result){
              if(err) throw err;
              console.log("updating table with: " + req.body.name);

          });
        }
        res.send({flag:true});
      } //end of update queries
      else { //new change to login already exists
        res.send({flag:false});
      }
    }); //end of SELECT statement
  }
}); //end of post updateUser

//bonus feature, welcome message for current user
app.get('/loginWelcome', function(req,res) {
  //console.log("/loginWelcome hit");
  res.statusCode=200;
  res.write(JSON.stringify(req.session.user));
  res.end();
});

app.post('/deleteUser', function(req,res) {
  if(!req.session.user){ //user is not logged in, redirect to login page
    res.sendFile(__dirname + '/client/login.html');
  } else {
    console.log("current user: "+req.session.user +'\n'+"trying to delete user:" + req.body.login);
    if(req.session.user != req.body.login){
      //console.log("cannot delete currently logged-in user");
      connection.query('DELETE FROM tbl_accounts WHERE acc_login = ?', [req.body.login], function (err, result){
        if(err) throw err;
        res.send({flag:true});
        console.log("successful deletion from table");
      });

    } else {
      res.send({flag:false});
    }
  }
});


app.post('/switch', function(req,res){
  if(!req.session.user){ //user is not logged in, redirect to login page
    res.sendFile(__dirname + '/client/login.html');
  } else {
    req.session.reload(function(err){ //here?
      if(err) throw err;
      req.session.user = req.body.login;
      // console.log("reqsession user: " + req.session.user);
      // console.log('reqbodylogin: '+ req.body.login);
      res.statusCode = 200;
      res.end();
    });
  }
});


// function to return the 404 message and error to client
app.get('*', function(req, res) {
  // add details
  res.sendStatus(404);
});
