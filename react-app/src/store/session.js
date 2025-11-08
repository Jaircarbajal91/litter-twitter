// constants
const SET_USER = 'session/SET_USER';
const REMOVE_USER = 'session/REMOVE_USER';
const FOLLOW_USER = 'session/FOLLOW_USER'
const UNFOLLOW_USER = 'session/UNFOLLOW_USER'

const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

const removeUser = () => ({
  type: REMOVE_USER,
})

const followUser = (id) => ({
  type: FOLLOW_USER,
  id
})

const unfollowUser = (id) => ({
  type: UNFOLLOW_USER,
  id
})

const initialState = { user: null };

export const authenticate = () => async (dispatch) => {
  const response = await fetch('/api/auth/', {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (response.ok) {
    const data = await response.json();
    if (data.errors) {
      return;
    }

    dispatch(setUser(data));
  }
}

export const login = (email, password) => async (dispatch) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  });


  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data))
    return null;
  } else if (response.status < 500) {
    const data = await response.json();
    if (data.errors) {
      return data.errors;
    }
  } else {
    return ['An error occurred. Please try again.']
  }

}

export const logout = () => async (dispatch) => {
  const response = await fetch('/api/auth/logout', {
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (response.ok) {
    dispatch(removeUser());
  }
};


export const followUserThunk = (id) => async (dispatch) => {
  const response = await fetch(`/api/follows/${id}`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    }
  });
  if (response.ok) {
    const data = await response.json();
    await dispatch(followUser(id))
    return data.user;
  } else if (response.status < 500) {
    const data = await response.json();
    if (data.errors) {
      return data.errors;
    }
  } else {
    return ['An error occurred. Please try again.']
  }
};


export const unfollowUserThunk = (id) => async (dispatch) => {
  const response = await fetch(`/api/follows/unfollow/${id}`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    }
  });
  if (response.ok) {
    const data = await response.json();
    await dispatch(unfollowUser(id))
    return data.user;
  } else if (response.status < 500) {
    const data = await response.json();
    if (data.errors) {
      return data.errors;
    }
  } else {
    return ['An error occurred. Please try again.']
  }
};



export const signUp = (username, email, password, firstName, lastName, profileImage) => async (dispatch) => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
      firstName,
      lastName,
      profileImage
    }),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data))
    return null;
  } else if (response.status < 500) {
    const data = await response.json();
    if (data.errors) {
      return data.errors;
    }
  } else {
    return ['An error occurred. Please try again.']
  }
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { user: action.payload }
    case REMOVE_USER:
      return { user: null }
    case FOLLOW_USER: {
      if (!state.user) return state;
      const following = new Set(state.user.following || []);
      following.add(action.id);
      return {
        user: {
          ...state.user,
          following: Array.from(following)
        }
      };
    }
    case UNFOLLOW_USER: {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          following: (state.user.following || []).filter(
            (followedId) => followedId !== action.id
          )
        }
      };
    }
    default:
      return state;
  }
}
