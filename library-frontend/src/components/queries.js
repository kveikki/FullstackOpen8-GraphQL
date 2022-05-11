import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
  query {
      allAuthors {
          name
          bookCount
          born
          id
      }
  }
`

export const ALL_BOOKS = gql`
  query {
      allBooks {
          title
          author
          published
          id
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
      title
    }
  }
`

export const EDIT_AUTHOR = gql`
  mutation changeAuthor($name: String!, $setBornTo: Int){
    editAuthor(
      name: $name,
      setBornTo: $setBornTo,
    ){
      name
      born
    }
  }
`