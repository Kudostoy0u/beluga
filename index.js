 const express = require('express');

const Sentry = require('@sentry/node');

 const Tracing = require("@sentry/tracing");
const {Pool} = require('pg');

require('dotenv').config()
const bp = require("body-parser")
//hi
let cookieParser = require('cookie-parser');
const path = require("path")
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
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
Sentry.init({
  dsn: "https://00bec2ac8f794d98abfdba65b9f12c48@o465848.ingest.sentry.io/5479247",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  tracesSampleRate: 1.0,
});


app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.get("/", function(req,res) {
   res.render('index')   
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
    res.render("create", {"namehh" : "Kudos Beluga"})
   } else if (req.cookies.verify == process.env.AYUSH) {
     res.render("create", {"namehh" : "Ayush Kulkarni"})
   } else if (req.cookies.verify == process.env.ANISH) {
     res.render("create", {"namehh" : "Anish T"})
   }else {
     res.render("404")
   }
   break;
   case "cookie":
   res.render("cookie")
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
            client.query(`SELECT * FROM blogs WHERE verified ORDER BY id DESC NULLS LAST`, (err,result) => {
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
  if (data.length) {
res.render(file,{"results" : data})
  } else {
    res.render("404")
  }
}

app.post("/", function(req,res) {
if ((req.cookies.verify == process.env.SECRET)||(req.cookies.verify == process.env.AYUSH) || (req.cookies.verify == process.env.ANISH)) {
if (req.cookies.verify == process.env.SECRET) {
  var query = "INSERT INTO blogs (date,title,subtitle,picture,post,name,verified) VALUES ($1,$2,$3, $4, $5,$6,$7)"
  var params = [req.body.date,req.body.title,req.body.subtitle,req.body.picture,req.body.post,"Kudos Beluga",true]
} else if (req.cookies.verify == process.env.AYUSH ) {
  var query = "INSERT INTO blogs (date,title,subtitle,picture,post,name,verified) VALUES ($1,$2,$3, $4, $5,$6,$7)"
  var params = [req.body.date,req.body.title,req.body.subtitle,req.body.picture,req.body.post,"Ayush K.",false]
} else if (req.cookies.verify == process.env.ANISH ) {
  var query = "INSERT INTO blogs (date,title,subtitle,picture,post,name,verified) VALUES ($1,$2,$3, $4, $5,$6,$7)"
  var params = [req.body.date,req.body.title,req.body.subtitle,req.body.picture,req.body.post,"Anish T.",false]
}
  pool.connect((err, client, release) => {
  if (err) {
    res.send("error")
    return console.error('Error acquiring client', err.stack)
    
  } else {
    console.log("yes!")
        client.query(query,params, (err,result) => {
          release()
    if (err) {
      res.send("error")
      throw err
    } else {
      res.send("success")
      console.log("success")
    } 
  });
  }
  })


}
})
app.post("/blog", function(req,res) {
  res.cookie("verify", req.body.cookie);
  res.send("success")
})
app.use(Sentry.Handlers.errorHandler());

app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

app.listen(8080, () => {

  console.log('server started');
});
