import express from "express";
import bodyParser from "body-parser";
import path from "path";

const app = express();
const port = 3000;

// Middleware
const __dirname = path.resolve();
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// now logic //
let posts = [];
let users = [];
let currentUser = null;

app.get("/signup", (req, res) =>{
    res.render("signup")
});

app.post("/signup", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let userExists = false;
    for(let user of users){
        if(user.username === username){
            userExists = true
            break
        }
    };
    if(userExists){
        res.send("you have an acount please sign in")
    }else{
        users.push({username, password})
        res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    res.render("login")
});

app.post("/login", (req, res) => {
    const {username, password} = req.body;

    let loggedin = false;
    for(const user of users){
        if(user.username === username && user.password === password){
            loggedin = true;
            currentUser = user;
            break
        }
    };
    if(loggedin){
        res.redirect("/")
    }else{
        res.send("incorrect attempts")
    }
})

app.get("/logout", (req, res) => {
    currentUser = null;
    res.redirect("/login")
});


app.get("/", (req, res)=> {
    if(currentUser){
        res.render("home", {posts, user: currentUser})
    }else{
        res.redirect("/login")
    }
});

app.get("/compose", (req, res) => {
    if (currentUser) {
        res.render("compose");
    } else {
        res.redirect("/login");
    }
});

app.post("/compose", (req, res) => {
    if(currentUser){
        const newPost = {
            title: req.body.title,
            content: req.body.content,
            id: Date.now().toString(),
            author: currentUser.username
        }
        posts.push(newPost)
        res.redirect("/")
    }else{
        res.redirect("/login")
    }
});

app.get("/post/:id", (req, res) =>{
    let foundPost = null
    for(const post of posts){
        if(post.id === req.params.id){
            foundPost = post;
            break
        }
    }
    if(foundPost){
        res.render("post", {post: foundPost})
    }else{
        res.status(404).send("Post not found");
    }
});

app.get("/edit/:id", (req, res) => {

    let foundPost = null;
    // Search for the post by id
    for (const post of posts) {
        if (post.id === req.params.id && post.author === currentUser.username) {
            foundPost = post;
            break;
        }
    }
    // Render the edit page or show error
    if (foundPost) {
        res.render("edit", { post: foundPost });
    } else {
        res.send("Post not found or you are not authorized to edit it.");
    }
});


app.post("/edit/:id", (req, res) => {
    for (const post of posts) {
        if (post.id === req.params.id && post.author === currentUser.username) {
            post.title = req.body.title;
            post.content = req.body.content;
            return res.redirect("/");
        }
    }
    res.send("Post not found or you are not authorized to edit it.");
});

app.post("/delete/:id", (req, res) => {
    if (currentUser) {
        posts = posts.filter(post => !(post.id === req.params.id && post.author === currentUser.username));
        res.redirect("/");
    } else {
        res.redirect("/login");
    }
});


app.listen(port, () => {
    console.log(`port is running on ${port}`)
});
