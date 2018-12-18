const GOD_TYPE_CONSTANT = 1;
const GOD_TYPE_RANDOM = 2;
const GOD_TYPE_DEFINED = 4;

class God {
  constructor(terminal, keyEvents, type, timing) {
    this.terminal = terminal;
    this.keyEvents = keyEvents;
    this.type = type;
    this.timing = timing;

    this.pos = 0;

    this.timeoutHandle = null;
  }

  static fromText(terminal, text, type, timing) {
    const events = [];

    for (let i = 0; i < text.length; i++) {
      events.push({
        charCode: text.charCodeAt(i),
        keyCode: text.charCodeAt(i)
      });
    }

    events.push({
      keyCode: 13, charCode: 0
    });

    return new God(terminal, events, type, timing);
  }

  start() {
    this.timeoutHandle = setTimeout(God.nextChar, 0, this);
  }

  reset() {
    this.pos = 0;
    clearTimeout(this.timeoutHandle);

    this.timeoutHandle = null;
  }

  resetAndStart() {
    this.reset();
    this.start();
  }

  stop() {
    if (this.timeoutHandle !== null) {
      clearTimeout(this.timeoutHandle);
    }
  }

  getNextTiming() {
    switch (this.type) {
      case GOD_TYPE_RANDOM:
        return Math.random() * this.timing * 1000;
      case GOD_TYPE_CONSTANT:
        return this.timing * 1000;
      case GOD_TYPE_DEFINED:
        return this.timing[this.pos % this.timing.length] * 1000;
      default:
        throw `Invalid type ${this.type}`;
    }
  }

  static nextChar(ref) {
    if (ref.pos >= ref.keyEvents.length) {
      return;
    }

    ref.terminal.keyPress(ref.keyEvents[ref.pos]);
    ref.pos++;

    ref.intervalHandle = setTimeout(God.nextChar, ref.getNextTiming(), ref);
  }
}
