import {Route, Routes} from "react-router-dom";
import Navbar from "./components/navbar.component.jsx";
import UserAuthForm from "./pages/userAuthForm.page.jsx";
import {createContext, useEffect, useState} from "react";
import {lookInSession} from "./common/session.jsx";
import Editor from "./pages/editor.pages.jsx";
import HomePage from "./pages/home.page.jsx";
import SearchPage from "./pages/search.page.jsx";
import PageNotFound from "./pages/404.page.jsx";
import ProfilePage from "./pages/profile.page.jsx";
import BlogPage from "./pages/blog.page.jsx";

export const UserContext = createContext({})

const App = () => {

    const [userAuth, setUserAuth] = useState({});

    useEffect(() => {

        let userInSession = lookInSession("user");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null})

    },[])

    return (
        <UserContext.Provider value={{userAuth, setUserAuth}}>
            <Routes>
                <Route path="/editor" element={<Editor/>}/>
                <Route path="/" element={<Navbar/>}>
                    <Route index element={<HomePage />} />
                    <Route path="/signin" element={<UserAuthForm type="sign-in"/>}/>
                    <Route path="/signup" element={<UserAuthForm type="sign-up"/>}/>
                    <Route path="search/:query" element={<SearchPage />}/>
                    <Route path="user/:id" element={<ProfilePage />}/>
                    <Route path="blog/:blog_id" element={<BlogPage />} />
                    <Route path="*" element={<PageNotFound />}/>
                </Route>
            </Routes>
        </UserContext.Provider>
    )
}

export default App;