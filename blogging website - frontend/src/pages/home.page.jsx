import AnimationWrapper from "../common/page-animation.jsx";
import InPageNavigation from "../components/inpage-navigation.component.jsx"
import axios from "axios";
import {useEffect, useState} from "react";
import Loader from "../components/loader.component.jsx";
import BLogPostCard from "../components/blog-post.component.jsx";
import MinimalBlogPost from "../components/nobanner-blog-post.component.jsx"
import {activeTabRef} from "../components/inpage-navigation.component.jsx";
import NoDataMessage from "../components/nodata.component.jsx";
import {FilterPaginationData} from "../common/filter-pagination-data.jsx";
import LoadMoreDataBtn from "../components/load-more.component.jsx";

const HomePage = () => {

    let [blogs, setBlog] = useState(null);
    let [trendingBlogs, setTrendingBlogs] = useState(null);
    let [pageState, setPageState] = useState("home");
    let categories = ["technology", "adventure", "fantasy", "food", "festival", "pets", "creativity", "finance"];
    const fetchLatestBlog = ({page = 1}) => {
        axios.post(import.meta.env.VITE_APP_URL + "/latest-blog", {page})
            .then(async ({data}) => {

                let formatedData = await FilterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/all-latest-blogs-count"
                })

                setBlog(formatedData);
            })
            .catch(err => {
                console.log(err)
            })
    }

    const fetchTrendingBlog = () => {
        axios.get(import.meta.env.VITE_APP_URL + "/trending-blog")
            .then(({data}) => {
                setTrendingBlogs(data.blogs);
            })
            .catch(err => {
                console.log(err)
            })
    }

    const loadBlogByCategory = (e) => {
        let category = e.target.innerText.toLowerCase();
        setBlog(null);
        if (pageState === category) {
            setPageState("home")
            return;
        }
        setPageState(category);
    }

    const fetchBlogsByCategory = ({page = 1}) => {
        axios.post(import.meta.env.VITE_APP_URL + "/search-blog", {tag: pageState, page})
            .then(async ({data}) => {
                let formatedData = await FilterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/search-blogs-count",
                    data_to_send: {tag: pageState}
                })

                setBlog(formatedData);
            })
            .catch(err => {
                console.log(err)
            })
    }

    useEffect(() => {
        activeTabRef.current.click();

        if (pageState === "home") {
            fetchLatestBlog({page: 1});
        } else {
            fetchBlogsByCategory({page: 1});
        }

        if (!trendingBlogs) {
            fetchTrendingBlog();
        }
    }, [pageState])


    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                <div className="w-full">
                    <InPageNavigation route={[pageState, "Trending Blogs"]} defaultHidden={["Trending Blogs"]}>
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
                            <LoadMoreDataBtn state={blogs} fetchDatafun={(pageState === "home" ? fetchLatestBlog : fetchBlogsByCategory)}/>
                        </>

                        {
                            trendingBlogs === null ? (<Loader/>) : (
                                trendingBlogs.length ?
                                    trendingBlogs.map((blog, i) => {
                                        return <AnimationWrapper
                                            key={i}
                                            transition={{duration: 1, delay: i * .1}}
                                        >
                                            <MinimalBlogPost blog={blog} index={i}/>
                                        </AnimationWrapper>
                                    })
                                    : <NoDataMessage message="No trending blogs"/>
                            )
                        }
                    </InPageNavigation>
                </div>

                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
                    <div className="flex flex-col gap-10">
                        <div>
                            <h1 className="font-medium text-xl mb-8">Tags</h1>
                            <div className="flex flex-wrap gap-3">
                                {
                                    categories.map((category, i) => {
                                        return (
                                            <button
                                                className={"tag " + (pageState === category ? " bg-black text-white " : " ")}
                                                onClick={loadBlogByCategory}
                                                key={i}>{category}</button>
                                        );
                                    })
                                }
                            </div>
                        </div>

                        <div>
                            <h1 className="font-medium text-xl mb-8">Trending<i className="fi fi-rr-arrow-trend-up"></i>
                            </h1>
                            {
                                trendingBlogs === null ? (<Loader/>) : (
                                    trendingBlogs.length ?
                                        trendingBlogs.map((blog, i) => {
                                            return <AnimationWrapper
                                                key={i}
                                                transition={{duration: 1, delay: i * .1}}
                                            >
                                                <MinimalBlogPost blog={blog} index={i}/>
                                            </AnimationWrapper>
                                        })
                                        : <NoDataMessage message="No Trending Blogs"/>
                                )
                            }
                        </div>
                    </div>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage;