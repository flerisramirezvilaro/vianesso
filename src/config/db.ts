import pg, { QueryResult, QueryResultRow } from 'pg'
import { ENV } from './env'

const { Pool } = pg

const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  ssl:
    ENV.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
})

pool.on('connect', () => {
  console.log('PostgreSQL Pool connected successfully')
})

pool.on('error', (error: Error) => {
  console.error('Unexpected PostgreSQL error', error)
  process.exit(1)
})



export const query = async <
  T extends QueryResultRow,
>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params)
}

export default pool
