import { ALL_BOOKS, ALL_GENRES} from './queries'
import { useQuery } from '@apollo/client'
import { useState } from 'react'

const Books = (props) => {
  const [genre, setGenre] = useState('')
  const bookResult = useQuery(ALL_BOOKS, {variables: {genre}})
  const genreResult = useQuery(ALL_GENRES)

  if (!props.show) {
    return null
  }

  if (bookResult.loading || genreResult.loading) return (<div> ...loading </div>)

  if (!bookResult.data) return null

  const books = bookResult.data.allBooks
  const genres = (!genreResult.data) ? [] : genreResult.data.allGenres

  return (
    <div>
      <h2>books</h2>
      <h3> in genre: {!genre ? 'all' : genre } </h3>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div> 
        {genres.map(g => <button key={g} onClick={() => {setGenre(g)}}> {g} </button>)}
        <button key={'all genres'} onClick={() => {setGenre('')}}> all genres </button> 
      </div>
    </div>
  )
}

export default Books
