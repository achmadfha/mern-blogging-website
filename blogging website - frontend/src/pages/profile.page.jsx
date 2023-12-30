import {Link, useParams} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import axios from "axios";
import AnimationWrapper from "../common/page-animation.jsx";
import Loader from "../components/loader.component.jsx";
import {UserContext} from "../App.jsx";
import AboutUser from "../components/about.component.jsx";
import {FilterPaginationData} from "../common/filter-pagination-data.jsx";
import InPageNavigation from "../components/inpage-navigation.component.jsx";
import BLogPostCard from "../components/blog-post.component.jsx";
import NoDataMessage from "../components/nodata.component.jsx";
import LoadMoreDataBtn from "../components/load-more.component.jsx";
import PageNotFound from "./404.page.jsx";

export const profileDataStructure = {
    personal_info: {
        fullname: "",
        username: "",
        profile_img: "",
        bio: ""
    },
    account_info: {
        "total_posts": 0,
        "total_reads": 0
    },
    social_links: {},
    joinedAt: ""

}

const ProfilePage = () => {

    let {id: profileId} = useParams();
    let [profile, setProfile] = useState(profileDataStructure);
    let [loading, setLoading] = useState(true);
    let [blogs, setBlogs] = useState(null);
    let [profileLoaded, setProfileLoaded] = useState("");
    let {
        personal_info: {
            fullname, username: profile_username, profile_img, bio
        },
        account_info: {
            total_posts, total_reads
        },
        social_links, joinedAt
    } = profile;

    let { userAuth: { username }} = useContext(UserContext);

    const fetchUserProfile = () => {
        axios.post(import.meta.env.VITE_APP_URL + '/get-profile', {
            username: profileId
        })
            .then(({data: user}) => {
                if (user !== null ){
                    setProfile(user);
                }
                setProfileLoaded(profileId);
                getBlogs({user_id: user._id});
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
            })
    }

    const getBlogs = ({page = 1, user_id}) => {
        user_id = user_id === undefined ? blogs.user_id : user_id;
        axios.post(import.meta.env.VITE_APP_URL + '/search-blog', {
            author: user_id,
            page
        })
            .then(async ({data}) => {
                let formatedData = await FilterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/all-latest-blogs-count",
                    data_to_send: {author: user_id}
                })
                formatedData.user_id = user_id;
                setBlogs(formatedData);

            })
    }

    useEffect(() => {
        if (profileId !== profileLoaded){
            setBlogs(null);
        }
        if (blogs === null){
            resetStates();
            fetchUserProfile();
        }
    }, [profileId, blogs]);

    const resetStates = () => {
        setProfile(profileDataStructure);
        setLoading(true);
        setProfileLoaded("");
    }

    return (
        <AnimationWrapper>
            {
                loading ? <Loader/> :
                    profile_username.length ?
                    <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
                        <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">

                            <img src={profile_img} alt="profileavatar"
                                 className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"/>
                            <h1 className="text-2xl font-medium">@{profile_username}</h1>
                            <p className="text-xl capitalize">{fullname}</p>
                            <p>{total_posts.toLocaleString()} Blog - {total_reads.toLocaleString()} Reads</p>

                            <div className="flex gap-4 mt-2">
                                {
                                    profileId === username ?
                                        <Link to="/settings/edit-profile" className="btn-light rounded-md">Edit
                                            Profile</Link>
                                        : ""
                                }
                            </div>
                            <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} className="max-md:hidden" />
                        </div>

                        <div className="max-md:mt-12 w-full">
                            <InPageNavigation route={["Blogs Published", "About"]} defaultHidden={["About"]}>
                                <>
                                    {
                                        blogs === null ? (<Loader/>) : (
                                            blogs.results.length ?
                                                blogs.results.map((blog, i) => {
                                                    return <AnimationWrapper
                                                        key={i}
                                                        transition={{duration: 1, delay: i * .1}}
                                                    >
                                                        <BLogPostCard content={blog} author={blog.author.personal_info}/>
                                                    </AnimationWrapper>
                                                })
                                                : <NoDataMessage message="No Blogs Published"/>
                                        )
                                    }
                                    <LoadMoreDataBtn state={blogs} fetchDatafun={getBlogs}/>
                                </>
                                <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt}/>
                            </InPageNavigation>
                        </div>

                    </section>
                        : <PageNotFound />
            }
        </AnimationWrapper>
    )
}

export default ProfilePage;