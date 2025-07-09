const { leadDatabase } = require('./lead-db')

async function initDatabase() {
  try {
    await leadDatabase.createIndexes()
    console.log('✅ Database indexes created successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating database indexes:', error)
    process.exit(1)
  }
}

initDatabase()
