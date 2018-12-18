const WIDTH_OFFSET = 2;
const PADDING = {x: 20, y: 6};
const PROMPT = 'guest@afilini.com:/var/www# ';

class Cursor {
  constructor(cursor) {
    this.x = cursor.x;
    this.y = cursor.y;
    this.position = 0;
  }
}

class Terminal {
  constructor(canvas, isMobile, updateCallback, outputFont='Ubuntu Mono, monospace', fontColor='#C0C0C0') {
    const fontSize = Math.min(
      Math.round(canvas.width / (isMobile ? 30 : 44)),
      30
    );

    outputFont = `${fontSize}px ` + outputFont;

    PADDING.x = fontSize;
    PADDING.y = Math.round(fontSize / 3);

    this.ctx = canvas.getContext('2d');
    this.updateCallback = updateCallback;

    this.commandIndex = 0;
    this.currentCommand = '';
    this.tempCommandBuffer = '';
    this.allUserCmds = [];

    this.outputFont = outputFont;
    this.fontColor = fontColor;

    this.ctx.font = this.outputFont;
    this.ctx.fillStyle = this.fontColor;

    let metrics = this.ctx.measureText('W');

    this.charWidth = Math.ceil(metrics.width);
    this.charHeight = this.charWidth * 2.0;

    this.promptWidth = Math.ceil(this.ctx.measureText(PROMPT).width);

    this.cursor = new Cursor({x: this.promptWidth, y: this.charHeight});

    this.interpreter = new Interpreter(this);
    this.commandRunning = false;

    this.initViewArea();

    this.flashCounter = 1;
    setInterval(Terminal.flashCursor, 300, this);
  }

  initViewArea() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(PADDING.x, PADDING.y, this.ctx.canvas.width, this.ctx.canvas.height);

    this.ctx.font = this.outputFont;
    this.ctx.fillStyle = this.fontColor;

    this.drawPrompt(Math.ceil(this.cursor.y / this.charHeight));
  }

  keyPress(e){
    if (this.commandRunning) {
      return;
    }

    console.log(e);
    if(e.keyCode === 8) { // handle the <BACKSPACE>
      e.preventDefault();

      if (this.cursor.position > 0) {
        this.blotPrevChar();

        if (this.currentCommand.length > 0) {
          this.currentCommand = this.currentCommand.slice(0, this.cursor.position - 1) + this.currentCommand.slice(this.cursor.position);
          this.cursor.position--;
        }
      }

      this.redrawCurrentLine();

      return;
    }

    if (e.keyCode === 13) { // handle the <ENTER> key
      this.blotOutCursor();
      this.cursor.x = 0;
      this.cursor.y += this.charHeight;
      this.handleNewLine();

      if (this.currentCommand.length > 0) {
        this.commandRunning = true;

        this.interpreter.run(this.currentCommand, (text) => this.stdoutCallback(text), () => {
          // this is the "done" callback
          this.allUserCmds.push(this.currentCommand);
          this.commandIndex = this.allUserCmds.length;
          this.currentCommand = '';
          this.cursor.position = 0;

          this.cursor.x = this.promptWidth;
          this.redrawCurrentLine();

          this.commandRunning = false;
        });
      } else {
        this.redrawCurrentLine();
        this.cursor.x = this.promptWidth;
      }

      return;
    }

    // command history

    if (e.keyCode === 38) { // up arrow
      e.preventDefault();

      if (this.commandIndex === 0) {
        return;
      } else if (this.commandIndex === this.allUserCmds.length) { // if we are typing a new command
        this.tempCommandBuffer = String(this.currentCommand);
      }

      this.blotOutCursor();

      this.commandIndex--;
      this.currentCommand = this.allUserCmds[this.commandIndex];
      this.redrawCurrentLine();

      this.cursor.x = Math.ceil(this.ctx.measureText(PROMPT + this.currentCommand).width);
      this.cursor.position = this.currentCommand.length;

      return;
    }

    if (e.keyCode === 40) { // down arrow
      e.preventDefault();

      this.blotOutCursor();

      if (this.commandIndex === this.allUserCmds.length - 1) {
        this.currentCommand = String(this.tempCommandBuffer);
      } else {
        this.commandIndex++;
        this.currentCommand = this.allUserCmds[this.commandIndex];
      }

      this.redrawCurrentLine();
      this.cursor.x = Math.ceil(this.ctx.measureText(PROMPT + this.currentCommand).width);
      this.cursor.position = this.currentCommand.length;

      return;
    }

    // editing

    if (e.keyCode === 37) { // left arrow
      if (this.cursor.position === 0) {
        return;
      }

      this.blotOutCursor();

      this.cursor.position--;
      this.cursor.x -= this.charWidth;

      this.redrawCurrentLine();

      return;
    }

    if (e.keyCode === 39) { // right arrow
      if (this.cursor.position >= this.currentCommand.length) {
        return;
      }

      this.blotOutCursor();

      this.cursor.position++;
      this.cursor.x += this.charWidth;

      this.redrawCurrentLine();

      return;
    }

    // done

    this.blotOutCursor();
    this.currentCommand = this.currentCommand.slice(0, this.cursor.position) + String.fromCharCode(e.charCode) + this.currentCommand.slice(this.cursor.position);
    this.cursor.x += this.charWidth;
    this.cursor.position++;

    this.redrawCurrentLine();
  }

  stdoutCallback(text) {
    this.clearCurrentLine();

    if (typeof text === 'string') {
      this.ctx.fillStyle = this.fontColor;
      this.ctx.fillText(text, PADDING.x, this.cursor.y + PADDING.y);

      this.cursor.y += this.charHeight;

      this.handleNewLine();
    } else {
      for (let start = 0; start < text.height; start += this.charHeight) {
        const drawHeight = Math.min(text.height - start, this.charHeight);
        this.ctx.drawImage(text, 0, start, text.width, drawHeight, PADDING.x, this.cursor.y + PADDING.y, text.width, drawHeight);

        this.cursor.y += this.charHeight;
        this.handleNewLine();
      }

      this.cursor.y += this.charHeight;
      this.handleNewLine();
    }
  }

  static flashCursor(ref){
    let flag = ref.flashCounter % 3;

    switch (flag) {
      case 1:
      case 2:
        ref.showCursor();
        ref.flashCounter++;
        
        break;
      default:
        ref.blotOutCursor();
        ref.flashCounter = 1;
    }

    ref.updateCallback();
  }

  shiftOneLineUp() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.charHeight + PADDING.y + Math.floor(this.charHeight / 4)); // black out a little strip at the top

    const imageData = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); // black out the canvas

    this.ctx.putImageData(imageData, 0, -this.charHeight); // redraw everything

    this.cursor.y -= this.charHeight;
  }

  handleNewLine() {
    if (this.cursor.y >= this.ctx.canvas.height - this.charHeight) {
      this.shiftOneLineUp();
    }
  }

  clear() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.cursor.y = this.charHeight;
    this.cursor.position = 0;

    this.currentCommand = '';
    this.redrawCurrentLine();
  }

  notifyLine(text) {
    this.commandRunning = true;

    this.blotOutCursor();

    this.clearCurrentLine();

    this.stdoutCallback(text);
    this.redrawCurrentLine();

    this.commandRunning = false;
  }

  clearCurrentLine() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(PADDING.x, this.cursor.y - this.charHeight + 3 + PADDING.y, this.ctx.canvas.width, this.charHeight);
  }
  
  redrawCurrentLine() {
    this.ctx.font = this.outputFont;

    this.clearCurrentLine();

    this.ctx.fillStyle = this.fontColor;
    this.ctx.fillText(PROMPT + this.currentCommand, PADDING.x, this.cursor.y + PADDING.y);
  }
  
  drawNewLine(){
    this.ctx.font = this.outputFont;
    this.ctx.fillStyle = this.fontColor;
    this.ctx.fillText(PROMPT, PADDING.x, this.cursor.y + this.charHeight + PADDING.y);
  }

  drawPrompt(Yoffset) {
    this.ctx.font = this.outputFont;
    this.ctx.fillStyle = this.fontColor;
    this.ctx.fillText(PROMPT, PADDING.x, Yoffset * this.charHeight + PADDING.y);
  }

  showCursor(){
    this.ctx.fillStyle = this.fontColor;
    this.ctx.fillText('█', this.cursor.x + PADDING.x, this.cursor.y + PADDING.y);

    if (this.cursor.position < this.currentCommand.length) { // we are in the middle of a word
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(this.currentCommand.charAt(this.cursor.position), this.cursor.x + PADDING.x, this.cursor.y + PADDING.y);
    }
  }

  blotOutCursor(){
    this.ctx.fillStyle = '#000000';
    this.ctx.fillText('█', this.cursor.x + PADDING.x, this.cursor.y + PADDING.y);

    if (this.cursor.position < this.currentCommand.length) { // we are in the middle of a word
      this.ctx.fillStyle = this.fontColor;
      this.ctx.fillText(this.currentCommand.charAt(this.cursor.position), this.cursor.x + PADDING.x, this.cursor.y + PADDING.y);
    }
  }

  blotPrevChar(){
    this.blotOutCursor();
    this.ctx.fillStyle = '#000000';
    this.cursor.x -= this.charWidth;
    this.ctx.fillRect(this.cursor.x + PADDING.x, this.cursor.y - (this.charWidth + WIDTH_OFFSET) + PADDING.y, this.charWidth + 3, 15);
  }
}
