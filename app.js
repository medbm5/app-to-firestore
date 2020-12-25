const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const express = require("express");
const admin = require("firebase-admin");
const firebase=require("firebase");

//firebase config key
const serviceAccount = require("./Key.json");
//firebase admin initilize
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://server-auth-41acc.firebaseio.com",
});
const db=admin.firestore();
//crcsrf Middleware


const PORT = process.env.PORT || 3000;
const app = express();
//midlwares setup
app.engine("html", require("ejs").renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static("public"));




//get login path
app.get("/login", function (req, res) {
  res.render("login.html",{cookie:false});
});
//get show path
app.get("/shows", function(req, res){
    const sessionCookie = req.cookies.session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
        res.render("shows.html",{cookie:sessionCookie});
    })
    .catch((error) => {
      res.redirect("/login");
    });
});
//get update show
app.get("/UpdateShows", function(req, res){
    const sessionCookie = req.cookies.session || "";
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then(() => {
        
        get_shows_list().then(snapshot=>{
            showsList=[]
            snapshot.forEach(doc => {
              showsList.push(doc.data().name)
            });
            res.render("update_show.html",{shows:showsList,cookie:sessionCookie});
            
          })
      })
      .catch((error) => {
        res.redirect("/login");
      });
   
      
    });
  
//get movie path
app.get("/", function (req, res) {
  const sessionCookie = req.cookies.session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      res.render("movie.ejs",{cookie:sessionCookie});
    })
    .catch((error) => {
      res.redirect("/login");
    });
});

//post movie to firebase
app.post("/compose_movie", function(req, res){
    console.log("sessionCookie")
       console.log(req)
        const movie = {
            title: req.body.postTitle,
            Description: req.body.postBody,
            ImageUrl: req.body.postImg,
            Imdb: req.body.postImdb,
            language:"Turky",
            country:"Turkie",
            Year: req.body.postYear,
            actors: req.body.postActors.split(","),
            Servers: req.body.postServers.split(","),
          };
          add_movie_to_firebase(movie)
          res.redirect("/");
  
  });
//post show to firebase
app.post("/compose_episodes", function(req, res){
    const show = {
      title: req.body.postTitle,
      Description: req.body.postBody,
      ImageUrl: req.body.postImg,
      Imdb: req.body.postImdb,
      language:"Turky",
      country:"Turkie",
      Year: req.body.postYear,
      actors: req.body.postActors,
      EpNumbers: req.body.postEp,
      EpServers:[]
    };
    shows=show
    
    res.render("compose_episodes.ejs",{episodes:show.EpNumbers});
    
  });

  //add show episodes
  app.post("/compose_show", function(req, res){
    EpisodesServers=req.body.servers
    console.log(typeof(EpisodesServers))
    EpserversList={}
    console.log(typeof(EpisodesServers)===String)
    if(typeof(EpisodesServers)==="string"){
      EpserversList[0]=EpisodesServers.split(',')
    }else{
      console.log("hello")
      for(i=0;i<EpisodesServers.length;i++){
        EpserversList[i]=EpisodesServers[i].split(',')
      }
    }
    shows.EpServers=EpserversList
    console.log(shows)
    add_show_to_firebase(shows)
    add_show_to_showlist(shows.title)
    res.redirect("/shows");
  
  });
  
  //updte shows
  app.post("/update_show",(req,res)=>{
    EpisodesServers=req.body.postServers
    //console.log(req.body)
    Epserverlist=[]
    let showname=req.body.postTitle
    let i=req.body.postNum
    if(EpisodesServers.length===1){
      Epserverlist.push(EpisodesServers)
    }else{
      Epserverlist=EpisodesServers.split(',')
    }
    console.log(showname)
        add_new_episode(i,Epserverlist,showname)
        res.redirect("/UpdateShows")
  });




















//handle login
app.post("/sessionLogin", (req, res) => {

  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});

//handle logout 
app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});




//firebase functions

function add_movie_to_firebase(data){
    db.collection("movies").add(data).then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
  })
  .catch(function(error) {
      console.error("Error adding document: ", error);
  });
  
  }
  
  
  function add_show_to_firebase(data){
    db.collection("series").add(data).then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
  })
  .catch(function(error) {
      console.error("Error adding document: ", error);
  });
  
  }
  
  function add_show_to_showlist(showName){
    data={name:showName}
    db.collection("showList").add(data).then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
  })
  .catch(function(error) {
      console.error("Error adding document: ", error);
  });
  
  }
  
  function get_shows_list(){
    
    const showsLisRef = db.collection('showList');
    return showsLisRef.get().then(function(snapshot){
      return snapshot;
      
    })
    
  }
  
  function add_new_episode(i,episodeObject,showname){
    const showsRef=db.collection('series')
    showsRef.where("title", "==",showname).get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        show=doc.data()
        console.log(typeof(show.EpServers))
        show.EpServers[i]=episodeObject
        console.log(show)
        showsRef.doc(doc.id).update(show).then(function() {
          console.log("Document successfully updated!");
      });
        // doc.data() is never undefined for query doc snapshots
      
    })})
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
  }
  
    