import {useParams} from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component.jsx";
import Loader from "../components/loader.component.jsx";
import AnimationWrapper from "../common/page-animation.jsx";
import BLogPostCard from "../components/blog-post.component.jsx";
import NoDataMessage from "../components/nodata.component.jsx";
import LoadMoreDataBtn from "../components/load-more.component.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import {FilterPaginationData} from "../common/filter-pagination-data.jsx";

const SearchPage = () => {

    let {query} = useParams();
    let [blogs, setBlog] = useState(null);
    let [users, setUsers] = useState(null);

    const searchBlogs = ({page = 1, create_new_arr = false}) => {
        axios.post(import.meta.env.VITE_APP_URL + "/search-blog", {query, page})
            .then(async ({data}) => {
                let formatedData = await FilterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/all-latest-blogs-count",
                    data_to_send: {query},
                    create_new_arr
                });
                setBlog(formatedData);
            })
            .catch(err => {
                console.log(err);
            });
    };

    const fetchUsers = () => {
        axios.post(import.meta.env.VITE_APP_URL + "/search-users", {query})
            .then(({data: {users}}) => {
                setUsers(users);
            })
    }

    useEffect(() => {
        resetState();
        searchBlogs({page: 1, create_new_arr: true});
        fetchUsers();
    }, [query]);

    const resetState = () => {
        setBlog(null);
        fetchUsers(null);
    }

    return (
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full">
                <InPageNavigation route={[`Search result for ${query}`, "Accounts Matched"]}
                                  defaultHidden={["Accounts Matched"]}>
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
                        <LoadMoreDataBtn state={blogs} fetchDatafun={searchBlogs}/>
                    </>
                </InPageNavigation>
            </div>
        </section>
    )
}

export default SearchPage;