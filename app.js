//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const firebase=require("firebase");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var firebaseConfig = {
  apiKey: "AIzaSyAY21ptNnYIWQgUloXmjFPZBrihXUED1f0",
  authDomain: "turketv-app.firebaseapp.com",
  projectId: "turketv-app",
  storageBucket: "turketv-app.appspot.com",
  messagingSenderId: "285997386447",
  appId: "1:285997386447:web:0d54a7b90f43e6f7b0c5ba",
  measurementId: "G-17BVB5J3NK"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let movies = [];
let shows={}
app.get("/", function(req, res){
  res.render("movie");
});

app.get("/shows", function(req, res){
  res.render("shows");
});



app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose_movie", function(req, res){
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
  console.log(movie)
  add_movie_to_firebase(movie)

  res.redirect("/");

});

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
  
  res.render("compose_episodes",{episodes:show.EpNumbers});
  
});

app.post("/compose_show", function(req, res){
  EpisodesServers=req.body.servers
  Epserverlist={}
  let i=1
  EpisodesServers.forEach(Epserver => {
 
  Epserverlist[i]=(Epserver.split(','))
    i++
  });
  shows.EpServers=Epserverlist
  add_show_to_firebase(shows)
  res.redirect("/");

});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});

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