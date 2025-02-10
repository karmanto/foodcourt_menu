import { PageType, UserInfoType } from '@/app/auth/page'
import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import { pageLabels } from '@/lib/utils/constants/pageLabels'
import { signIn } from 'next-auth/react'
import { FormEvent, FormEventHandler, useEffect, useState } from 'react'

interface AuthFormProps {
  page: PageType
  userInfo: UserInfoType
  setUserInfo: (info: UserInfoType) => void
  setPage: (page: PageType) => void
}

export default function AuthForm(props: AuthFormProps) {
  const { page, userInfo, setPage, setUserInfo, ...formProps } = props
  const { signInLabels, signUpLabels } = pageLabels
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleLogin: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    if (!userInfo.email || !userInfo.password) {
      setNotification({
        message: 'Please fill all fields',
        type: 'error',
      })
      return
    }

    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email: userInfo.email,
        password: userInfo.password,
        redirect: false,
      })

      if (res?.error) {
        setNotification({
          message: 'Invalid email or password',
          type: 'error',
        })
      } else {
        setNotification({
          message: 'Login successful! Redirecting...',
          type: 'success',
        })
        setTimeout(() => {
          window.location.href = AppRoutes.Home
        }, 2000)
      }
    } catch (error) {
      setNotification({
        message: 'An error occurred during login',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = () => {
    if (page === 'login') {
      setPage('register')
      return
    }
    setPage('login')
  }

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { name, email, password } = userInfo
    if (!name || !email || !password) {
      setNotification({
        message: 'Please fill all fields',
        type: 'error',
      })
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      if (res.ok) {
        const signInRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (signInRes?.ok) {
          setNotification({
            message: 'Registration successful! Redirecting...',
            type: 'success',
          })
          setTimeout(() => {
            window.location.href = AppRoutes.Home
          }, 2000)
        } else {
          setNotification({
            message: 'Registration successful! Please log in.',
            type: 'success',
          })
          setTimeout(() => {
            setPage('login')
          }, 2000)
        }
      } else {
        const errorData = await res.json()
        setNotification({
          message: errorData.message || 'Registration failed. Please try again.',
          type: 'error',
        })
      }
    } catch (error) {
      setNotification({
        message: 'An error occurred during registration',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={page === 'login' ? handleLogin : handleRegister}
      className='flex flex-col w-2/3 md:w-1/3 gap-2'
      {...formProps}
    >
      {/* Notification Popup */}
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-md text-white ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      )}

      {page === 'register' && (
        <input
          placeholder='name'
          value={userInfo.name}
          onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
          className='input-primary'
        />
      )}

      <input
        value={userInfo.email}
        onChange={({ target }) =>
          setUserInfo({ ...userInfo, email: target.value })
        }
        type='email'
        placeholder='email@gmail.com'
        className='input-primary'
      />

      <input
        value={userInfo.password}
        onChange={({ target }) =>
          setUserInfo({ ...userInfo, password: target.value })
        }
        type='password'
        placeholder='********'
        className='input-primary'
      />

      <button disabled={loading} type='submit' className='btn-primary'>
        {page === 'login' ? signInLabels.event : signUpLabels.event}
      </button>

      <p>
        {page === 'login' ? signInLabels.formFooter : signUpLabels.formFooter}
        <span className='underline cursor-pointer' onClick={handlePageChange}>
          {page === 'login' ? signUpLabels.event : signInLabels.event}
        </span>
      </p>
    </form>
  )
}