import { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getAllTweetsThunk, createNewTweetThunk } from '../../store/tweets'
import fileSelector from '../../assets/images/fileSelector.svg'
import exit from '../../assets/images/exit.svg'
import ButtonLoadingAnimation from '../LoadingAnimation/ButtonLoadingAnimation'
import '../NewTweetForm/NewTweetForm.css'
import './NewTweetModal.css'
import validateImageFile from '../../utils/validateImageFile'

const MAX_TWEET_LENGTH = 280

const NewTweetFormModal = ({ sessionUser, setShowNewTweetFormModal, showNewTweetFormModal }) => {
  const [errors, setErrors] = useState([])
  const [content, setContent] = useState('')
  const [hasSubmittedModal, setHasSubmittedModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [image, setImage] = useState(null);
  const [previewImageModal, setPreviewImageModal] = useState(null)
  const [imageError, setImageError] = useState(null)
  const history = useHistory()
  const { profileImage, username } = sessionUser
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    const newErrors = []
    if (hasSubmittedModal) {
      if (!content.trim().length) newErrors.push("Tweet content is required.")
    }
    if (content.length > MAX_TWEET_LENGTH) newErrors.push("Maximum tweet length is 280 characters.")
    setErrors(newErrors)
    return () => setIsSubmitting(false)
  }, [content, errors.length, hasSubmittedModal, showNewTweetFormModal])

  const remainingCharacters = MAX_TWEET_LENGTH - content.length
  const isOverLimit = remainingCharacters < 0
  const isWarning = remainingCharacters <= 40

  const handleCloseModal = () => {
    setShowNewTweetFormModal(false)
    setContent('')
    setErrors([])
    setHasSubmittedModal(false)
    setPreviewImageModal(null)
    setImage(null)
    setImageError(null)
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = await dispatch(createNewTweetThunk(content.trim()))
    if (Array.isArray(data)) {
      setHasSubmittedModal(true)
    } else {
      setIsSubmitting(true)
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("type", "tweet");
        formData.append("tweet_id", data.id)
        formData.append("user_id", sessionUser.id)
        await fetch('/api/images', {
          method: "POST",
          body: formData,
        });
      }
      setImage(null);
      setPreviewImageModal(null)
      setImageError(null)
      await dispatch(getAllTweetsThunk())
      handleCloseModal()
      if (location.pathname !== '/home') {
        history.push(`/tweets/${data.id}`)
      }
    }
  }

  const checkKeyDown = (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      return false;
    }
  };


  const updateImageModal = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { valid, error } = validateImageFile(file);
      if (!valid) {
        setImage(null);
        setPreviewImageModal(null);
        setImageError(error);
        return;
      }
      setImageError(null);
      setImage(file);
      const reader = new FileReader()
      reader.readAsDataURL(file);
      reader.onloadend = function () {
        setPreviewImageModal(reader.result)
      }
    }
  }


  return (
    <div className='new-tweet-modal'>
      <button
        type='button'
        className='new-tweet-modal__close'
        onClick={handleCloseModal}
        aria-label='Close compose modal'
      >
        <img src={exit} alt="Close compose modal" />
      </button>
      <div className='new-tweet-container modal'>
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
                setHasSubmittedModal(false)
                setErrors([])
              }}
            />
            <div className='preview-image-container'>
              {previewImageModal && <>
                <img className="preview image" src={previewImageModal} alt="Selected tweet attachment preview" />
                <img onClick={(e) => {
                  setPreviewImageModal(null)
                  setImage(null);
                  setImageError(null);
                }} className='remove-preivew-img icon' src={exit} alt="Remove attachment" />
              </>}
            </div>
            <label htmlFor="img-upload-modal"><img className='file-selector' src={fileSelector} alt="Upload icon" /> Add Image</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              id="img-upload-modal"
              multiple
              style={{
                display: "none"
              }}
              onClick={event => event.target.value = null}
              onChange={updateImageModal}
            />
            <div className='new-tweet-button container'>
              <span className={`new-tweet-char-count${isOverLimit ? ' error' : isWarning ? ' warning' : ''}`}>
                {content.length}/{MAX_TWEET_LENGTH}
              </span>
              {isSubmitting ? <ButtonLoadingAnimation /> : <button className='new-tweet button' disabled={errors.length > 0 || imageError || content.length === 0 || isSubmitting} type='submit'>Meow</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewTweetFormModal
