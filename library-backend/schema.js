
const { gql } = require('apollo-server')

const typeDefs = gql`
  type Book {
      title: String!
      published: Int!
      author: Author!
      id: ID!
      genres: [String!]!
  }

  type Author {
      name: String!
      id: ID!
      bookCount: Int!
      born: Int
  }
  
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }
  
  type Subscription {
    bookAdded: Book!
  }

  type Query {
      bookCount: Int!
      allBooks(author: String, genre: String): [Book!]!
      authorCount: Int!
      allAuthors: [Author!]!
      me: User
      allGenres: [String!]!
  }

  type Mutation {
      addBook(
          title: String!
          author: String!
          published: Int!
          genres: [String!]
      ): Book
      editAuthor(
          name: String! 
          setBornTo: Int
      ): Author
      createUser(
        username: String!
        favoriteGenre: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
  }
`
module.exports = typeDefs