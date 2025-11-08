import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getSingleTweetThunk } from '../../store/tweets'
import handleDeleteImage from '../../utils/DeleteImage'
import ButtonLoadingAnimation from '../LoadingAnimation/ButtonLoadingAnimation'
import exit from '../../assets/images/exit.svg'
import fileSelector from '../../assets/images/fileSelector.svg'
import validateImageFile from '../../utils/validateImageFile'

import './UpdateCommentForm.css'

const UpdateCommentForm = ({ tweet, sessionUser, comment, setShowUpdateCommentForm }) => {
  const [errors, setErrors] = useState([])
  const [content, setContent] = useState(comment.content)
  const [initialPreviewImage, setInitialPreviewImage] = useState(comment.comment_images?.[0]?.url)
  const [previewImage, setPreviewImage] = useState(comment.comment_images?.[0]?.url)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const { profileImage, username } = sessionUser
  const history = useHistory()
  const dispatch = useDispatch()
  useEffect(() => {
    const newErrors = []
    if (hasSubmitted) {
      if (!content.trim().length) newErrors.push("Reply content is required.")
    }
    if (content.length > 280) newErrors.push("Maximum comment length is 280 characters.")
    setErrors(newErrors)
    return () => setIsSubmitting(false)
  }, [content, errors.length, hasSubmitted])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (errors.length) return
    const res = await fetch(`/api/comments/${comment.id}`, {
      method: "PUT",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({content: content.trim()})
    })
    const data = await res.json()
    if (res.ok) {
      setIsSubmitting(true)
      if (initialPreviewImage && (initialPreviewImage !== previewImage)) {
        await handleDeleteImage(dispatch, comment.comment_images[0].id, comment.comment_images[0].key, setInitialPreviewImage)
      }
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("type", "comment");
        formData.append("comment_id", data.id)
        formData.append("user_id", sessionUser.id)
        await fetch('/api/images/', {
          method: "POST",
          body: formData,
        });
      }
      setImage(null);
      setPreviewImage(null)
      setImageError(null)
      await dispatch(getSingleTweetThunk(tweet.id))
      setContent('')
      setShowUpdateCommentForm(false)
    } else {
      setHasSubmitted(true)
      console.log(data)
    }
  }

  const updateImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { valid, error } = validateImageFile(file);
      if (!valid) {
        setImage(null);
        setPreviewImage(initialPreviewImage);
        setImageError(error);
        return;
      }
      setImageError(null);
      setImage(file);
      const reader = new FileReader()
      reader.readAsDataURL(file);
      reader.onloadend = function () {
        setPreviewImage(reader.result)
      }
    }
  }
  return (
    <div className='new-tweet-container comment modal'>
      <div className='right-new-tweet-container'>
        <img onClick={() => history.push(`/${username}`)} className='new-tweet profile-image' src={profileImage} alt={`${username}'s avatar`} />
      </div>
      <div className='left-new-tweet-container'>
        <div className='new-tweet errors'>
          {errors.length > 0 && errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
          {imageError && <p>{imageError}</p>}
        </div>
        <div className='replying-to content'>
          <span>Replying to </span>
          <span>@{tweet.user.username}</span>
        </div>
        <form className='new-tweet form' onSubmit={handleSubmit}>
          <textarea
            type="textarea"
            placeholder="Tweet your reply"
            className='input textarea'
            cols='60'
            rows='8'
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              setHasSubmitted(false)
              setErrors([])
            }}
          />
           <div className='preview-image-container update-tweet'>
            {previewImage && <>
              <img className="preview image" src={previewImage} alt="Selected reply attachment preview" />
              <img  onClick={(e) => {
                setPreviewImage(null)
                setImage(null);
                setImageError(null);
              }} className='remove-preivew-img icon' src={exit} alt="Remove attachment" />
            </>}
          </div>
          <label htmlFor="img-upload-update-tweet"><img className='file-selector' src={fileSelector} alt="Upload icon" /> Add Image</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            id="img-upload-update-tweet"
            multiple
            style={{
              display: "none"
            }}
            onClick={event => event.target.value = null}
            onChange={updateImage}
          />
          <div className='new-tweet-button container'>
            {isSubmitting ? <ButtonLoadingAnimation /> : <button className='new-tweet button' disabled={errors.length > 0 || imageError || content.length === 0} type='submit'>Meow</button>}
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateCommentForm
