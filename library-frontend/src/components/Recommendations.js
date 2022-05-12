import { ALL_BOOKS, ME } from './queries'
import { useQuery } from '@apollo/client'

const Recommendations = (props) => {
  const userResult = useQuery(ME, {
    skip: !props.show
  })

  const favoriteGenre = userResult?.data?.me?.favoriteGenre

  const bookResult = useQuery(ALL_BOOKS, {
    variables: {genre: favoriteGenre},
    skip: userResult.loading || !favoriteGenre
  })

  if (!props.show) {
    return null
  }

  console.log(userResult)

  if (userResult.loading || bookResult.loading) return (<div> ...loading </div>)

  if (!bookResult.data) return null

  const books = bookResult.data.allBooks

  return (
    <div>
      <h2>books</h2>
      <h3> books in your favorite genre: {!favoriteGenre ? 'all' : favoriteGenre } </h3>
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
    </div>
  )
}

export default Recommendations
