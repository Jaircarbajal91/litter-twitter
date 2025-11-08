import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState, useRef, useCallback } from 'react'
import { getAllTweetsThunk } from '../../store/tweets'
import UpdateTweetForm from '../UpdateTweetForm'
import DeleteTweet from '../DeleteTweet'
import { Modal } from '../../context/Modal'
import LoadingAnimation from '../LoadingAnimation'
import Tweet from './Tweet'

const HomeTweets = ({ sessionUser }) => {
  const [tweetsLoaded, setTweetsLoaded] = useState(false)
  const [tweet, setTweet] = useState({})
  const [showUpdateTweetForm, setShowUpdateTweetForm] = useState(false)
  const [showDeleteTweet, setShowDeleteTweet] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [hasUserScrolled, setHasUserScrolled] = useState(false)
  const dispatch = useDispatch()
  const tweets = useSelector(state => state.tweets.tweetsList || [])
  const hasMore = useSelector(state => {
    const hasMoreValue = state.tweets.hasMore
    // Default to true if undefined (we don't know yet), false only if explicitly false
    return hasMoreValue !== false
  })
  const currentPage = useSelector(state => state.tweets.currentPage || 1)
  const observerTarget = useRef(null)
  const lastLoadTimeRef = useRef(0)

  // Track user scroll to prevent immediate triggering
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHasUserScrolled(true)
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Initial load - only run when sessionUser is available
  useEffect(() => {
    if (sessionUser) {
      setTweetsLoaded(false)
      setInitialLoadComplete(false)
      setHasUserScrolled(false)
      dispatch(getAllTweetsThunk(1, 20)).then(() => {
        setTweetsLoaded(true)
        // Wait a bit before allowing infinite scroll to prevent immediate triggering
        setTimeout(() => {
          setInitialLoadComplete(true)
        }, 1000)
      })
    }
  }, [dispatch, sessionUser])

  // Infinite scroll handler with rate limiting
  const loadMoreTweets = useCallback(async () => {
    if (loadingMore || !hasMore) return
    
    // Rate limit: don't load if last load was less than 1 second ago
    const now = Date.now()
    if (now - lastLoadTimeRef.current < 1000) {
      console.log('Rate limiting: too soon since last load')
      return
    }
    
    setLoadingMore(true)
    lastLoadTimeRef.current = now
    const nextPage = currentPage + 1
    try {
      await dispatch(getAllTweetsThunk(nextPage, 20))
    } catch (error) {
      console.error('Error loading more tweets:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [dispatch, currentPage, hasMore, loadingMore])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    // Don't set up observer until initial load is complete and user has scrolled
    if (!tweetsLoaded || !initialLoadComplete) return

    const currentTarget = observerTarget.current
    if (!currentTarget) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Only trigger if user has scrolled (not immediately visible on page load)
        if (entry.isIntersecting && !loadingMore && hasMore && hasUserScrolled) {
          console.log('Triggering load more tweets, page:', currentPage + 1, 'hasMore:', hasMore)
          loadMoreTweets()
        }
      },
      { 
        threshold: 0,
        rootMargin: '300px' // Start loading when 300px away from bottom (more conservative)
      }
    )

    observer.observe(currentTarget)

    return () => {
      observer.unobserve(currentTarget)
    }
  }, [tweetsLoaded, initialLoadComplete, loadMoreTweets, loadingMore, hasMore, currentPage, hasUserScrolled])

  return tweetsLoaded ? (
    <div className='tweets-container'>
      {showUpdateTweetForm && <Modal onClose={() => setShowUpdateTweetForm(false)}>
        <UpdateTweetForm tweet={tweet} sessionUser={sessionUser} setShowUpdateTweetForm={setShowUpdateTweetForm} />
      </Modal>}
      {showDeleteTweet && <Modal onClose={() => setShowDeleteTweet(false)}>
        <DeleteTweet tweet={tweet} setShowDeleteTweet={setShowDeleteTweet} />
      </Modal>}
      {tweets.map(tweet => (
        <Tweet key={tweet.id} setTweet={setTweet} sessionUser={sessionUser} tweet={tweet} setShowUpdateTweetForm={setShowUpdateTweetForm}  setShowDeleteTweet={setShowDeleteTweet}/>
      ))}
      <div 
        ref={observerTarget} 
        className="infinite-scroll-trigger" 
        style={{ 
          minHeight: '100px', 
          padding: '20px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          width: '100%'
        }}
      >
        {loadingMore && <LoadingAnimation />}
        {!hasMore && tweets.length > 0 && !loadingMore && (
          <div style={{ color: 'var(--text-secondary)' }}>No more tweets to load</div>
        )}
      </div>
    </div>
  ) : (
    <LoadingAnimation />
  )
}

export default HomeTweets
