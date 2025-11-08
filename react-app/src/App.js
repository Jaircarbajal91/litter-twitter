import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UsersList from './components/UsersList';
import { authenticate } from './store/session';
import SplashPage from './components/SplashPage';
import HomeTweets from './components/HomeTweets';
import NewTweetForm from './components/NewTweetForm';
import UserTweets from './components/UserTweets';
import { Modal } from './context/Modal'
import SingleTweet from './components/SingleTweet';
import PageNotFound from './components/PageNotFound';
import './index.css'

function App() {
  const [loaded, setLoaded] = useState(false);
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showNewTweetForm, setShowNewTweetForm] = useState(false)
  const dispatch = useDispatch();



  const sessionUser = useSelector(state => state.session.user)
  useEffect(() => {
    (async () => {
      await dispatch(authenticate());
      setLoaded(true);

    })();
  }, [dispatch]);

  if (!loaded) {
    return null;
  }

  return (
    <div className={`main-content-container ${sessionUser !== null}`}>
      <BrowserRouter>
        {sessionUser && <NavBar sessionUser={sessionUser} />}
        <Switch>
          <Route path='/' exact={true}>
            <SplashPage sessionUser={sessionUser} setShowSignup={setShowSignup} setShowLogin={setShowLogin} />
            {showLogin && <Modal onClose={() => setShowLogin(false)}>
              <LoginForm setShowLogin={setShowLogin} setShowSignup={setShowSignup} />
            </Modal>}
            {showSignup && <Modal onClose={() => setShowSignup(false)}>
              <SignUpForm setShowLogin={setShowLogin} setShowSignup={setShowSignup} />
            </Modal>}
          </Route>
          <ProtectedRoute path='/home' exact={true} >
            <div className="home tweets container">
              <NewTweetForm setShowNewTweetForm={setShowNewTweetForm} sessionUser={sessionUser}  showNewTweetForm={showNewTweetForm}/>
              <HomeTweets sessionUser={sessionUser} />
            </div>
          </ProtectedRoute>
          <ProtectedRoute path='/:username' exact={true} >
            <UserTweets
              sessionUser={sessionUser}
            />
          </ProtectedRoute>
          <ProtectedRoute path='/tweets/:tweetId' exact={true} >
            <div className="home tweets container">
              <SingleTweet sessionUser={sessionUser} />
            </div>
          </ProtectedRoute>
          <Route path='/page-not-found' >
            <PageNotFound />
          </Route>
          <ProtectedRoute path='*' >
            <PageNotFound />
          </ProtectedRoute>
        </Switch>
        {sessionUser && <UsersList sessionUser={sessionUser} />}
      </BrowserRouter>
    </div>
  );
}

export default App;
