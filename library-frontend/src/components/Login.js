import { useState, useEffect } from 'react'
import { LOGIN, ME } from './queries'
import { useMutation } from '@apollo/client'

const Login = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [ login, result ] = useMutation(LOGIN, {
    refetchQueries:[{query: ME}],
    onError: (error) => { console.log(error) }
  })

  useEffect(() => {
    if ( result.data ) {
      const token = result.data.login.value
      props.handleLogin(token)
      localStorage.setItem('libraryApp-user-token', token)
    }
  }, [result.data]) 

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    
    login({ variables: { username, password} })

    setUsername('')
    setPassword('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default Login
