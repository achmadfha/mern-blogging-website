import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "./Schema/User.js";
import {nanoid} from "nanoid";
import jwt from 'jsonwebtoken';
import cors from 'cors';
import admin from 'firebase-admin';
import serviceAccountKey from './blogs-react-js-firebase-adminsdk-50fac-717d754467.json' assert {type: "json"};
import {getAuth} from "firebase-admin/auth";
import aws from "aws-sdk";


// config
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
})
const s3 = new aws.S3({
    region: 'ap-southeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadUrl = async () => {

    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject', {
        Bucket: 'blogs-website-portofolio',
        Key: imageName,
        Expires: 1000,
        ContentType: "image/jpeg"
    })

}

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const formatDatatoSend = (user) => {

    const access_token = jwt.sign({id: user._id}, process.env.SECRET_ACCESS_KEY)

    return {
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
        access_token
    }
}

const generateUsername = async (email) => {
    let username = email.split("@")[0];
    let isUsernameNotUnique = await User.exists({"personal_info.username": username}).then((result) => result)

    isUsernameNotUnique ? username += nanoid().substring(0, 5) : "";

    return username
}

//Routes
app.post("/signup", (req, res) => {
    let {fullname, email, password} = req.body;

    if (fullname.length < 3) {
        return res.status(403).json({"error": "Fullname must be at least 3 letters long"});
    }
    if (!email.length) {
        return res.status(403).json({"error": "Email Required"});
    }
    if (!emailRegex.test(email)) {
        return res.status(403).json({"error": "Email Invalid"});
    }
    if (!passwordRegex.test(password)) {
        return res.status(403).json({"error": "Password should be 6 to 20 characters long with a numeric, 1 lowercase, and 1 uppercase letter"});
    }

    bcrypt.hash(password, 10, async (err, hashed_password) => {
        if (err) {
            return res.status(500).json({"err": err.message});
        }

        let username = await generateUsername(email);

        let user = new User({
            personal_info: {fullname, email, password: hashed_password, username}
        });

        user.save()
            .then((u) => {
                res.status(200).json(formatDatatoSend(u));
            })
            .catch(err => {
                if (err.code === 11000) {
                    return res.status(500).json({"error": "Email already registered"});
                }
                return res.status(500).json({"error": err.message});
            });
    });
});


app.post("/signin", (req, res) => {

    let {email, password} = req.body;

    User.findOne({"personal_info.email": email})
        .then((user) => {
            if (!user) {
                return res.status(403).json({"error": "Email not found"})
            }

            if (!user.google_auth) {
                bcrypt.compare(password, user.personal_info.password, (err, result) => {
                    if (err) {
                        return res.status(403).json({"error": "Error accured while login please try again"})
                    }

                    if (!result) {
                        return res.status(403).json({"error": "Incorrect Password"})
                    } else {
                        return res.status(200).json(formatDatatoSend(user))
                    }
                })
            } else {
                return res.status(403).json({"error": "Account was created using google. Try login with google!"})
            }
        })
        .catch(err => {
            return res.status(500).json({"error": err.message})
        })
})

app.post('/google-auth', async (req, res) => {

    let {access_token} = req.body;

    getAuth()
        .verifyIdToken(access_token)
        .then(async (decodedUser) => {

            let {email, name, picture} = decodedUser;

            picture = picture.replace("s96-c", "s384-c");

            let user = await User.findOne({"personal_info.email": email})
                .select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")
                .then((u) => {
                    return u || null
                })
                .catch(err => {
                    return res.status(500).json({"error": err.message})
                })

            if (user) {
                if (!user.google_auth) {
                    return res.status(403).json({"error": "This email was signed up without google. Please log in with Email and Password to access the account"})
                }
            } else {
                let username = await generateUsername(email);
                user = new User({
                    personal_info: {fullname: name, email, username},
                    google_auth: true
                })

                await user.save().then((u) => {
                    user = u;
                })
                    .catch(err => {
                        return res.status(500).json({"error": err.message})
                    })
            }
            return res.status(200).json(formatDatatoSend(user))
        })
        .catch(err => {
            return res.status(500).json({"error": "Failed to authenticate you with Google. Try again with another Google account"})
        })
})

app.get('/get-upload-url', (req,res) => {
    generateUploadUrl().then(url=>res.status(200).json({uploadUrl: url}))
        .catch(err => {
            console.log(err.message)
            return res.status(500).json({"error:": err.message})
        })
})


/* monggose db setup */
const PORT = process.env.PORT || 8001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () => console.log(`running at ${PORT}`));
}).catch((error) => console.log(error))
