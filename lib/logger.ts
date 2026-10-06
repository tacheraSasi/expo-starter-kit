/** * A simple logger utility that wraps console methods and only logs in development mode.
 * This helps to avoid cluttering the console with logs in production.
 */
const logger = {
  /** Logs general messages to the console. Only outputs in development mode. */
  log: (...args: unknown[]) => __DEV__ && console.log(...args),
  /** Logs warning messages to the console. Only outputs in development mode. */
  warn: (...args: unknown[]) => __DEV__ && console.warn(...args),
  /** Logs error messages to the console. Only outputs in development mode. */
  error: (...args: unknown[]) => __DEV__ && console.error(...args),
  /** Logs informational messages to the console. Only outputs in development mode. */
  info: (...args: unknown[]) => __DEV__ && console.info(...args),
};

export default logger;