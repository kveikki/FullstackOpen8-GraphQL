import { ALL_AUTHORS, EDIT_AUTHOR } from './queries'
import { useQuery, useMutation }from '@apollo/client'
import { useState } from 'react'
import Select from 'react-select'

const Authors = (props) => {
  const [author, setAuthor] = useState(null)
  const [year, setYear] = useState('')

  const result = useQuery(ALL_AUTHORS)

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{query: ALL_AUTHORS}],
    onError: (error) => { console.log(error) }
  })


  if (!props.show) {
    return null
  }
  
  if (result.loading) return (<div> ...loading </div>)

  if (!result.data) return null
  
  const authors = result.data.allAuthors
  const authorOptions = authors.map(a => ({
    value: a.name, 
    label: a.name
  }))

  const submit = async (event) =>{
    event.preventDefault()

    const yearInt = parseInt(year)

    editAuthor( { variables: { name: author.value, setBornTo: yearInt } })
    
    setAuthor(null)
    setYear('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Set Birthyear</h3>
      <form onSubmit={submit}>
        <Select
          defaultValue={ author }
          value={ author }
          onChange={ setAuthor }
          options={ authorOptions }
        />
        <div>
          born
          <input
            value={year}
            onChange={({ target }) => setYear(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors
