import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { getAllTweetsThunk } from '../../store/tweets'
import Tweet from './Tweet'

const HomeTweets = ({sessionUser}) => {
  const [tweetsLoaded, setTweetsLoaded] = useState(false)
  const dispatch = useDispatch()
  const tweets = useSelector(state => state.tweets.tweetsList)
  useEffect(() => {
    if (sessionUser) {
      dispatch(getAllTweetsThunk()).then(() => setTweetsLoaded(true))
    }
  }, [dispatch, tweets?.length])
  return tweetsLoaded && (
    <div>
      {tweets.map(tweet => (
        <Tweet key={tweet.id} tweet={tweet} />
      ))}
    </div>
  )
}

export default HomeTweets