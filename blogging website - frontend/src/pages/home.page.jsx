import AnimationWrapper from "../common/page-animation.jsx";
import InPageNavigation from "../components/inpage-navigation.component.jsx"
import axios from "axios";
import {useEffect, useState} from "react";
import Loader from "../components/loader.component.jsx";
import BLogPostCard from "../components/blog-post.component.jsx";
import MinimalBlogPost from "../components/nobanner-blog-post.component.jsx"

const HomePage = () => {

    let [blogs, setBlog] = useState(null);
    let [trendingBlogs, setTrendingBlogs] = useState(null);
    let categories = ["technology", "adventure", "fantasy", "food", "festival", "art", "creativity"];
    const fetchLatestBlog = () => {
        axios.get(import.meta.env.VITE_APP_URL + "/latest-blog")
            .then(({data}) => {
                setBlog(data.blogs);
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
    }

    useEffect(() => {
        fetchLatestBlog();
        fetchTrendingBlog();
    }, [])


    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                <div className="w-full">
                    <InPageNavigation route={["Home", "Trending Blogs"]} defaultHidden={["Trending Blogs"]}>
                        <>
                            {
                                blogs == null ? <Loader/> :
                                    blogs.map((blog, i) => {
                                        return <AnimationWrapper
                                            key={i}
                                            transition={{duration: 1, delay: i * .1}}
                                        >
                                            <BLogPostCard content={blog} author={blog.author.personal_info}/>
                                        </AnimationWrapper>
                                    })
                            }
                        </>

                        {
                            trendingBlogs == null ? <Loader/> :
                                blogs.map((blog, i) => {
                                    return <AnimationWrapper
                                        key={i}
                                        transition={{duration: 1, delay: i * .1}}
                                    >
                                        <MinimalBlogPost blog={blog} index={i}/>
                                    </AnimationWrapper>
                                })
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
                                                className="tag"
                                                onClick={loadBlogByCategory}
                                                key={i}>{category}</button>
                                        )
                                    })
                                }
                            </div>
                        </div>

                        <div>
                            <h1 className="font-medium text-xl mb-8">Trending<i className="fi fi-rr-arrow-trend-up"></i>
                            </h1>
                            {
                                trendingBlogs == null ? <Loader/> :
                                    blogs.map((blog, i) => {
                                        return <AnimationWrapper
                                            key={i}
                                            transition={{duration: 1, delay: i * .1}}
                                        >
                                            <MinimalBlogPost blog={blog} index={i}/>
                                        </AnimationWrapper>
                                    })
                            }
                        </div>
                    </div>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage;