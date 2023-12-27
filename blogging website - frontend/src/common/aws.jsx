import axios from "axios";

export const uploadImage = async (img) => {

    let imgUrl = null;
    await axios.get(import.meta.env.VITE_APP_URL + "/get-upload-url")
        .then( async ({data: {uploadUrl}}) => {

            await axios({
                method: 'PUT',
                url: uploadUrl,
                headers: {'Content-Type': 'image/jpeg'},
                data: img
            })
                .then(() => {
                    imgUrl = uploadUrl.split("?")[0]
                })

        })

    return imgUrl;
}