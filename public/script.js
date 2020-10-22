
var typewriter =  new Typewriter('#typewriter', {
  autoStart: true,
  skipAddStyles: true,
});
typewriter
.changeDelay(60)
.changeDeleteSpeed(20)
.pauseFor(700)
.typeString("I am a full stack developer")
.pauseFor(400)
.deleteChars(26)
.typeString(" mainly use Golang and Nodejs for backend")
.pauseFor(400)
.deleteChars(41)
.typeString(" use Postgresql and Mongodb as databases")
.pauseFor(400)
.deleteAll()
.typeString("For more information <br>  about what I use <br> go to \"My stack\"")
.pauseFor(400)
.deleteAll(10)
.start();
