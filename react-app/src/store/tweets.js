const GET_ALL_TWEETS = 'tweets/GET_ALL_TWEETS';
const GET_SINGLE_TWEET = 'tweets/GET_SINGLE_TWEET';
const GET_USER_TWEETS = 'tweets/GET_USER_TWEETS';
const CREATE_NEW_TWEET = 'tweets/CREATE_NEW_TWEET';
const UPDATE_TWEET = 'tweets/UPDATE_TWEET';
const DELETE_TWEET = 'tweets/DELETE_TWEET';
const LIKE_TWEET = 'tweets/LIKE_TWEET';


const getAllTweetsAction = (data, replace = false) => ({
  type: GET_ALL_TWEETS,
  tweets: data,
  replace
});

const getSingleTweetAction = (tweet) => ({
  type: GET_SINGLE_TWEET,
  tweet
});

const getUserTweetsAction = (tweets) => ({
  type: GET_USER_TWEETS,
  tweets
});

const createNewTweetAction = (tweet) => ({
  type: CREATE_NEW_TWEET,
  tweet
});

const updateTweetAction = (tweet) => ({
  type: UPDATE_TWEET,
  tweet
});

const deleteTweetAction = (id) => ({
  type: DELETE_TWEET,
  id
});

const likeTweetAction = (like) => ({
  type: LIKE_TWEET,
  like
})


export const getAllTweetsThunk = (page = 1, perPage = 20) => async (dispatch) => {
  const response = await fetch(`/api/tweets/home?page=${page}&per_page=${perPage}`);

  if (response.ok) {
    const data = await response.json();
    await dispatch(getAllTweetsAction(data, page === 1))
    return data;
  } else if (response.status < 500) {
    const data = await response.json();
    if (data.errors) {
      return data.errors;
    }
  } else {
    return ['An error occurred. Please try again.']
  }
}

export const getSingleTweetThunk = (tweetId) => async (dispatch) => {
  const response = await fetch(`/api/tweets/detail/${tweetId}`);

  if (response.ok) {
    const tweet = await response.json();
    await dispatch(getSingleTweetAction(tweet));
    return tweet;
  } else if (response.status < 500) {
    const data = await response.json();
    if (data.errors) {
      return data.errors;
    }
  } else {
    return ['An error occurred. Please try again.']
  }
}

export const getUserTweetsThunk = (username) => async (dispatch) => {
  const response = await fetch(`/api/tweets/${username}`);

  if (response.ok) {
    const tweets = await response.json();
    await dispatch(getUserTweetsAction(tweets))
    return tweets;
  } else if (response.status < 500) {
    const data = await response.json();
    if (data.errors) {
      return data.errors;
    }
    return data;
  } else {
    return ['An error occurred. Please try again.']
  }
}

export const createNewTweetThunk = (content) => async (dispatch) => {
  const response = await fetch('/api/tweets', {
    method: "POST",
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({ content })
  });

  if (response.ok) {
    const tweet = await response.json();
    await dispatch(createNewTweetAction(tweet))
    return tweet;
  } else if (response.status < 500) {
    const data = await response.json();
    if (data.errors) {
      return data.errors;
    }
  } else {
    return ['An error occurred. Please try again.']
  }
}

export const updateTweetThunk = (id, content) => async (dispatch) => {
  const response = await fetch(`/api/tweets/${id}`, {
    method: "PUT",
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({ content })
  });

  if (response.ok) {
    const tweet = await response.json();
    await dispatch(updateTweetAction(tweet))
    return tweet;
  } else if (response.status < 500) {
    const data = await response.json();
    if (data.errors) {
      return data.errors;
    }
  } else {
    return ['An error occurred. Please try again.']
  }
}

export const likeTweetThunk = (id) => async (dispatch) => {
  const response = await fetch(`/api/tweets/${id}/like`, {
    method: "POST"
  });
  if (response.ok) {
    const like = await response.json();
    await dispatch(likeTweetAction(like))
    return like;
  } else if (response.status < 500) {
    const data = await response.json();
    if (data.errors) {
      return data.errors;
    }
  } else {
    return ['An error occurred. Please try again.']
  }
}

export const deleteTweetThunk = (id) => async (dispatch) => {
  const response = await fetch(`/api/tweets/${id}`, {
    method: "DELETE"
  });

  if (response.ok) {
    const deletedTweet = await response.json();
    await dispatch(deleteTweetAction(id))
    return deletedTweet;
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
      const newState = action.replace ? {} : { ...state };
      const tweets = action.tweets.tweets || [];
      
      // Add tweets to normalized state
      tweets.forEach(tweet => {
        newState[tweet.id] = tweet
      });
      
      // Update tweetsList - either replace or append
      if (action.replace) {
        newState.tweetsList = [...tweets].sort(function (a, b) {
          return new Date(b.created_at) - new Date(a.created_at);
        });
      } else {
        // Merge with existing tweets, avoiding duplicates
        const existingIds = new Set((state.tweetsList || []).map(t => t.id));
        const newTweets = tweets.filter(t => !existingIds.has(t.id));
        newState.tweetsList = [...(state.tweetsList || []), ...newTweets].sort(function (a, b) {
          return new Date(b.created_at) - new Date(a.created_at);
        });
      }
      
      // Sort comments for each tweet
      if (newState.tweetsList) {
        newState.tweetsList.forEach(tweet => {
          if (tweet.tweet_comments) {
            tweet.tweet_comments.sort(function (a, b) {
              return new Date(b.created_at) - new Date(a.created_at);
            })
          }
        })
      }
      
      // Store pagination info
      newState.hasMore = action.tweets.has_more === true || action.tweets.has_more === 'true'
      newState.currentPage = action.tweets.page || 1;
      
      return newState;
    }
    case GET_USER_TWEETS: {
      const newState = { ...state }
      newState.userTweets = {}
      action.tweets.tweets.forEach(tweet => {
        newState.userTweets[tweet.id] = tweet
      })
      newState.userTweets.userTweetsList = [...action.tweets.tweets].sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      })
      newState.userTweets.userTweetsList.forEach(tweet => {
        tweet.tweet_comments.sort(function (a, b) {
          return new Date(b.created_at) - new Date(a.created_at);
        })
      })
      return newState
    }
    case CREATE_NEW_TWEET: {
      const newState = { ...state }
      newState[action.tweet.id] = action.tweet
      return newState
    }
    case GET_SINGLE_TWEET: {
      const newState = { ...state };
      newState[action.tweet.id] = action.tweet;
      return newState;
    }
    case UPDATE_TWEET: {
      const newState = { ...state }
      newState[action.tweet.id] = action.tweet
      return newState
    }
    case DELETE_TWEET: {
      const newState = { ...state }
      delete newState[action.id]
      return newState
    }
    case LIKE_TWEET: {
      const newState = { ...state }
      return newState;
    }
    default:
      return state;
  }
}
