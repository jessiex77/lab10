import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthContext } from '@asgardeo/auth-react'

const API = import.meta.env.VITE_API_BASE_URL

const Body = () => {
  const { getAccessToken } = useAuthContext()
  const [puppies, setPuppies] = useState([])
  const [form, setForm] = useState({ name: '', breed: '', age: '' })
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const getHeaders = async () => {
    const token = await getAccessToken()
    return { Authorization: `Bearer ${token}` }
  }

  const fetchPuppies = async () => {
    const headers = await getHeaders()
    const res = await axios.get(`${API}/puppies`, { headers })
    setPuppies(res.data)
  }

  useEffect(() => { fetchPuppies() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const headers = await getHeaders()
    if (editId) {
      await axios.put(`${API}/puppies/${editId}`, form, { headers })
      setEditId(null)
    } else {
      await axios.post(`${API}/puppies`, form, { headers })
    }
    setForm({ name: '', breed: '', age: '' })
    setShowForm(false)
    fetchPuppies()
  }

  const handleEdit = (puppy) => {
    setForm({ name: puppy.name, breed: puppy.breed, age: puppy.age })
    setEditId(puppy.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    const headers = await getHeaders()
    await axios.delete(`${API}/puppies/${id}`, { headers })
    fetchPuppies()
  }

  return (
    <main className="body">
      <div className="body-header">
        <h2>My Puppies</h2>
        <button className="btn-add" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', breed: '', age: '' }) }}>
          {showForm ? 'Cancel' : '+ Add Puppy'}
        </button>
      </div>

      {showForm && (
        <form className="puppy-form" onSubmit={handleSubmit}>
          <h3>{editId ? 'Edit Puppy' : 'Add New Puppy'}</h3>
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Breed" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} required />
          <input placeholder="Age" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} required />
          <button type="submit" className="btn-submit">{editId ? 'Update' : 'Add'}</button>
        </form>
      )}

      <table className="puppy-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Breed</th><th>Age</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {puppies.map(puppy => (
            <tr key={puppy.id}>
              <td>{puppy.id}</td>
              <td>{puppy.name}</td>
              <td>{puppy.breed}</td>
              <td>{puppy.age}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(puppy)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(puppy.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

export default Body