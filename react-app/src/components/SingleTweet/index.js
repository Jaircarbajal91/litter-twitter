import { format } from 'date-fns'
import { useParams, useHistory, Redirect } from "react-router-dom"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { getSingleTweetThunk } from "../../store/tweets"
import commentIcon from '../../assets/images/commentIcon.svg'
import heartIcon from '../../assets/images/heartIcon.svg'
import fullHeartIcon from '../../assets/images/FullHeart.svg'
import litter from '../../assets/images/threeDots.svg'
import stretch from '../../assets/images/stretch.png'
import stretch2 from '../../assets/images/stretch2.png'
import { Modal } from '../../context/Modal'
import UpdateTweetForm from '../UpdateTweetForm'
import DeleteTweet from '../DeleteTweet'
import Comment from '../Comment'
import NewCommentForm from '../NewCommentForm'
import UpdateCommentForm from '../UpdateCommentForm'
import DeleteComment from '../DeleteComment'
import { likeTweetThunk } from '../../store/tweets'
import './SingleTweet.css'
import LoadingAnimation from '../LoadingAnimation'

const SingleTweet = ({ sessionUser }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [commentToUpdate, setCommentToUpdate] = useState({})
  const [showUpdateTweetForm, setShowUpdateTweetForm] = useState(false)
  const [showDeleteTweet, setShowDeleteTweet] = useState(false)
  const [showNewCommentForm, setShowNewCommentForm] = useState(false)
  const [showUpdateCommentForm, setShowUpdateCommentForm] = useState(false)
  const [showDeleteComment, setShowDeleteComment] = useState(false)
  const [showDropDown, setShowDropDown] = useState(false)
  const [isLikedByUser, setIsLikedByUser] = useState(false)
  const [imageModalUrl, setImageModalUrl] = useState(null)
  const dispatch = useDispatch()
  const { tweetId } = useParams()
  const history = useHistory()
  const tweet = useSelector(state => state.tweets[Number(tweetId)])

  const likesArray = tweet?.tweet_likes
  const likedTweet = likesArray?.find(like => like.user_id === sessionUser?.id)

  useEffect(() => {
    if (!tweetId) return
    setIsLoaded(false)
    ;(async function () {
      await dispatch(getSingleTweetThunk(tweetId))
      setIsLoaded(true)
    })()
  }, [dispatch, tweetId])

  useEffect(() => {
    if (!showDropDown) return;
    const closeMenu = () => {
      setShowDropDown(false);
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [showDropDown]);

  useEffect(() => {
    setIsLikedByUser(!!likedTweet)
  }, [likedTweet, tweet?.tweet_likes?.length])

  let newDate;
  let formattedDate;
  if (tweet) {
    newDate = Date.parse(tweet.created_at);
    formattedDate = format(newDate, 'hh:mm b • MMMM d, yyyy')
  }
  let user = tweet?.user
  if (isLoaded && !tweet) {
    return <Redirect to={"/home"} />
  }

  const handleLike = async (e) => {
    e.stopPropagation()
    if (!tweet) return
    if (isLikedByUser && likedTweet) {
      await fetch(`/api/likes/${likedTweet.id}`, {
        method: 'DELETE'
      })
      setIsLikedByUser(false)
      await dispatch(getSingleTweetThunk(tweet.id))
    } else {
      await dispatch(likeTweetThunk(tweet.id))
      await dispatch(getSingleTweetThunk(tweet.id))
    }
  }
  return isLoaded ? (
    <>
      <div className="single single tweet container">
        {showUpdateTweetForm && <Modal onClose={() => setShowUpdateTweetForm(false)}>
          <UpdateTweetForm tweet={tweet} sessionUser={sessionUser} setShowUpdateTweetForm={setShowUpdateTweetForm} />
        </Modal>}
        {showDeleteTweet && <Modal onClose={() => setShowDeleteTweet(false)}>
          <DeleteTweet tweet={tweet} setShowDeleteTweet={setShowDeleteTweet} />
        </Modal>}
        {showNewCommentForm && <Modal onClose={() => setShowNewCommentForm(false)}>
          <NewCommentForm showNewCommentForm={showNewCommentForm} sessionUser={sessionUser} tweet={tweet} setShowNewCommentForm={setShowNewCommentForm} />
        </Modal>}
        {showUpdateCommentForm && <Modal onClose={() => setShowUpdateCommentForm(false)}>
          <UpdateCommentForm comment={commentToUpdate} sessionUser={sessionUser} tweet={tweet} setShowUpdateCommentForm={setShowUpdateCommentForm} />
        </Modal>}
        {showDeleteComment && <Modal onClose={() => setShowDeleteComment(false)}>
          <DeleteComment comment={commentToUpdate} sessionUser={sessionUser} tweet={tweet} setShowDeleteComment={setShowDeleteComment} />
        </Modal>}
        {imageModalUrl && (
          <Modal onClose={() => setImageModalUrl(null)} contentClassName="media-modal">
            <div className='tweet-image-modal-container'>
              <img className='tweet-image-modal' src={imageModalUrl} alt="tweet attachment" />
            </div>
          </Modal>
        )}
        <div className="top single tweet-container">
          <div className='user info container'>
            <div className=' top left user-info container'>
              <img onClick={(e) => {
                e.stopPropagation()
                history.push(`/${user.username}`)
              }} className='profile-image' src={user.profileImage} alt={`${user.firstName} ${user.lastName}'s avatar`} />
            </div>
            <div className='top mid user-info container'>
              <span onClick={(e) => {
                e.stopPropagation()
                history.push(`/${user.username}`)
              }} className='tweet-name'>{user.firstName} {user.lastName}</span>
              <span onClick={(e) => {
                e.stopPropagation()
                history.push(`/${user.username}`)
              }} className='tweet username'> @{user.username} </span>
            </div>
          </div>
          {sessionUser?.id === user.id && <div className='tweet-delete-container'>
            <button
              type='button'
              className='tweet-action-button'
              aria-label='Tweet options'
              aria-haspopup='menu'
              aria-expanded={showDropDown}
              onClick={(e) => {
                e.stopPropagation()
                setShowDropDown(prev => !prev)
              }}
            >
              <img className='tweet icon delete' src={litter} alt='tweet options icon' />
            </button>
            {showDropDown && <div className='drop-down tweet' role='menu'>
              <button
                type='button'
                role='menuitem'
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDropDown(false)
                  setShowUpdateTweetForm(true)
                }}
                className='drop-down item drop-down-update'
              >
                <span className='drop-down text'>Update Tweet</span>
                <span className='drop-down icon-badge drop-down-icon-update'>
                  <img className='drop-down icon' src={stretch} alt='update tweet icon' />
                </span>
              </button>
              <button
                type='button'
                role='menuitem'
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDropDown(false)
                  setShowDeleteTweet(true)
                }}
                className='drop-down item drop-down-delete'
              >
                <span className='drop-down text'>Delete Tweet</span>
                <span className='drop-down icon-badge drop-down-icon-delete'>
                  <img className='drop-down icon' src={stretch2} alt='delete tweet icon' />
                </span>
              </button>
            </div>}
          </div>}
        </div>
        <div className='middle-tweet-container single'>
          <div className='tweet-content-container single'>
            <span className='tweet-content'>{tweet.content}</span>
          </div>
          {!!tweet.tweet_images?.length && <div className='tweet-image-container single'>
              {tweet.tweet_images.map(image => (
                <img
                  key={image.id}
                  className='tweet-image single'
                  src={image.url}
                  alt="Tweet attachment"
                  onClick={(e) => {
                    e.stopPropagation()
                    setImageModalUrl(image.url)
                  }}
                />
              ))}
          </div>}
        </div>
        <div className='date-container'>
          <span className='single tweet created-at'>{formattedDate} • Litter Web App</span>
        </div>
        <div className='single bottom-tweet-container'>
          <div onClick={(e) => {
            e.stopPropagation()
            setShowNewCommentForm(true)
          }} className='comment-info-container'>
            <div className='comment-icon-container'>
              <img className='tweet icon comment' src={commentIcon} alt="comment-icon" />
            </div >
            <div className='comment-counter'>
              <span>{tweet.tweet_comments.length}</span>
            </div>
          </div>
          <div onClick={handleLike} className='heart-info-container'>
            <div className='heart-icon-container'>
              <img className={`tweet icon heart ${likedTweet ? 'liked' : 'not-liked'}`} src={likedTweet ? fullHeartIcon : heartIcon} alt="heart-icon" />
            </div>
            <div className='comment-counter'>
              <span>{tweet.tweet_likes.length}</span>
            </div>
          </div>
        </div>
        <NewCommentForm setShowNewCommentForm={setShowNewCommentForm} sessionUser={sessionUser} tweet={tweet} />
      </div>
      <div className='comments-container'>
        {tweet.tweet_comments.length > 0 && tweet.tweet_comments.map(comment => (
          <Comment tweet={tweet} tweetOwner={user} key={comment.id} sessionUser={sessionUser} comment={comment} setShowDeleteComment={setShowDeleteComment} setShowNewCommentForm={setShowNewCommentForm} setCommentToUpdate={setCommentToUpdate} setShowUpdateCommentForm={setShowUpdateCommentForm} />
        ))}
      </div>
    </>
  ) : (
    <LoadingAnimation />
  )
}

export default SingleTweet
