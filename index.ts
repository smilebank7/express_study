import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import firebase from 'firebase-admin';
import FirebaseOptions from "firebase/app";
import dotenv from 'dotenv';

const app = express();

// Initialize Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
});
const db = firebase.firestore();

app.use(bodyParser.json());

dotenv.config();
const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    appId: process.env.APP_ID,
};

// Define routes
app.post('/addPost', async (req: Request, res: Response) => {
    try {
        const { name, detail, writer, date, tag } = req.body;
        const post = { name, detail, writer, date, tag };
        const postRef = await db.collection('posts').add(post);
        return res.json({ postId: postRef.id });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
});

app.get('/getPostList', async (req: Request, res: Response) => {
    try {
        const querySnapshot = await db.collection('posts').get();
        const posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        return res.json({ posts });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
});

app.get('/getPostData/:postId', async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const postRef = db.collection('posts').doc(postId);
        const post = await postRef.get();
        if (!post.exists) {
            return res.status(404).json({ error: 'Post not found' });
        }
        return res.json({ id: post.id, ...post.data() });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
});

// Start the server
app.listen(8080, () => {
    console.log('Server started on http://localhost:8080');
});
