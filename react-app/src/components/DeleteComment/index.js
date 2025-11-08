import { useDispatch } from "react-redux";
import { getSingleTweetThunk } from "../../store/tweets";
import { useState, useEffect } from "react";
import handleDeleteImage from "../../utils/DeleteImage";
import ButtonLoadingAnimation from "../LoadingAnimation/ButtonLoadingAnimation";

const DeleteComment = ({ setShowDeleteComment, comment }) => {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    return () => setIsDeleting(false)
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    if (comment.comment_images.length) {
      await handleDeleteImage(dispatch, comment.comment_images[0].id, comment.comment_images[0].key)
    }
    const res = await fetch(`/api/comments/${comment.id}`, {
      method: 'DELETE'
    })
    if (res.ok) {
      await dispatch(getSingleTweetThunk(comment.tweet_id));
      setShowDeleteComment(false);
    } else {
      const data = await res.json()
      console.log(data)
    }
  }
  return (
    <div className="delete-tweet container">
      <h2>Are you sure you want to delete this comment?</h2>
      <div className={isDeleting ? "delete-tweet buttons container loading" : "delete-tweet buttons container"}>
        {isDeleting ? <ButtonLoadingAnimation /> :
          <>
            <button className='delete-tweet button no' onClick={() => setShowDeleteComment(false)}>Cancel</button>
            <button className='delete-tweet button yes' onClick={handleDelete}>Delete</button>
          </>
        }
      </div>
    </div>
  )
}

export default DeleteComment
