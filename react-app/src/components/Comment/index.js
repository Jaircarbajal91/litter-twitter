import { useState, useEffect } from "react";
import { formatDistanceToNow } from 'date-fns'
import { useHistory } from "react-router-dom";
import litter from '../../assets/images/threeDots.svg'
import stretch from '../../assets/images/stretch.png'
import stretch2 from '../../assets/images/stretch2.png'
import { Modal } from '../../context/Modal'
import './Comment.css'

const Comment = ({ tweet, comment, sessionUser, tweetOwner, setCommentToUpdate, setShowUpdateCommentForm, setShowDeleteComment }) => {
  const [showDropDown, setShowDropDown] = useState(false)
  const [imageModalUrl, setImageModalUrl] = useState(null)
  const history = useHistory()

  useEffect(() => {
    if (!showDropDown) return;
    const closeMenu = () => {
      setShowDropDown(false);
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [showDropDown]);


  const newDate = Date.parse(comment.created_at);
  const formattedDate = formatDistanceToNow(newDate, { includeSeconds: true })
  const user = comment.user

  if (!user) return null

  return (
    <div className="tweet-container comment">
      {imageModalUrl && (
        <Modal onClose={() => setImageModalUrl(null)} contentClassName="media-modal">
          <div className='tweet-image-modal-container'>
            <img className='tweet-image-modal' src={imageModalUrl} alt="reply attachment" />
          </div>
        </Modal>
      )}
      <div className='tweet-left-container'>
        <img onClick={(e) => {
          e.stopPropagation()
          history.push(`/${user.username}`)
        }} className='profile-image' src={user.profileImage} alt="" />
      </div>
      <div className='tweet-right-container comment'>
        <div className='top-tweet-container'>
          <div className='tweet-user-info'>
            <div className="name-container">
              <span onClick={(e) => {
                e.stopPropagation()
                history.push(`/${user.username}`)
              }} className='tweet-name'>{user.firstName} {user.lastName}</span>
            </div>
            <span onClick={(e) => {
              e.stopPropagation()
              history.push(`/${user.username}`)
            }} className='tweet username'> @{user.username} </span>
            <span className='tweet created-at'>• {formattedDate} ago</span>
          </div>
          {sessionUser?.id === comment.user_id && <div className='tweet-delete-container'>
            <div className='tweet icon delete container' onClick={(e) => {
              e.stopPropagation()
              setShowDropDown(prev => !prev)
            }}>
              <img className="tweet icon delete" src={litter} alt="delete-icon" />
            </div>
            {showDropDown && <div className='drop-down tweet'>
              <div onClick={(e) => {
                e.stopPropagation()
                setCommentToUpdate(comment)
                setShowUpdateCommentForm(true)
              }} className='drop-down item'>
                <span className='drop-down text'>Update Reply</span>
                <span className='drop-down icon-badge drop-down-icon-update'>
                  <img className='drop-down icon' src={stretch} alt="strech icon" />
                </span>
              </div>
              <div onClick={(e) => {
                e.stopPropagation()
                setCommentToUpdate(comment)
                setShowDeleteComment(true)
              }} className='drop-down item'>
                <span className='drop-down text'>Delete Reply</span>
                <span className='drop-down icon-badge drop-down-icon-delete'>
                  <img className='drop-down icon' src={stretch2} alt="strech icon" />
                </span>
              </div>
            </div>}
          </div>}
        </div>
        <div className='replying-to content comment'>
          <span>Replying to </span>
          <span>@{tweet.user.username}</span>
        </div>
        <div className='middle-tweet-container'>
          <div className='tweet-content-container'>
            <span className='tweet-content comment'>{comment.content}</span>
          </div>
          {comment.comment_images.length > 0 && <div className='tweet-image-container'>
            {comment.comment_images.map(image => (
              <img
                key={image.id}
                className='tweet-image'
                src={image.url}
                alt=""
                onClick={(e) => {
                  e.stopPropagation()
                  setImageModalUrl(image.url)
                }}
              />
            ))}
          </div>}
        </div>
        {/* <div className='bottom-tweet-container comment'>
          <div onClick={(e) => {
            e.stopPropagation()
            // history.push(`/tweets/${tweet.id}`)
          }} className='comment-info-container'>
            <div className='comment-icon-container'>
              <img className='tweet icon comment' src={commentIcon} alt="comment-icon" />
            </div >
              <div className='comment-counter'>
                {/* <span>{tweet.tweet_comments.length}</span> */}
        {/* </div>
          </div>
          <div className='heart-icon-container'>
            <img className='tweet icon heart' src={heartIcon} alt="heart-icon" />
          </div> */}
        {/* // </div> */}
      </div>
    </div>
  )
}

export default Comment
