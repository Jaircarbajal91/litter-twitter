import React, { useEffect, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { getUserTweetsThunk } from '../store/tweets';
import { useDispatch, useSelector } from 'react-redux';
import { followUserThunk, unfollowUserThunk, authenticate } from '../store/session';
import './UserList.css'

function UsersList({ sessionUser }) {
  const [users, setUsers] = useState([]);
  const [followingStatus, setFollowingStatus] = useState({});
  const [loadingFollows, setLoadingFollows] = useState({});
  const history = useHistory()
  const dispatch = useDispatch()
  const currentUser = useSelector(state => state.session.user);

  useEffect(() => {
    async function fetchData() {
      if (sessionUser) {
        const response = await fetch('/api/users/');
        const responseData = await response.json();
        setUsers(responseData.users);
        
        // Initialize following status
        const status = {};
        responseData.users.forEach(user => {
          if (currentUser && currentUser.following) {
            status[user.id] = currentUser.following.includes(user.id);
          }
        });
        setFollowingStatus(status);
      }
    }
    fetchData();
  }, [sessionUser, currentUser]);

  const handleFollow = async (e, userId) => {
    e.stopPropagation();
    setLoadingFollows(prev => ({ ...prev, [userId]: true }));
    
    try {
      if (followingStatus[userId]) {
        await dispatch(unfollowUserThunk(userId));
        setFollowingStatus(prev => ({ ...prev, [userId]: false }));
      } else {
        await dispatch(followUserThunk(userId));
        setFollowingStatus(prev => ({ ...prev, [userId]: true }));
      }
      // Refresh user session to update following list
      await dispatch(authenticate());
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setLoadingFollows(prev => ({ ...prev, [userId]: false }));
    }
  };

  const filteredUsers = users.filter(user => sessionUser.id !== user.id).slice(0, 5)
  const userComponents = filteredUsers.map((user) => {
    const isFollowing = followingStatus[user.id] || false;
    const isLoading = loadingFollows[user.id] || false;
    
    return (
      <div 
        onClick={() => history.push(`/${user.username}`)} 
        className='other-users links' 
        key={user.id}
      >
        <div className="user-list-profile-section">
          <img 
            className='profile-image user-list' 
            src={user.profileImage} 
            alt={`${user.firstName} ${user.lastName}`}
            onClick={(e) => {
              e.stopPropagation();
              history.push(`/${user.username}`);
            }}
          />
          <div className="user-list-info">
            <div 
              className="user-list-name"
              onClick={(e) => {
                e.stopPropagation();
                history.push(`/${user.username}`);
              }}
            >
              {user.firstName} {user.lastName}
            </div>
            <div 
              className="user-list-username"
              onClick={(e) => {
                e.stopPropagation();
                history.push(`/${user.username}`);
              }}
            >
              @{user.username}
            </div>
          </div>
        </div>
        <button
          className={`follow-button ${isFollowing ? 'following' : ''}`}
          onClick={(e) => handleFollow(e, user.id)}
          disabled={isLoading}
        >
          {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    );
  });

  return (
    <div className='users-list container'>
      <h2>Say Meow to others!</h2>
      <div className='users-list wrapper'>{userComponents}</div>
    </div>
  );
}

export default UsersList;
