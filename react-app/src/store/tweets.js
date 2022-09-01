const GET_ALL_TWEETS = 'session/GET_ALL_TWEETS';


const getAllTweetsAction = (tweets) => ({
  type: GET_ALL_TWEETS,
  tweets
});


export const getAllTweetsThunk = () => async (dispatch) => {
  const response = await fetch('/api/tweets/home');

  if (response.ok) {
    const tweets = await response.json();
    dispatch(getAllTweetsAction(tweets))
    return tweets;
  } else if (response.status < 500) {
    const data = await response.json();
    if (data.errors) {
      return data.errors;
    }
  } else {
    return ['An error occurred. Please try again.']
  }
}


export default function tweetsReducer(state = {}, action) {
  switch (action.type) {
    case GET_ALL_TWEETS: {
      const newState = {};
      action.tweets.tweets.forEach(tweet => {
        newState[tweet.id] = tweet
      });
      newState.tweetsList = [...action.tweets.tweets]
      return newState;
    }
    default:
      return state;
  }
}