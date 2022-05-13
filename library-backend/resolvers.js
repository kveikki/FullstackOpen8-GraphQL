require('dotenv').config()
const { UserInputError, AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')
const { PubSub } = require('graphql-subscriptions')

const pubsub = new PubSub()
const JWT_SECRET = process.env.JWT_SECRET

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    allBooks: async (root, args) => {
      let promise = Book.find({})
      if (!args) return promise.populate("author")
      if (args.author) {
        const author = await Author.find({ name: args.author })
        promise = promise.find({ author: author })
      }
      if (args.genre) promise = promise.find({ genres: { $in: args.genre } })
      return promise.populate("author")
    },
    authorCount: async () => Author.collection.countDocuments(),
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => context.currentUser,
    allGenres: async () => Book.find({}).distinct("genres")
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (context.currentUser) {
        let author = await Author.findOne({ name: args.author })
        if (!author) author = new Author({ name: args.author, bookCount: 0 })
        const book = new Book({ ...args, author: author })
        try {
          await book.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }

        author.bookCount++
        
        try {
          await author.save()
        } catch (error) {
          await Book.findOneAndRemove({ _id: book._id })
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }

        pubsub.publish('BOOK_ADDED', { bookAdded: book })

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
      const user = new User({ ...args })
      return user.save().catch(error => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== process.env.PASSWORD) {
        throw new UserInputError("Wrong username or password")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}

module.exports = resolvers
