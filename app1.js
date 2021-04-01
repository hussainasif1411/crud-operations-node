var express = require("express");
var mysql = require('mysql');
var multer = require('multer');
var fs = require('fs');
var url = require('url');
var path = require('path');
var querystring = require('querystring');
const { json } = require("body-parser");

var app = express();

//var upload = multer({ dest: 'uploads/' });

app.set('view engine', 'ejs');
app.use(express.static("public"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "nodeapp"
});

con.connect(function (err) {
    if (err) throw err;
});

var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
var upload = multer({
    storage: storage
});


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/signup.html");
});

app.post("/", function (req, res) {

    console.log(req.body);
    console.log("Connected! Insert Now");

    var signupsql = "SELECT email from users where email = '" + req.body.userEmail + "'";

    con.query(signupsql, function (err, result) {
        if (result.length) {
            res.redirect("/failure");
            //res.end('user already exist')
        } else {

            console.log("Connected! Insert Now");
            var sql = "INSERT INTO users (name, email, password) VALUES ('" + req.body.userName + "','" + req.body.userEmail + "','" + req.body.userPassword + "')";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
            res.redirect("/success");
            //res.end('register new user')      
        }

        console.log('data' + result);

    });

});
app.get("/success", function (req, res) {
    res.sendFile(__dirname + "/success.html");
});

app.get("/failure", function (req, res) {
    res.sendFile(__dirname + "/failure.html");
});

app.get("/login", function (req, res) {
    res.sendFile(__dirname + "/login.html");
});

app.post("/login", function (req, res) {

    console.log(req.body);
    console.log("Connected! Insert Now");

    var signinsql = "SELECT name, email, password from users where email = '" + req.body.userEmail + "' AND password = '" + req.body.userPassword + "'";

    con.query(signinsql, function (err, result) {
        if (result.length) {
            res.redirect("/addproduct");
        } else {
            res.send("<h1>Register First!<h1>");
            //res.end('register new user')      
        }

        console.log('data' + result);

    });


    /*
      var pass = req.body.userPassword;
      var email = req.body.userEmail;
    
      console.log(email);
      console.log(pass);
    
      
      console.log("Connected! Select Now");
      var sqlLogin = "SELECT name, email FROM users WHERE email = '" + req.body.userEmail + "'";
      con.query(sqlLogin, function (err, result) {
        if (err) throw err;
        console.log(result);
      });
    
    
      //res.write("<h1>Welcome!</h1>");
      res.redirect("/addproduct");
      res.end();
      */
});

app.get("/addproduct", function (req, res) {
    res.sendFile(__dirname + "/addproduct.html")
});

app.post("/addproduct", upload.single('productImage'), function (req, res) {

    console.log(req.file.filename);
    //var imgsrc = __dirname + '/' + req.file.filename;
    //console.log.filename;
    console.log("Connected! Insert product now!");
    var sqlProduct = "INSERT INTO products (name, price, description, image) VALUES ('" + req.body.productName + "','" + req.body.productPrice + "','" + req.body.productDescription + "','" + req.file.filename + "')";
    con.query(sqlProduct, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });

    res.write("Product data stored!");
    res.end();
});

var obj = {};

app.get("/producttable", function (req, res) {

    console.log("Connected! Select product now!");
    var selectProduct = "SELECT * FROM products";
    con.query(selectProduct, function (err, result) {
        if (err) throw err;
        obj = { producttable: result };
        res.render('producttable', obj);
    });

    //res.write("Product data stored!");
    //res.end();
});

var upobj = [];

app.get("/updateproduct", function (req, res) {

    console.log("Connected! Update product now!");

    var q = url.parse(req.url, true).query;
    console.log(q);
    var txt = q.id;
    console.log(txt);

    var selectProduct = "SELECT * FROM products WHERE id = '" + txt + "'";
    con.query(selectProduct, function (err, result) {
        if (err) throw err;
        upobj = { updateproduct: result };
        res.render('updateproduct', upobj);
    });


    //res.sendFile(__dirname + "/updateproduct.html");
});

app.post("/updateproduct", upload.single('productImage'), function (req, res) {

    // console.log("Connected! Update product Now!");

    // console.log(req.param.productName);

    console.log(req.body.productId);
    console.log(req.file.filename);

    var sqlProduct = "UPDATE products SET name = '" + req.body.productName + "', price = '" + req.body.productPrice + "', description= '" + req.body.productDescription + "', image = '" + req.file.filename + "' where id = " + req.body.productId;
    con.query(sqlProduct, function (err, result) {
        if (err) throw err;
        console.log("1 record updated");
    });

    res.write("Product data updated!");
    res.end();

});

/*app.get('/fileupload', function(req, res){
  res.sendFile(__dirname + "/fileupload.html");
});
 
app.post("/fileupload", upload.single('productImage'), function(req,res){
  var file = __dirname + '/' + req.file.filename;
  fs.rename(req.file.path, file, function(err) {
    if (err) {
      console.log(err);
      res.send(500);
    } else {
      res.json({
        message: 'File uploaded successfully',
        filename: req.file.filename
      });
    }
  });
});
*/

app.get("/delete", function (req, res) {

    console.log("Connected! Delete Now");

    var q = url.parse(req.url, true).query;
    var txt = q.id;
    console.log(txt);
    //var name = req.params.productName
    //var sqlProduct = "DELETE FROM products WHERE name = '"+req.body.productName+"'";
    var sqlProduct = "DELETE FROM products WHERE id = '" + txt + "'";
    con.query(sqlProduct, function (err, result) {
        if (err) throw err;
        console.log("1 record deleted");
    });

    res.redirect("/producttable");
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});