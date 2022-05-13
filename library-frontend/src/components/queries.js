import { gql } from '@apollo/client'

const BookDetails = gql`
  fragment BookDetails on Book {
    title
    author {
      name
      bookCount
      born
      id
    }
    published
    genres
    id
  }
`
const AuthorDetails = gql`
  fragment AuthorDetails on Author {
    name
    bookCount
    born
    id
  }
`

export const ALL_AUTHORS = gql`
  query {
      allAuthors {
        ...AuthorDetails
      }
  }
  ${AuthorDetails}
`

export const ALL_BOOKS = gql`
  query allBooks($genre: String) {
      allBooks(genre: $genre) {
          ...BookDetails
      }
  }
  ${BookDetails}
`

export const ALL_GENRES = gql`
  query {
      allGenres
  }
`

export const ME = gql`
  query {
      me {
        username
        favoriteGenre
      }
  }
`

export const ADD_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(
        title: $title,
        author: $author,
        published: $published,
        genres: $genres
    ){
      ...BookDetails
    }
  }
  ${BookDetails}
`

export const EDIT_AUTHOR = gql`
  mutation changeAuthor($name: String!, $setBornTo: Int){
    editAuthor(
      name: $name,
      setBornTo: $setBornTo,
    ){
      ...AuthorDetails
    }
  }
  ${AuthorDetails}
`

export const LOGIN = gql`
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    value
  }
}`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  
${BookDetails}
`