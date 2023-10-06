export default class NotOwnerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotOwnerError";
  }
}
