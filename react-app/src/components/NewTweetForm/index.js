import { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getAllTweetsThunk, createNewTweetThunk } from '../../store/tweets'
import fileSelector from '../../assets/images/fileSelector.svg'
import exit from '../../assets/images/exit.svg'
import ButtonLoadingAnimation from '../LoadingAnimation/ButtonLoadingAnimation'
import './NewTweetForm.css'
import validateImageFile from '../../utils/validateImageFile'

const NewTweetForm = ({ sessionUser, setShowNewTweetForm, showNewTweetForm }) => {
  const [errors, setErrors] = useState([])
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null)
  const { profileImage, username } = sessionUser
  const history = useHistory()
  const dispatch = useDispatch()
  const location = useLocation()
  useEffect(() => {
    const newErrors = []
    if (hasSubmitted) {
      if (!content.trim().length) newErrors.push("Tweet content is required.")
    }
    if (content.length > 280) newErrors.push("Maximum tweet length is 280 characters.")
    setErrors(newErrors)
    return () => setIsSubmitting(false)
  }, [content, errors.length, hasSubmitted, showNewTweetForm])


  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = await dispatch(createNewTweetThunk(content.trim()))
    if (Array.isArray(data)) {
      setHasSubmitted(true)
    } else {
      setIsSubmitting(true)
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("type", "tweet");
        formData.append("tweet_id", data.id)
        formData.append("user_id", sessionUser.id)
        await fetch('/api/images/', {
          method: "POST",
          body: formData,
        });
      }
      setImage(null);
      setPreviewImage(null)
      setImageError(null)
      await dispatch(getAllTweetsThunk())
      setShowNewTweetForm(false)
      setContent('')
      if (location.pathname !== '/home') {
        history.push(`/tweets/${data.id}`)
      }
    }
  }

  const checkKeyDown = (e) => {
    if (e.keyCode === 13) return false;
  };


  const updateImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { valid, error } = validateImageFile(file);
      if (!valid) {
        setImage(null);
        setPreviewImage(null);
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
    <div className='new-tweet-container'>
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
        <form className='new-tweet form' onSubmit={handleSubmit} >
          <textarea
            type="text"
            placeholder="What's happening?"
            className='input textarea'
            onKeyDown={(e) => checkKeyDown(e)}
            cols='60'
            rows='8'
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              setHasSubmitted(false)
              setErrors([])
            }}
          />
          <div className='preview-image-container'>
            {previewImage && <>
              <img className="preview image" src={previewImage} alt="Selected tweet attachment preview" />
              <img onClick={(e) => {
                setPreviewImage(null)
                setImage(null);
                setImageError(null);
              }} className='remove-preivew-img icon' src={exit} alt="Remove attachment" />
            </>}
          </div>
          <label htmlFor="img-upload"><img className='file-selector' src={fileSelector} alt="Upload icon" /> Add Image</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            id="img-upload"
            multiple
            style={{
              display: "none"
            }}
            onClick={event => event.target.value = null}
            onChange={updateImage}
          />
          <div className='new-tweet-button container'>
            {isSubmitting ? <ButtonLoadingAnimation /> : <button className='new-tweet button' disabled={errors.length > 0 || imageError || content.length === 0 || isSubmitting} type='submit'>Meow</button>}
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewTweetForm
