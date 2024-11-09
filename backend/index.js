require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");
const app = express();
const path = require('path'); 
const port = process.env.PORT || 5173;

const jws =require("jsonwebtoken");
const {authenticationToken} = require("./utilities");

app.use(express.json());

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/notes_app/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port  : ${port}`);
});

app.use(
    cors({
        origin: "*",
    })
);


app.get("/", (req, res) => {
    res.json({ data: "hello"});
});

// Create Account
app.post("/create-account", async (req, res) => {
    const {fullName, email, password} = req.body;

    if (!fullName){
        return res
        .status(400)
        .json({ error: true, message: "Please enter your full name" });
    }

    if (!email){
        return res
        .status(400)
        .json({error:true, message:"Email is required"});
    }

    if (!password){
        return res
        .status(400)
        .json({error:true, message:"Password is required"});
    }

    const isUser = await User.findOne({email: email});

    if (isUser){
        return res.json({
            error: true,
            message: "User already exists",
        });
    }

    const user = new User({
        fullName,
        email,
        password,
    });

    await user.save();

    const accessToken = jws.sign({user}, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: "36000m",
    });

    return res.json({
        error: false,
        message: "Account created successfully",
        accessToken,
        user,
    });

});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    
    if (!email || !password) {
        return res.status(400).json({
            error: true,
            message: "Email and password are required",
        });
    }
    
    
    const userInfo = await User.findOne({ email: email });
    if (!userInfo) {
        return res.status(400).json({
            error: true,
            message: "User not found",
        });
    }

    if (userInfo.email == email && userInfo.password == password){
        const user = {user: userInfo};
        const accessToken = jws.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "36000m",
        });
    
        return res.json({
            error: false,
            message: "Login successful",
            email,
            accessToken,
        });
    } else {
        return res.status(400).json({
            error : true,
            message: "Invalid email or password",
        });
    }
});

// Get-User
app.get("/Get-User", authenticationToken,async (req, res) => {
    const {user} = req.user;

    const isUser = await User.findOne({_id: user._id});

    if (!isUser) {
        return res.sendStatus(401);
    }

    return res.json({
        user: {fullName: isUser.fullName, email: isUser.email, "_id": isUser._id, createdOn: isUser.createdOn},
        message: "User Is Present",
    });
});

// Add Notes
app.post("/Add-Note", authenticationToken, async (req, res) => {
    const {title, content, tags} = req.body;
    const {user} = req.user;

    console.log("Received tags:", tags);  // Add this line

    if (!title){
        return res.status(400).json({
            error: true,
            message: "Title is Required"
        });
    }

    if (!content){
        return res.status(400).json({
            error: true,
            message: "Content is Required"
        });      
    }

    try{
        const note = new Note({
            title,
            content,
            tags : tags || [],  // Tags are assigned here
            userId : user._id,
        });

        await note.save(); 

        return res.json({
            error: false,
            note,
            message: "Note added Successfully",
        });
    } catch (error){
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Edit Note
app.put("/Edit-Note/:noteId", authenticationToken, async (req, res) => {
    const noteId = req.params.noteId;
    const {title, content, tags, isPinned} = req.body;
    const {user} = req.user;

    if (!title && !content && !tags){
        return res
        .status(400)
        .json({
            error: true,
            message: "No Change Provided"
        });
    }

    try{
        const note = await Note.findOne({ _id: noteId, userId: user._id});

        if (!note){
            return res.status(400).json({error: true, message: "Note not Found"});
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned) note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note Updated Successfully",
        });
    }catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error"});
    }
});

// Get-All-Notes
app.get("/Get-All-Notes/", authenticationToken, async (req, res) => {
    const {user} = req.user;

    try{
        const notes = await Note.find({ userId: user._id}).sort({ isPinned: -1 });
        
        return res.json({
            error: false,
            notes,
            message: "Notes Retrieved Successfully",
        });
    } catch (error){
        return res.status(500).json({ error: true, message: "Internal Server Error"});
    }
});

// Delete-Note
app.delete("/Delete-Note/:noteId", authenticationToken, async (req, res) => {
    const noteId = req.params.noteId;
    const {user} = req.user;

    try{
        const note = await Note.findOneAndDelete({ _id: noteId, userId: user._id});

        if(!note){
            return res.status(404).json({error:true, message: "Note not Found"});
        }

        await Note.deleteOne({
            _id: noteId,
            userId: user._id
        });

        return res.json({
            error: false,
            message: "Note Deleted Successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error"});
    }
});

// Update isPinned Value
app.put("/Update-Note-Pinned/:noteId", authenticationToken, async (req, res) =>{
    const noteId = req.params.noteId;
    const {isPinned} = req.body;
    const {user} = req.user;

    try{
        const note = await Note.findOne({ _id: noteId, userId: user._id});

        if (!note){
            return res.status(400).json({error: true, message: "Note not Found"});
        }

        note.isPinned = isPinned || false;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note Pinned Updated Successfully",
        });
    }catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error"});
    }
});

// Search Note
app.get("/Search-Note/", authenticationToken, async (req, res) =>{
    const {user} = req.user;
    const {query} = req.query;

    if (!query){
        return res.status(400).json({error: true, message: "Search Query is required"});
    }

    try{
        const matchingNotes = await Note.find({
            userId: user._id,
            $or: [
                {title: { $regex: new RegExp(query, "i")} },
                {content: { $regex: new RegExp(query, "i")} },
            ],
        });

        return res.json({
            error: false,
            notes: matchingNotes,
            message: "Notes Found Successfully",
        })

    }catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error"});
    }

    
});



app.listen(8000);

module.exports = app;