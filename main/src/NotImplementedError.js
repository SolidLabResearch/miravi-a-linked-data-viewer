/**
 * Error thrown when a method is not implemented.
 */
export default class NotImplementedError extends Error {
  constructor(message = "Not implemented") {
    super(message);
    this.name = "NotImplementedError";
  }
}
