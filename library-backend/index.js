const { ApolloServer, gql } = require('apollo-server')
const {v1: uuid} = require('uuid')

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const typeDefs = gql`
  type Book {
      title: String!
      published: Int!
      author: String!
      id: ID!
      genres: [String!]!
  }

  type Author {
      name: String!
      id: ID!
      bookCount: Int!
      born: Int
  }

  type Query {
      bookCount: Int!
      allBooks(author: String, genre: String): [Book!]!
      authorCount: Int!
      allAuthors: [Author!]!
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
  }
`

const resolvers = {
  Author: {
      bookCount: (root) => {
          const booksByAuthor = books.filter(book => book.author === root.name)
          return booksByAuthor.length
      }
  },
  Query: {
      bookCount: () => books.length,
      allBooks: (root, args) => {
          if (!args) return books
          let filteredBooks = books
          if(args.author) filteredBooks = filteredBooks.filter(book => book.author === args.author)
          if(args.genre) filteredBooks = filteredBooks.filter(book => book.genres.includes(args.genre))
          return filteredBooks
        },
      authorCount: () => authors.length,
      allAuthors: () => authors,
  },
  Mutation: {
      addBook: (root, args) => {
          const book = {...args, id: uuid()}
          books = books.concat(book)
          if (!authors.includes(book.author)){
              const author = {
                  name: book.author,
                  id: uuid()
              }
              authors = authors.concat(author)
          }
          return book
      },
      editAuthor: (root, args) => {
        const author = authors.find(a => a.name === args.name)
        if (!author) return null  
        
        const editedAuthor = {...author, born: args.setBornTo}
        authors = authors.map(a => a.name == editedAuthor.name ? editedAuthor : a)
        return editedAuthor
      }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})