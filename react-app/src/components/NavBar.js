import React from 'react';
import { NavLink } from 'react-router-dom';
import LogoutButton from './auth/LogoutButton';
import WhiteCatIcon from '../assets/images/WhiteCatIcon.svg'
import HomeIcon from '../assets/images/home.svg'
import githubIcon from '../assets/images/github.svg'
import linkedInIcon from '../assets/images/linkedin.svg'
import NewTweetModal from './NewTweetModal';
import ProfileIcon from  '../assets/images/profile.svg'
import './NavBar.css'

const NavBar = ({ sessionUser }) => {
  return (
    <nav className='navbar container'>
      {/* {showNewTweetForm && <Modal onClose={() => setShowNewTweetForm(false)}>
        <NewTweetForm sessionUser={sessionUser} setShowNewTweetForm={setShowNewTweetForm} showNewTweetForm={showNewTweetForm} />
      </Modal>} */}
      <div className='navlink-container'>
        <NavLink to='/home' exact={true} activeClassName='active'>
          <img className='icon nav' src={WhiteCatIcon} alt='cat-icon' />
        </NavLink>
      </div>
      <div className='navlink-container'>
        <NavLink to='/home' exact={true} activeClassName='active'>
          <img className='icon nav' src={HomeIcon} alt="home-icon" />
          <span>Home</span>
        </NavLink>
      </div>
      <div className='navlink-container'>
        <NavLink to={`/${sessionUser.username}`} exact={true} activeClassName='active'>
          <img className='icon nav' src={ProfileIcon} alt='cat-icon' />
          <span>Profile</span>
        </NavLink>
      </div>
      <div className='navlink-container'>
        <a href='https://github.com/Jaircarbajal91' target="_blank" rel="noopener noreferrer">
          <img className='icon nav' src={githubIcon} alt="github-icon" />
          <span>GitHub</span>
        </a>
      </div>
      <div className='navlink-container'>
        <a href='https://www.linkedin.com/in/jair-carbajal/' target="_blank" rel="noopener noreferrer">
          <img className='icon nav' src={linkedInIcon} alt="linked-icon" />
          <span>LinkedIn</span>
        </a>
      </div>
      {/* <li>
          <NavLink to='/login' exact={true} activeClassName='active'>
            Login
          </NavLink>
        </li>
        <li>
          <NavLink to='/sign-up' exact={true} activeClassName='active'>
            Sign Up
          </NavLink>
        </li>
        <li>
          <NavLink to='/users' exact={true} activeClassName='active'>
            Users
          </NavLink>
        </li> */}
      <div className='navlink-container'>
        <LogoutButton />
      </div>
      <div className='logout-button container'>
        {/* <button className='nav new-tweet-button' onClick={() => setShowNewTweetForm(true)}>Tweet</button> */}
        <NewTweetModal sessionUser={sessionUser}/>
      </div>
    </nav>
  );
}

export default NavBar;
