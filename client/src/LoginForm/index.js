import axios from 'axios'
import { useState } from 'react'

const basePath = "http://dev.pjwalker.net/api"

const LoginForm = props => {
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
  const { showLogin, loginSubmit, logoutSubmit } = props

  
  return (
  <div className="text-left w-1/4 mt-12 mx-auto">
    { !showLogin && 
      <button onClick={_ => logoutSubmit()} className="flex-1 bg-blue-500 text-white text-center font-bold w-20 p-2 m-2 rounded">Log out</button>
    }
    { showLogin &&
    <div>
      <p>Please log in to visit your dashboard</p>
      <div>
        <div>
          <label for="username" className="mr-2">Username</label>
          <input type="text" name="username" placeholder="Username" onChange={e => {
              setUsername(e.target.value) 
            }
          }
          />
        </div>
        <div>
          <label for="password" className="mr-2">Password</label>
          <input type="passwrd" placeholder="Password" onChange={e => {
              setPassword(e.target.value)
            }
          }/>
        </div>
        <div>
          <button onClick={_ => loginSubmit(username, password)} className="flex-1 bg-blue-500 text-white text-center font-bold w-20 p-2 m-2 rounded">Submit</button>
        </div>
      </div>
    </div>
    }
  </div>
  )
}

export default LoginForm
