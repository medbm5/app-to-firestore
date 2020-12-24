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
  apiKey: "AIzaSyBGtJe_nloVjWrJtmnbOmuS4QM5be_qE40",
  authDomain: "movies-cb314.firebaseapp.com",
  databaseURL: "https://movies-cb314-default-rtdb.firebaseio.com",
  projectId: "movies-cb314",
  storageBucket: "movies-cb314.appspot.com",
  messagingSenderId: "201149802523",
  appId: "1:201149802523:web:dc46c8b30d2f7ee7bdf0be"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


let shows={}

firebase_show=["show1","show2","show3"]



app.get("/", function(req, res){
  res.render("movie");
});

app.get("/UpdateShows", function(req, res){

  get_shows_list().then(snapshot=>{
    showsList=[]
    snapshot.forEach(doc => {
      showsList.push(doc.data().name)

    });
    res.render("update_show",{shows:showsList});
    
  })
    
  });

app.get("/shows", function(req, res){
  res.render("shows");
});



app.get("/compose", function(req, res){
  res.render("compose");
});

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
  console.log(EpisodesServers)
  EpserversList={}
  for(i=0;i<EpisodesServers.length;i++){
    EpserversList[i]=EpisodesServers[i].split(',')
  }

  shows.EpServers=EpserversList
  console.log(shows)
  add_show_to_firebase(shows)
  add_show_to_showlist(shows.title)
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

  