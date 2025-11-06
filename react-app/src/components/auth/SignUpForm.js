import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { Redirect } from 'react-router-dom';
import { signUp } from '../../store/session';
import exit from '../../assets/images/exit.svg'
import BlueCatIcon from '../../assets/images/BlueCatIcon.svg'
import fileSelector from '../../assets/images/fileSelector.svg'
import './SignupForm.css'

const SignUpForm = ({ setShowSignup, setShowLogin }) => {
  const [errors, setErrors] = useState([]);

  const [username, setUsername] = useState('');
  const [usernameErrors, setUsernameErrors] = useState([]);
  const [usernameCondClass, setUsernameCondClass] = useState('username-cond-success');

  const [firstName, setFirstName] = useState('');
  const [firstNameErrors, setFirstNameErrors] = useState([]);
  const [firstNameCondClass, setFirstNameCondClass] = useState('first-name-cond-success');

  const [lastName, setLastName] = useState('');
  const [lastNameErrors, setLastNameErrors] = useState([]);
  const [lastNameCondClass, setLastNameCondClass] = useState('last-name-cond-success');

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [profileImageErrors, setProfileImageErrors] = useState([]);
  const [profileImageCondClass, setProfileImageCondClass] = useState('profile-image-cond-success');

  const [email, setEmail] = useState('');
  const [emailErrors, setEmailErrors] = useState([]);
  const [emailCondClass, setEmailCondClass] = useState('email-cond-success');

  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordCondClass, setPasswordCondClass] = useState('password-cond-success');

  const [isDisabled, setIsDisabled] = useState(true)

  const user = useSelector(state => state.session.user);
  const dispatch = useDispatch();


  const onSignUp = async (e) => {
    e.preventDefault();
    // Use empty string for profileImage if no file selected (optional)
    const profileImageUrl = '';
    const data = await dispatch(signUp(username.toLowerCase().trim(), email.trim(), password, firstName.trim(), lastName.trim(), profileImageUrl));
    if (data) {
      const arr = data[0].split(' : ')
      setErrors([arr[1]])
    } else {
      // Upload profile image after successful signup if file was selected
      if (profileImageFile) {
        try {
          // Get user ID from auth endpoint (user is now logged in after signup)
          const authRes = await fetch('/api/auth/', {
            headers: { 'Content-Type': 'application/json' }
          });
          if (authRes.ok) {
            const userData = await authRes.json();
            if (userData?.id) {
              const formData = new FormData();
              formData.append("image", profileImageFile);
              formData.append("type", "user");
              formData.append("user_id", userData.id);
              
              const res = await fetch('/api/images/', {
                method: "POST",
                body: formData,
              });
              
              if (res.ok) {
                const imageData = await res.json();
                // Image uploaded successfully
              }
            }
          }
        } catch (error) {
          console.error('Error uploading profile image:', error);
          // Don't block signup if image upload fails
        }
      }
      setShowSignup(false)
    }
  };

  const updateProfileImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setErrors([]);
      const reader = new FileReader(file);
      reader.readAsDataURL(file);
      reader.onloadend = function () {
        setPreviewImage(reader.result);
      }
      setProfileImageCondClass('profile-image-cond-success');
      setProfileImageErrors([]);
    }
  };

  const removeProfileImage = () => {
    setProfileImageFile(null);
    setPreviewImage(null);
    setProfileImageCondClass('profile-image-cond-success');
    setProfileImageErrors([]);
  };


  useEffect(() => {
    const errors = {
      username: [],
      firstName: [],
      lastName: [],
      profileImage: [],
      email: [],
      password: [],
    }
    const regex = /^http[^ \!@\$\^&\(\)\+\=]+(\.png|\.jpeg|\.gif|\.jpg)$/;


    if (username.length < 1) errors.username.push('* Please enter a username')
    if (username.includes(' ')) {
      setUsernameCondClass('username-cond-error')
      errors.username.push('Username cannot include spaces')
    } else if (username.length > 15) {
      setUsernameCondClass('username-cond-error')
      errors.username.push('Username is too long. Max Length 15')
    } else {
      setUsernameCondClass('username-cond-success')
    }

    if (firstName.length < 1) errors.firstName.push('* Please enter First Name')
    if (firstName.length > 15) {
      setFirstNameCondClass('first-name-cond-error')
      errors.firstName.push('First name is too long. Max Length 15')
    } else {
      setFirstNameCondClass('first-name-cond-success')
    }

    if (lastName.length < 1) errors.lastName.push('* Please enter Last Name')
    if (lastName.length > 15) {
      setLastNameCondClass('last-name-cond-error')
      errors.lastName.push('Last name is too long. Max Length 15')
    } else {
      setLastNameCondClass('last-name-cond-success')
    }

    // Profile image is now optional - file upload
    // No validation needed, just check if file is selected
    if (profileImageFile) {
      setProfileImageCondClass('profile-image-cond-success');
    } else {
      setProfileImageCondClass('profile-image-cond-success');
      // Optional field, no error
    }

    if (email.length < 1) errors.email.push('* Please enter an email address')
    if (!validateEmail(email)) {
      if (email.length >= 1) {
        setEmailCondClass('email-cond-error')
      } else {
        setEmailCondClass('email-cond-success')
      }
      errors.email.push('Please enter a valid email')
    } else if (email.length > 100) {
      setEmailCondClass('email-cond-error')
      errors.email.push('Email is too long. Max Length 100')
    } else {
      setEmailCondClass('email-cond-success')
    }

    if (password.trim().length < 8 || repeatPassword.trim().length < 8) {
      errors.password.push('* Both password must be at least 8 characters')
    } else if (password.trim().includes(' ') || repeatPassword.trim().includes(' ')) {
      setPasswordCondClass('password-cond-error')
      errors.password.push('Passwords cannot contain spaces')
    } else if (password !== repeatPassword) {
      setPasswordCondClass('password-cond-error')
      errors.password.push('Passwords must match')
    } else if (password.length >= 100 || repeatPassword.length >= 100) {
      errors.password.push('Password is too long. Max Length 100')
      setPasswordCondClass('password-cond-error')
    } else {
      setPasswordCondClass('password-cond-success')
    }


    setUsernameErrors(errors.username)
    setFirstNameErrors(errors.firstName)
    setLastNameErrors(errors.lastName)
    setProfileImageErrors(errors.profileImage)
    setEmailErrors(errors.email)
    setPasswordErrors(errors.password)

    if (!usernameErrors.length &&
      !firstNameErrors.length &&
      !lastNameErrors.length &&
      !profileImageErrors.length &&
      !emailErrors.length &&
      !passwordErrors.length) {
      setIsDisabled(false)
    } else {
      setIsDisabled(true)
    }
  }, [username, firstName, lastName, profileImageFile, email, password, repeatPassword, usernameErrors.length, firstNameErrors.length, lastNameErrors.length, profileImageErrors.length, emailErrors.length, passwordErrors.length])


  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  if (user) {
    return <Redirect to='/home' />;
  }

  const backToLogin = () => {
    setShowSignup(false)
    setShowLogin(true)
  }

  return (
    <div className='signup-form-container'>
      <div className='top-row container'>
        <img className='exit-icon' onClick={() => setShowSignup(false)} src={exit} alt='exit-icon' />
        <img className='sign-up cat-icon' src={BlueCatIcon} alt="cat-icon" />
      </div>
      <div className='signup-header'><h1>Sign up</h1></div>
      <form className='sign-up' onSubmit={onSignUp}>
        <div className='other-errors'>
          {errors.length > 0 && <span style={{
            color: 'red'
          }}>{errors[0]}</span>}
        </div>
        <div className='signup-form input-fields'>
          <div className='signup input-wrapper'>
            <input
              type='text'
              className={`input username ${usernameCondClass}`}
              placeholder='Enter a username'
              name='username'
              onChange={(e) => {
                setUsername(e.target.value)
                setErrors([])
              }}
              value={username}
              required
            ></input>
            <span className={`signup-errors username ${usernameCondClass}`}>{usernameErrors[0]}</span>
          </div>
          <div className='signup input-wrapper'>
            <input
              type='text'
              className={`input first-name ${firstNameCondClass}`}
              placeholder='First Name'
              name='first-name'
              onChange={(e) => {
                if (firstName.length < 1) {
                  setFirstName(e.target.value.trim())
                } else {
                  setFirstName(e.target.value)
                }
              }}
              value={firstName}
              required
            ></input>
            <span className={`signup-errors first-name ${firstNameCondClass}`}>{firstNameErrors[0]}</span>
          </div>
          <div className='signup input-wrapper'>
            <input
              type='text'
              className={`input last-name ${lastNameCondClass}`}
              placeholder='Last Name'
              name='last-name'
              onChange={(e) => {
                if (lastName.length < 1) {
                  setLastName(e.target.value.trim())
                } else {
                  setLastName(e.target.value)
                }
              }}
              value={lastName}
              required
            ></input>
            <span className={`signup-errors last-name ${lastNameCondClass}`}>{lastNameErrors[0]}</span>
          </div>
          <div className='signup input-wrapper'>
            <input
              type='email'
              className={`input email ${emailCondClass}`}
              placeholder='Email'
              name='email'
              onChange={(e) => {
                setEmail(e.target.value.trim())
                setErrors([])
              }}
              value={email}
              required
            ></input>
            <span className={`signup-errors email ${emailCondClass}`}>{emailErrors[0]}</span>
          </div>
          <div className='signup input-wrapper'>
            <input
              type='password'
              className={`input password ${passwordCondClass}`}
              placeholder='Password'
              name='password'
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            ></input>
            <span className={`signup-errors password ${passwordCondClass}`}>{passwordErrors[0]}</span>
          </div>
          <div className='signup input-wrapper'>
            <input
              type='password'
              className={`input repeat password ${passwordCondClass}`}
              placeholder='Repeated Password'
              name='repeat_password'
              onChange={(e) => setRepeatPassword(e.target.value)}
              value={repeatPassword}
              required
            ></input>
            <span className={`signup-errors repeat password ${passwordCondClass}`}>{passwordErrors[0]}</span>
          </div>
          <div className='signup input-wrapper'>
            <div className='profile-image-upload-container'>
              {previewImage && (
                <div className='preview-profile-image-container'>
                  <img className="preview-profile-image" src={previewImage} alt="Profile preview" />
                  <img 
                    onClick={removeProfileImage} 
                    className='remove-profile-img-icon' 
                    src={exit} 
                    alt="Remove image" 
                  />
                </div>
              )}
              <label htmlFor="profile-image-upload" className='profile-image-label'>
                <img className='file-selector' src={fileSelector} alt="" />
                <span>Add Profile Image</span>
              </label>
              <input
                type='file'
                accept=".png,.jpeg,.jpg,.gif"
                id="profile-image-upload"
                name='profile-image'
                onChange={updateProfileImage}
                style={{ display: 'none' }}
                onClick={event => event.target.value = null}
              />
            </div>
            <span className={`signup-errors url ${profileImageCondClass}`}>{profileImageErrors[0]}</span>
          </div>
        </div>
        <button disabled={isDisabled} className='button signup form' type='submit'>Sign Up</button>
      </form>
      <div className='Login-redirect-container'>
        <span className='login-redirect'>Have an account already?</span>
        <span className='login-text' onClick={backToLogin}> Log in</span>
      </div>
    </div>
  );
};

export default SignUpForm;
