import {Link, useParams} from "react-router-dom";
import axios from "axios";
import {createContext, useEffect, useState} from "react";
import AnimationWrapper from "../common/page-animation.jsx";
import Loader from "../components/loader.component.jsx";
import {getDay} from "../common/date.jsx";
import BlogInteraction from "../components/blog-interaction.component.jsx";
import BLogPostCard from "../components/blog-post.component.jsx";
import BlogContent from "../components/blog-content.component.jsx";


export const blogStructure = {
    title: '',
    des: '',
    content: [],
    author: {personal_info: {}},
    banner: '',
    publishedAt: ''
}

export const BlogContext = createContext({});

const BlogPage = () => {

    let {blog_id} = useParams();
    let [blog, setBlog] = useState(blogStructure);
    let {
        title,
        content,
        banner,
        author: {personal_info: {fullname, username: author_username, profile_img}},
        publishedAt
    } = blog;
    const [loading, setLoading] = useState(true);
    const [similarBlogs, setSimilarBlogs] = useState(null);

    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_APP_URL + "/get-blog", {blog_id})
            .then(({data: {blog}}) => {
                setBlog(blog);

                axios.post(import.meta.env.VITE_APP_URL + "/search-blog", {
                    tag: blog.tags[0], limit: 6, eliminate_blog: blog_id })
                    .then(({data}) => {
                        setSimilarBlogs(data.blogs);
                    })

                setLoading(false);
            })
            .catch(err => {
                console.log(err.message);
                setLoading(false);
            })
    }

    useEffect(() => {
        resetState();
        fetchBlog();
    }, [blog_id]);

    const resetState = () => {
        setBlog(blogStructure);
        setSimilarBlogs(null);
        setLoading(true);
    };

    return (
        <AnimationWrapper>
            {
                loading ? <Loader/>
                    :
                    <BlogContext.Provider value={{blog, setBlog}}>
                        <div className="max-w-[900px] center py-10 mx-lg:px-[5vw]">
                            <img src={banner} alt="banner_img" className="aspect-video"/>
                            <div className="mt-12">
                                <h2>{title}</h2>
                                <div className="flex max-sm:flex-col justify-between my-8">
                                    <div className="flex gap-5 items-start">
                                        <img src={profile_img} alt="avatar" className="w-12 h-12 rounded-full"/>

                                        <p className="capitalize">{fullname} <br/>@<Link className="underline"
                                                                                         to={`/user/${author_username}`}>{author_username}</Link>
                                        </p>
                                    </div>

                                    <p className="text-dark-grey opacity-75 max-sm:mt-6 max:sm:ml-12 max-sm:pl-5">
                                        Published on {getDay(publishedAt)}
                                    </p>
                                </div>
                            </div>

                            <BlogInteraction/>

                            <div className="my-12 font-gelasio blog-page-content">
                                {
                                    content[0].blocks.map((block, i) => {
                                        return <div key={i} className="my-4 md:my-8"><BlogContent block={block}/></div>
                                    })
                                }
                            </div>

                            <BlogInteraction/>

                            {
                                similarBlogs !== null && similarBlogs.length ?
                                    <>
                                        <h1 className="text-2xl mt-14 mb-10 font-medium">Similar Blogs</h1>

                                        {
                                            similarBlogs.map((blog, i) => {
                                                let {author : {personal_info}} = blog;
                                                return <AnimationWrapper key={i} transition={{duration: 1, delay: i*0.08}}>
                                                    <BLogPostCard content={blog} author={personal_info}/>
                                                </AnimationWrapper>
                                            })
                                        }
                                    </>
                                    : ""
                            }

                        </div>
                    </BlogContext.Provider>
            }
        </AnimationWrapper>
    )

}

export default BlogPage;