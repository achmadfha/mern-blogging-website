import {Link, useNavigate} from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation.jsx";
import defaultPanel from "../imgs/blog banner.png";
import {uploadImage} from "../common/aws.jsx";
import {useContext, useEffect} from "react";
import {Toaster, toast} from "react-hot-toast";
import {EditorContext} from "../pages/editor.pages.jsx";
import EditorJS from "@editorjs/editorjs";
import {tools} from "./tools.component.jsx"
import axios from "axios";
import {UserContext} from "../App.jsx";

const BlogEditor = () => {

    let {
        blog,
        blog: {title, banner, content, tags, des},
        setBlog,
        textEditor,
        setTextEditor,
        editorState,
        setEditorState
    } = useContext(EditorContext);

    let {userAuth: {access_token}} = useContext(UserContext);
    let navigate = useNavigate();

    useEffect(() => {
        if (!textEditor.isReady) {
            setTextEditor(new EditorJS({
                holderId: "textEditor",
                data: content,
                tools: tools,
                placeholder: "Let's write an awesome story"
            }))
        }

    }, []);

    const handleBannerUpload = (e) => {
        let img = e.target.files[0];

        if (img) {

            let loadingToast = toast.loading("Uploading...")
            uploadImage(img).then((url) => {
                if (url) {

                    toast.dismiss(loadingToast);
                    toast.success("Upload 👍")
                    setBlog({...blog, banner: url})
                }
            })
                .catch(err => {
                    toast.dismiss(loadingToast);
                    return toast.error(err)
                })
        }
    }

    const handleTitleKeyDown = (e) => {
        if (e.keyCode == 13) {
            e.preventDefault();
        }
    }

    const handleTitleChange = (e) => {
        let input = e.target;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + "px";

        setBlog({...blog, title: input.value})
    }

    const handleError = (e) => {
        let img = e.target;
        img.src = defaultPanel
    }

    const handlePublishEvent = (e) => {
        if (!banner.length) {
            return toast.error("Upload Blog Banner to Publish")
        }

        if (!title.length) {
            return toast.error("Write Blog Title to publish it")
        }

        if (textEditor.isReady) {
            textEditor.save().then(data => {
                if (data.blocks.length) {
                    setBlog({...blog, content: data});
                    setEditorState("publish");
                } else {
                    return toast.error("Write something in your blogs to publish")
                }
            })
                .catch((err) => {
                    console.log(err);
                })
        }
    }

    const handleSaveDraft = (e) => {
        if (e.target.className.includes('disable')) {
            return;
        }
        if (!title.length) {
            return toast.error("Write blog title before save as draft")
        }

        let loadingToast = toast.loading("Saving Draft...")
        e.target.classList.add('disable');

        if (textEditor.isReady) {
            textEditor.save().then(content => {
                let blogObj = {
                    title, banner, des, content, tags, draft: true
                }

                axios.post(import.meta.env.VITE_APP_URL + "/create-blog", blogObj, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                })
                    .then(() => {
                        e.target.classList.remove('disable');
                        toast.dismiss(loadingToast);
                        toast.success("Saved 👍")

                        setTimeout(() => {
                            navigate("/");
                        }, 500)
                    })
                    .catch(({response}) => {
                        e.target.classList.remove('disable');
                        toast.dismiss(loadingToast);
                        return toast.error(response.data.error);
                    })
            })
        }
    }

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none w-10">
                    <img src={logo} alt="Logo"/>
                </Link>

                <p className="max-md:hidden text-black line-clamp-1 w-full">
                    {title.length ? title : "New Blog"}
                </p>

                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2"
                            onClick={handlePublishEvent}
                    >
                        Publish
                    </button>
                    <button className="btn-light py-2" onClick={handleSaveDraft}>Save Draft</button>
                </div>
            </nav>

            <Toaster/>
            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">
                        <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
                            <label>
                                <img
                                    src={banner}
                                    className="z-10"
                                    alt="ImageBanner"
                                    onError={handleError}
                                />
                                <input
                                    id="uploadBanner"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>
                        </div>
                        <textarea placeholder="Blog Title"
                                  onKeyDown={handleTitleKeyDown}
                                  onChange={handleTitleChange}
                                  defaultValue={title}
                                  className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40">

                        </textarea>

                        <hr className="w-full opacity-10 my-5"/>

                        <div id="textEditor" className="font-gelasio">
                        </div>
                    </div>
                </section>
            </AnimationWrapper>
        </>

    )
}

export default BlogEditor;