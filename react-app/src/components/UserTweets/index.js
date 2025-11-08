import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { getUserTweetsThunk } from "../../store/tweets";
import { followUserThunk, unfollowUserThunk } from "../../store/session";
import Tweet from "../HomeTweets/Tweet";
import { Modal } from "../../context/Modal";
import DeleteTweet from "../DeleteTweet";
import UpdateTweetForm from "../UpdateTweetForm";
import LoadingAnimation from "../LoadingAnimation";
import sadCatIcon from "../../assets/images/sadCat.svg";
import defaultBanner from "../../assets/images/cats.jpg";
import defaultAvatar from "../../assets/images/BlueCatIcon.svg";
import "./UserTweets.css";

const extractSafeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    followers: Array.isArray(user.followers) ? [...user.followers] : [],
    following: Array.isArray(user.following) ? [...user.following] : [],
  };
};

const UserTweets = ({ sessionUser, onProfileUpdate }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [activeTweet, setActiveTweet] = useState(null);
  const [showUpdateTweetForm, setShowUpdateTweetForm] = useState(false);
  const [showDeleteTweet, setShowDeleteTweet] = useState(false);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  const tweetList = useSelector(
    (state) => state.tweets.userTweets?.userTweetsList ?? []
  );

  const isViewingOwnProfile = profile && sessionUser?.id === profile.id;

  const isFollowing = useMemo(() => {
    if (!profile || !sessionUser) return false;
    return profile.followers?.includes(sessionUser.id) ?? false;
  }, [profile, sessionUser]);

  const followerCount = profile?.followers?.length ?? 0;
  const followingCount = profile?.following?.length ?? 0;
  const tweetCount = tweetList.length;

  const profileUpdateRef = useRef(onProfileUpdate);

  useEffect(() => {
    profileUpdateRef.current = onProfileUpdate;
  }, [onProfileUpdate]);

  useEffect(() => {
    if (showDeleteTweet || showUpdateTweetForm) return;
    let ignore = false;

    const fetchTweets = async () => {
      setIsLoaded(false);
      setProfile(null);
      const data = await dispatch(getUserTweetsThunk(username));
      if (ignore) return;

      if (!data || Array.isArray(data) || data.error) {
        const errorMessage = Array.isArray(data)
          ? data[0]
          : data?.error || "We had trouble loading this cat's tweets.";
        setError(errorMessage);
        setProfile(null);
        setIsLoaded(true);
        return;
      }

      if (data.user) {
        const safeUser = extractSafeUser(data.user);
        setProfile(safeUser);
        if (profileUpdateRef.current) {
          profileUpdateRef.current(safeUser);
        }
      } else {
        setProfile(null);
      }

      setError(null);
      setIsLoaded(true);
    };

    fetchTweets();

    return () => {
      ignore = true;
    };
  }, [dispatch, username, showDeleteTweet, showUpdateTweetForm]);

  useEffect(() => {
    if (!profile) return;

    const previousTitle = document.title;
    const displayName = [profile.firstName, profile.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    document.title = displayName
      ? `${displayName} (@${profile.username}) / Litter`
      : `@${profile.username} / Litter`;

    return () => {
      document.title = previousTitle;
    };
  }, [profile]);

  const handleFollow = async () => {
    if (!profile || !sessionUser || isUpdatingFollow) return;
    setIsUpdatingFollow(true);

    const action = isFollowing ? unfollowUserThunk : followUserThunk;
    const result = await dispatch(action(profile.id));
    setIsUpdatingFollow(false);

    if (!result || result.errors || result.message) {
      return;
    }

    const updatedProfile = extractSafeUser(result);
    setProfile(updatedProfile);
    if (profileUpdateRef.current) {
      profileUpdateRef.current(updatedProfile);
    }
  };

  const shouldShowLoading = !isLoaded || !profile;

  if (error && !profile) {
    return (
      <div className="home user profile tweets container">
        <div className="profile-state profile-state--error">
          <img src={sadCatIcon} alt="Sad cat illustration" />
          <div>
            <h2>We couldn&apos;t find that cat.</h2>
            <p>{error}</p>
            <button
              type="button"
              className="profile-back-button"
              onClick={() => history.push("/home")}
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home user profile tweets container">
      {showUpdateTweetForm && (
        <Modal onClose={() => setShowUpdateTweetForm(false)}>
          <UpdateTweetForm
            tweet={activeTweet}
            sessionUser={sessionUser}
            setShowUpdateTweetForm={setShowUpdateTweetForm}
          />
        </Modal>
      )}
      {showDeleteTweet && (
        <Modal onClose={() => setShowDeleteTweet(false)}>
          <DeleteTweet
            username={username}
            tweet={activeTweet}
            setShowDeleteTweet={setShowDeleteTweet}
          />
        </Modal>
      )}

      {error && profile ? (
        <div className="profile-state profile-state--warning">
          <p>{error}</p>
        </div>
      ) : null}

      {shouldShowLoading ? (
        <div className="profile-loading">
          <LoadingAnimation />
        </div>
      ) : (
        <div className="profile-page">
          <header className="profile-header">
            <div className="profile-banner">
              <img
                src={profile.profileBannerImage || defaultBanner}
                alt="Profile banner"
                onError={(event) => {
                  event.currentTarget.src = defaultBanner;
                }}
              />
              <div className="profile-avatar">
                <img
                  src={profile.profileImage || defaultAvatar}
                  alt={`${profile.firstName ?? ""} ${profile.lastName ?? ""}`}
                  onError={(event) => {
                    event.currentTarget.src = defaultAvatar;
                  }}
                />
              </div>
            </div>
            <div className="profile-header-body">
              <div className="profile-identity">
                <h1>
                  {profile.firstName} {profile.lastName}
                </h1>
                <span className="profile-username">@{profile.username}</span>
              </div>
              {!isViewingOwnProfile && (
                <button
                  type="button"
                  className={`profile-follow-button ${
                    isFollowing ? "following" : ""
                  }`}
                  onClick={handleFollow}
                  disabled={isUpdatingFollow}
                >
                  {isUpdatingFollow
                    ? "Updating..."
                    : isFollowing
                    ? "Following"
                    : "Follow"}
                </button>
              )}
            </div>
            {profile.email && (
              <a
                className="profile-email-link"
                href={`mailto:${profile.email}`}
              >
                {profile.email}
              </a>
            )}
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-count">{tweetCount}</span>
                <span className="profile-stat-label">Tweets</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-count">{followingCount}</span>
                <span className="profile-stat-label">Following</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-count">{followerCount}</span>
                <span className="profile-stat-label">Followers</span>
              </div>
            </div>
          </header>

          <section className="profile-feed">
            {tweetList.length > 0 ? (
              tweetList.map((tweet) => (
                <Tweet
                  key={tweet.id}
                  setTweet={setActiveTweet}
                  sessionUser={sessionUser}
                  tweet={tweet}
                  setShowUpdateTweetForm={setShowUpdateTweetForm}
                  setShowDeleteTweet={setShowDeleteTweet}
                />
              ))
            ) : (
              <div className="profile-empty-state">
                <img src={sadCatIcon} alt="Sad cat" />
                <h3>This cat hasn&apos;t posted yet.</h3>
                <p>Once they start tweeting, their updates will live here.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default UserTweets;
