import axios from 'axios'
import { useState } from 'react'

const basePath = "http://dev.pjwalker.net/api"

const LoginForm = props => {
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
  const { showLogin, loginSubmit, logoutSubmit } = props

  
  return (
  <div>
    { !showLogin && 
      <span onClick={_ => logoutSubmit()} className="absolute top-0 right-0 font-bold w-20 p-2 m-2 cursor-pointer">Log out</span>
    }
    { showLogin &&
    <div className="mt-24">
      <p className="text-2xl">Please log in to visit your dashboard</p>
      <div className="w-1/4 mx-auto bg-gray-200 p-12 rounded-2xl">
        <div className="mb-2">
          <input className="p-2 rounded" type="text" name="username" placeholder="Username" onChange={e => {
              setUsername(e.target.value) 
            }
          }
          />
        </div>
        <div>
          <input className="p-2 rounded" type="password" placeholder="Password" onChange={e => {
              setPassword(e.target.value)
            }
          }/>
        </div>
        <div>
          <button onClick={_ => loginSubmit(username, password)} className="flex-1 bg-blue-500 text-white text-center font-bold w-20 p-2 mt-2 rounded">Submit</button>
        </div>
      </div>
    </div>
    }
  </div>
  )
}

export default LoginForm
