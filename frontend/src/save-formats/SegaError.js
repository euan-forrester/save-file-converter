export default class SegaError extends Error {
  constructor(internalSaveError = null, ramCartError = null) {
    super();
    this.internalSaveError = internalSaveError;
    this.ramCartError = ramCartError;
  }
}
