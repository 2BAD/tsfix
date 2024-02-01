/**
 * Type guard that checks if a value is not null.
 *
 * @param e - The value to be checked.
 */
export const notNull = <T>(e: T | null): e is Exclude<typeof e, null> => e !== null
