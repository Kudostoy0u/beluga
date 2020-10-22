const {Pool} = require('pg');
require('dotenv').config()
const bp = require("body-parser")
let cookieParser = require('cookie-parser');
const express = require('express');

const app = express();
app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use(cookieParser())
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
const pool = new Pool({
  connectionString : process.env.POSTGRES,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
const Airbrake = require('@airbrake/node');
const airbrakeExpress = require('@airbrake/node/dist/instrumentation/express');

const airbrake = new Airbrake.Notifier({
  projectId: 308942,
  projectKey: '6380c369f20d00d34dc220bc4ee1964f',
});

// This middleware should be added before any routes are defined
app.use(airbrakeExpress.makeMiddleware(airbrake));

app.get("/", function(req,res) {
   res.status(200).render('index')   
})

app.get("/:key", function(req,res) {
 switch (req.params.key) {
   case "blog":
   posts(res,renderblog,"blog",undefined)
   break;
   case "about":
   res.render("about")
   break;
   case "stack":
   res.render("stack")
   break;
   case "create":
   if (req.cookies.verify == process.env.SECRET) {
    res.render("create")
   } else {
     res.render("404")
   }
   break;
   default:
   res.render("404")
 }
})
app.get("/:key/:key2", function(req,res) {
  if (req.params.key == "post" && req.params.key2) {
    posts(res,renderblog,"post",decodeURIComponent(req.params.key2).replace(/-/g, " "))
  } else {
    res.render("404")
  }
})

const posts = (res,renderblog,file,query) => {
pool.connect((err, client, release) => {
  let sql;
  if (err) {
    return console.error('Error acquiring client', err.stack)
    
  } else {
    
    if (query) {
        client.query(`SELECT * FROM blogs WHERE title=$1`,[query], (err,result) => {
      release()
    if (err) {
      throw err
    } else {
      renderblog(res,result.rows,file)
    }
    });
    } else {
            client.query(`SELECT * FROM blogs `, (err,result) => {
      release()
    if (err) {
      throw err
    } else {
      renderblog(res,result.rows,file)
    }
    });
    }
    console.log("Success")

  }
})

}
const renderblog = (res,data,file) => {
res.render(file,{"results" : data})
}

app.post("/", function(req,res) {
if (req.cookies.verify == process.env.SECRET) {

  var query = "INSERT INTO blogs (date,title,subtitle,picture,post,name) VALUES ($1,$2,$3, $4, $5,$6)"
  var params = [req.body.date,req.body.title,req.body.subtitle,req.body.picture,req.body.post,"Kudos Beluga"]
  pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack)
  } else {
    console.log("yes!")
        client.query(query,params, (err,result) => {
          release()
    if (err) {
      throw err
    } else {
      console.log("success")
    } 
  });
  }
  })


}
})
app.use(airbrakeExpress.makeErrorHandler(airbrake));
app.listen(8080, () => {
  console.log('server started');
});