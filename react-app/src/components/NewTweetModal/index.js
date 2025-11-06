import { Modal } from "../../context/Modal"
import { useState } from "react"
import NewTweetFormModal from "./NewTweetFormModal"


const NewTweetModal = ({sessionUser}) => {
  const [showNewTweetFormModal, setShowNewTweetFormModal] = useState(false)

  return (
    <>
      <button className='nav new-tweet-button' onClick={() => setShowNewTweetFormModal(true)}>
        <span>Tweet</span>
      </button>
      {showNewTweetFormModal && (
        <Modal onClose={() => setShowNewTweetFormModal(false)}>
          <NewTweetFormModal sessionUser={sessionUser} showNewTweetFormModal={showNewTweetFormModal} setShowNewTweetFormModal={setShowNewTweetFormModal}/>
        </Modal>
      )}
    </>
  )
}

export default NewTweetModal
