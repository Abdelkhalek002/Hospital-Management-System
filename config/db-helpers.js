import dbPool from "./db.js";

/**
 * Execute a query using the connection pool
 * @param {string} sql - SQL query with placeholders
 * @param {array} params - Parameter values for prepared statement
 * @returns {Promise<array>} - Query results
 */
export const query = async (sql, params = []) => {
  const connection = await dbPool.getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    connection.release();
  }
};

/**
 * Execute a single row query
 * @param {string} sql - SQL query with placeholders
 * @param {array} params - Parameter values for prepared statement
 * @returns {Promise<object|null>} - Single row result or null
 */
export const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Execute multiple queries in a transaction
 * @param {function} callback - Function that receives connection and executes queries
 * @returns {Promise<any>} - Result from callback
 */
export const transaction = async (callback) => {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
