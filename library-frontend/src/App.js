import { useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Recommendations from './components/Recommendations'
import { BOOK_ADDED, ALL_BOOKS } from './components/queries'

export const updateCache = (cache, query, addedBook) => {
  const uniquelyNamed = (array) => {
    let seen = new Set()
    return array.filter((book) => {
      let title = book.title
      return seen.has(title) ? false : seen.add(title)
    })
  }
  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniquelyNamed(allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(localStorage.getItem('libraryApp-user-token'))
  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      window.alert(`Book added: ${addedBook.title}`)

      updateCache(client.cache, { query: ALL_BOOKS, variables:{ genre: ""} }, addedBook)
    }
  })

  if (!token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('login')}>login</button>
        </div>

        <Authors show={page === 'authors'} canAdd={false}/>

        <Books show={page === 'books'} />

        <Login show={page === 'login'} handleLogin={(token) => {
          setToken(token)
          setPage('authors')
        }}/>
      </div>
    )
  }
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('recommendations')}>recommendations</button>
        <button onClick={() => setPage('add')}>add book</button>
          <button onClick={() => {
            setToken(null)
            localStorage.clear()
            client.resetStore()
          }}>logout</button>
      </div>

      <Authors show={page === 'authors'} canAdd={true} />

      <Books show={page === 'books'} />

      <Recommendations show={page === 'recommendations'} />

      <NewBook show={page === 'add'} />
    </div>
  )
}

export default App
