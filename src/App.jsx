import { useEffect, useState } from 'react';
import './App.css'

function App() {
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [taskError, setTaskError] = useState('')
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editedTitle, setEditedTitle] = useState('')
  
  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')

    fetch('https://task-manager-backend-2fyg.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Pogresno korisnicko ime ili lozinka')
        }
        return response.text()
      })
      .then((data) => setToken(data))
      .catch((error) => setLoginError(error.message))
  }

  const handleRegister = (e) => {
  e.preventDefault()
  setLoginError('')

  fetch('https://task-manager-backend-2fyg.onrender.com/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Korisnicko ime je vec zauzeto')
      }
      return response.text()
    })
    .then((data) => setToken(data))
    .catch((error) => setLoginError(error.message))
}

  const handleAddTask = (e) => {
    e.preventDefault()
    setTaskError('')

    fetch('https://task-manager-backend-2fyg.onrender.com/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: newTaskTitle,
        description: '',
        completed: false,
      }),
    })
      .then((response) => {
        if(!response.ok) {
          throw new Error('Nije uspelo dodavanje taska, pokusajte ponovo')
        }
        return response.json()
      })
      .then((newTask) => {
        setTasks([...tasks,newTask])
        setNewTaskTitle('')
      })
      .catch(() => setTaskError('Nije moguce povezati se sa serverom. Pokusajte ponovo.'))
  }

  const handleToggleComplete = (task) => {
    fetch(`https://task-manager-backend-2fyg.onrender.com/api/tasks/${task.id}`,{
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        completed: !task.completed,
      }),
    })
     .then((response) => response.json())
     .then((updatedTask) => {
      setTasks(tasks.map((t) => (t.id == updatedTask.id ? updatedTask : t)))
     })
     .catch((error) => console.error('Greska:',error))
  }

  const handleDeleteTask = (taskId) => {
    fetch(`https://task-manager-backend-2fyg.onrender.com/api/tasks/${taskId}`,{
      method:'DELETE',
      headers: { Authorization: `Bearer ${token}`},
    })
    .then((response) => {
      if(!response.ok) {
          throw new Error('Nije uspelo dodavanje taska, pokusajte ponovo')
        }
      setTasks(tasks.filter((t) => t.id !== taskId))
    })
    .catch((error) => console.error('Greska:',error))
  }
  const startEditing = (task) => {
  setEditingTaskId(task.id)
  setEditedTitle(task.title)
}

const handleSaveEdit = (task) => {
  fetch(`https://task-manager-backend-2fyg.onrender.com/api/tasks/${task.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: editedTitle,
      description: task.description,
      completed: task.completed,
    }),
  })
    .then((response) => response.json())
    .then((updatedTask) => {
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
      setEditingTaskId(null)
    })
    .catch(() => setTaskError('Izmena nije uspela, pokusaj ponovo.'))
}

  useEffect(() => {
    if (!token) return
    fetch('https://task-manager-backend-2fyg.onrender.com/api/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error('Greska:', error))
  }, [token])

  if (!token) {
  return (
    <div className="login-card">
      <h1>{isRegistering ? 'Registracija' : 'Prijava'}</h1>
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        <input
          type="text"
          placeholder="Korisnicko ime"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {isRegistering && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}
        <input
          type="password"
          placeholder="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">
          {isRegistering ? 'Registruj se' : 'Prijavi se'}
        </button>
      </form>
      {loginError && <p className="login-error">{loginError}</p>}
      <p className="toggle-auth">
        {isRegistering ? 'Vec imas nalog?' : 'Nemas nalog?'}{' '}
        <span onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Prijavi se' : 'Registruj se'}
        </span>
      </p>
    </div>
  )
}

const completedCount = tasks.filter((t) => t.completed).length
const progressPercent = tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100

  return (
    <div>
    <div className="app-header">
      <h1>Moji taskovi</h1>
    </div>

    <div className="progress-strip">
      <div className="progress-label">
        {completedCount} od {tasks.length} zavrseno
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>

    <form className="add-task-form" onSubmit={handleAddTask}>
      <input
        type="text"
        placeholder="Novi task..."
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
      />
      <button type="submit">Dodaj</button>
    </form>

    {taskError && <p className="login-error">{taskError}</p>}

    {tasks.length === 0 ? (
      <p className="empty-state">Nemas jos nijedan task - dodaj prvi iznad.</p>
    ) : (
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              className="task-checkbox"
              checked={task.completed}
              onChange={() => handleToggleComplete(task)}
            />
            {editingTaskId === task.id ? (
              <>
                <input
                    type="text"
                    className="edit-input"
                    value={editedTitle}
                     onChange={(e) => setEditedTitle(e.target.value)}
                />
                <button className="save-btn" onClick={() => handleSaveEdit(task)}>
                   Sacuvaj
                 </button>
              </>
            ) : (
              <>
                <span className="task-title">{task.title}</span>
                <button className="edit-btn" onClick={() => startEditing(task)} aria-label="Izmeni task">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
              </>
            )}
            <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>
              Obrisi
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
  )
}

export default App
