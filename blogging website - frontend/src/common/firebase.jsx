import { initializeApp } from "firebase/app";
import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCpvjtFRFtc3nLtwvKUYyYr_LLuA0NGhag",
    authDomain: "blogs-react-js.firebaseapp.com",
    projectId: "blogs-react-js",
    storageBucket: "blogs-react-js.appspot.com",
    messagingSenderId: "48341118753",
    appId: "1:48341118753:web:c830969f97693b43151860"
};

const app = initializeApp(firebaseConfig);


//Google Auth

const provider = new GoogleAuthProvider();
const auth = getAuth();

export const authWithGoogle = async () => {

    let user = null;

    await signInWithPopup(auth, provider)
        .then((result) => {
            user = result.user;
        })
        .catch((err) => {
            console.log(err);
        })

    return user;
}