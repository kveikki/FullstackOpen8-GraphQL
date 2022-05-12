require('dotenv').config()
const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')

const url = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET

console.log('connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

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
  
  type Query {
      bookCount: Int!
      allBooks(author: String, genre: String): [Book!]!
      authorCount: Int!
      allAuthors: [Author!]!
      me: User
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

const resolvers = {
  Author: {
    bookCount: async (root) => Book.find({author: root._id}).countDocuments()
  },
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    allBooks: async (root, args) => {
      let promise = Book.find({})
      if (!args) return promise.populate("author")
      if(args.author) {
        const author = await Author.find({ name: args.author}).exec()
        promise = promise.find({ author: author })
      }
      if(args.genre) promise = promise.find({ genres: { $in: args.genre }})
      return promise.populate("author")
    },
    authorCount: async () => Author.collection.countDocuments(),
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => context.currentUser
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (context.currentUser) {          
        let author = await Author.findOne({ name: args.author }).exec()
        if (!author){
          author = new Author({ name: args.author })
          try {
            await author.save()
          } catch (error) {
            throw new UserInputError(error.message, {
              invalidArgs: args,
            })}          }
        const book = new Book({...args, author: author})
        try {
          await book.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        return book
      }
      throw new AuthenticationError("No valid token in the request!")
    },
    editAuthor: async (root, args, context) => {
      if (context.currentUser) {
        const author = await Author.findOne({ name: args.name })
        if (!author) return null  
        
        author.born = args.setBornTo
        try {
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        return author
      }
      throw new AuthenticationError("No valid token in the request!")
    },
    createUser: async (root, args) => {        
      const user = new User({ ...args})
      return user.save().catch(error => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username})
      if ( !user || args.password !== process.env.PASSWORD ) {
        throw new UserInputError("Wrong username or password")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
     }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')){
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})