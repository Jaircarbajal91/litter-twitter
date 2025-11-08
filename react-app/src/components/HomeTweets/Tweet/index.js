import { intlFormatDistance } from 'date-fns'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import commentIcon from '../../../assets/images/commentIcon.svg'
import heartIcon from '../../../assets/images/heartIcon.svg'
import fullHeartIcon from '../../../assets/images/FullHeart.svg'
import litter from '../../../assets/images/threeDots.svg'
import stretch from '../../../assets/images/stretch.png'
import stretch2 from '../../../assets/images/stretch2.png'
import { likeTweetThunk } from '../../../store/tweets'
import { useDispatch } from 'react-redux'
import './Tweet.css'

const Tweet = ({ setTweet, tweet, sessionUser, setShowDeleteTweet, setShowUpdateTweetForm }) => {
  const [showDropDown, setShowDropDown] = useState(false)
  const [isLikedByUser, setIsLikedByUser] = useState(false)
  const [likeCounter, setLikeCounter] = useState(tweet.tweet_likes.length)
  const [likedTweet, setLikedTweet] = useState(() =>
    tweet.tweet_likes.find(like => like.user_id === sessionUser?.id) || null
  )
  const newDate = Date.parse(tweet.created_at);
  const formattedDate = intlFormatDistance(new Date(newDate), new Date())
  const history = useHistory()
  const { user } = tweet
  const { firstName, lastName, profileImage, username, id } = user

  const dispatch = useDispatch()

  useEffect(() => {
    if (!showDropDown) return;
    const closeMenu = () => {
      setShowDropDown(false);
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [showDropDown]);

  useEffect(() => {
    setIsLikedByUser(Boolean(likedTweet))
  }, [likedTweet])

  useEffect(() => {
    setLikeCounter(tweet.tweet_likes.length)
    setLikedTweet(tweet.tweet_likes.find(like => like.user_id === sessionUser?.id) || null)
  }, [sessionUser?.id, tweet.tweet_likes])

  const handleLike = async (e) => {
    e.stopPropagation()
    if (isLikedByUser && likedTweet) {
      await fetch(`/api/likes/${likedTweet.id}`, {
        method: 'DELETE'
      })
      setIsLikedByUser(false)
      setLikeCounter((prev) => prev - 1)
      setLikedTweet(null)
    } else {
      const like = await dispatch(likeTweetThunk(tweet.id))
      setIsLikedByUser(true)
      setLikedTweet(like)
      setLikeCounter((prev) => prev + 1)
    }
  }
  return (
    <div onClick={() => history.push(`/tweets/${tweet.id}`)} className='tweet-container'>
      <div className='tweet-left-container'>
        <img onClick={(e) => {
          e.stopPropagation()
          history.push(`/${username}`)
        }} className='profile-image' src={profileImage} alt={`${username}'s avatar`} />
      </div>
      <div className='tweet-right-container'>
        <div className='top-tweet-container'>
          <div className='tweet-user-info'>
            <div className='name-container'>
              <span onClick={(e) => {
                e.stopPropagation()
                history.push(`/${username}`)
              }} className='tweet-name'>{firstName} {lastName}</span>
            </div>
            <span onClick={(e) => {
              e.stopPropagation()
              history.push(`/${username}`)
            }} className='tweet username'> @{username} </span>
            <span className='tweet created-at'>• {formattedDate}</span>
          </div>
          {sessionUser.id === id && <div className='tweet-delete-container'>
            <div className='tweet icon delete container' onClick={(e) => {
              e.stopPropagation()
              setShowDropDown(prev => !prev)
            }}>
              <img className="tweet icon delete" src={litter} alt="delete-icon" />
            </div>
            {showDropDown && <div className='drop-down tweet'>
              <div onClick={(e) => {
                e.stopPropagation()
                setTweet(tweet)
                setShowUpdateTweetForm(true)
              }} className='drop-down item'>
                <span className='drop-down text'>Update Tweet</span>
                <span className='drop-down icon-badge drop-down-icon-update'>
                  <img className='drop-down icon' src={stretch} alt="strech icon" />
                </span>
              </div>
              <div onClick={(e) => {
                e.stopPropagation()
                setTweet(tweet)
                setShowDeleteTweet(true)
              }} className='drop-down item'>
                <span className='drop-down text'>Delete Tweet</span>
                <span className='drop-down icon-badge drop-down-icon-delete'>
                  <img className='drop-down icon' src={stretch2} alt="strech icon" />
                </span>
              </div>
            </div>}
          </div>}
        </div>
        <div className='middle-tweet-container'>
          <div className='tweet-content-container'>
            <span className='tweet-content'>{tweet.content}</span>
          </div>
          {tweet.tweet_images.length > 0 && <div className='tweet-image-container'>
              {tweet.tweet_images.map(image => (
                <img key={image.id} className='tweet-image' src={image.url} alt="Tweet attachment" />
              ))}
          </div>}
        </div>
        <div className='bottom-tweet-container'>
          <div onClick={(e) => {
            e.stopPropagation()
            history.push(`/tweets/${tweet.id}`)
          }} className='comment-info-container'>
            <div className='comment-icon-container'>
              <img className='tweet icon comment' src={commentIcon} alt="comment-icon" />
            </div >
            <div className='comment-counter'>
              <span>{tweet.tweet_comments.length}</span>
            </div>
          </div>
          <div onClick={handleLike} className={`heart-info-container`}>
            <div className='heart-icon-container'>
              <img className={`tweet icon heart ${likedTweet ? 'liked' : 'not-liked'}`} src={likedTweet ? fullHeartIcon : heartIcon} alt="heart-icon" />
            </div>
            <div className='comment-counter'>
              <span>{likeCounter}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tweet
