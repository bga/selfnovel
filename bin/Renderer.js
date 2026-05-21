

Tag = {
  Goto: class Goto {
    constructor(v) { this._label = v }
  },
  Label: class Label {
    constructor(v) { this._label = v }
  },
  Eval: class Eval {
    constructor(v) { this._expr = v }
  },
  If: class If {
    constructor(v) { this._expr = v }
  },
}

DebugLevel = {
  None: 0, 
  Error: 1, 
  Warning: 2, 
  LogicInspect: 4, 
  Debug: 8, 
};

class Self {
  reset() {
    this._lines = []
    this._currentIndex = 0
    this._indentChar = ""

    if(this.onReset != null) {
      this.onReset(this)
    } 
    // this.vm = null
  }
  init() {
    this.debugLevel = DebugLevel.Warning | DebugLevel.Error
    this.eol = "\n"
    this.reset()
  }
  _runtimeError(err) {
    console.error(err)
  }

  _debugOut(debugLevel, ...args) {
    if(this.debugLevel & debugLevel)  console.log(...args)
  }
  
  _parsePrefix(t) {
    const m = t.match(/^\s*([:;>\$\?])(\S+)/)
    if(m == null) return [null,  t]
    const mRest = m[2]
    var tag = null; switch(m[1]) {
      case('>'): tag = new Tag.Goto(mRest); break;
      case(':'): tag = new Tag.Label(mRest); break;
      case(';'): tag = new Tag.Label(mRest); break;
      case('$'): tag = new Tag.Eval(mRest); break;
      case('?'): tag = new Tag.If(mRest); break;
      default: throw Error(`Unknown op ${m[1]}`)
    }

    return [tag, t.slice(m.index + m[0].length)]
  }
  _parsePrefixes(t) {
    var tag, tags = []; for(;;) {
      [tag, t] = this._parsePrefix(t)
      if(tag ==  null) break;
      tags.push(tag)
    }
    return {tags, msg: t.trim()}
  }
  _findLabelInTags(tags) {
    for(let tag of tags) {
      if(tag instanceof Tag.Label) return tag
    }
    return null
  }
  parse(text) { const p = this
    var lines = text.split(/\r?\n/)
    lines = (lines
      //# rm comments
      .map(t => t.replace(/#.*$/, ""))

      //# remove extra spaces
      //! TODO support slash continuation
      .map(t => t.trimRight())

      //# indent and rest
      .map(t => t.match(/^(\s*)(.*)$/))
      // .filter(m => m != null)
      .map((m) => ({indent: m[1], rest: m[2]}))
    );

    this._debugOut(DebugLevel.Debug, lines)
    
    const linesNoEmptyIndent = lines.filter(obj => 0 < obj.indent.length)
    this._indentChar = ""
    if(linesNoEmptyIndent.some(t => 0 <= t.indent.indexOf("\t"))) {
      this._indentChar = "\t"
    };
    if(linesNoEmptyIndent.some(t => 0 <= t.indent.indexOf(" "))) {
      if(this._indentChar != "") {
        this._indentChar = ""
        throw Error("Mixed tab and space indent")
      };

      this._indentChar = "  "
    };

    this._debugOut(DebugLevel.Debug, this._indentChar.charCodeAt(0))

    lines = (lines
      .map(obj => Object.assign(obj, p._parsePrefixes(obj.rest)))
      .map(obj => Object.assign(obj, { label: p._findLabelInTags(obj.tags) }))
    );
    this._lines = lines

    this._start()
  }
  _start() {
    this._currentIndex = 0
    this._runLine(this._lines[this._currentIndex])
  }

  _isEmptyLine(obj) {
    return obj.msg.length == 0;
  }
  _skipEmptyLines(currentIndex) {
    for(; currentIndex < this._lines.length; currentIndex += 1) {
      const obj = this._lines[currentIndex]
      if(this._isEmptyLine(obj)) continue;
      break;
    }
    return currentIndex
  }
  _getNextLines(currentIndex) {
    const indent = this._lines[currentIndex].indent
    const nextIndent = indent + this._indentChar
    var activeLineIndexes = []

    currentIndex += 1
    for(; currentIndex < this._lines.length; currentIndex += 1) {
      const obj = this._lines[currentIndex]
      
      if(this._isEmptyLine(obj)) continue;
      if(obj.indent == indent) {
        this._debugOut(DebugLevel.LogicInspect, "_getNextLines breaking at " + currentIndex)
        break;
      };
      if(obj.indent == nextIndent) {
        activeLineIndexes.push(currentIndex)
      };
    }
    this._debugOut(DebugLevel.Debug, currentIndex)

    return activeLineIndexes
  }
  _findLabel(label, currentIndex) {
    const middleIndex = currentIndex
    this._debugOut(DebugLevel.Debug, middleIndex)
    for(; currentIndex < this._lines.length; currentIndex += 1) {
      const obj = this._lines[currentIndex]
      if(this._isEmptyLine(obj)) continue;
      if(obj.label != null && obj.label._label == label) return currentIndex;
    }
    for(currentIndex = 0; currentIndex < middleIndex; currentIndex += 1) {
      const obj = this._lines[currentIndex]
      this._debugOut(DebugLevel.Debug, currentIndex, obj.tags, obj.label)
      if(this._isEmptyLine(obj)) continue;
      if(obj.label != null && obj.label._label == label) return currentIndex;
    }
    return null;
  }
  _evalExpr(obj) {
    
  }
  _runLine_byTag(obj, _Tag, f) {
    for(let tag of obj.tags) {
      if(tag instanceof _Tag) {
        f(tag)
      };
    }
  }
  _isActiveLine(obj) {
    var cond = 1
    this._runLine_byTag(obj, Tag.If, tag => {
      try {
        this._debugOut(DebugLevel.LogicInspect, tag._expr)
        cond = cond && !!this.vm.scopeEval(tag._expr)
      } catch(err) {
        this._runtimeError(err)
      }
    })
    return cond
  }
  _idxToStr(idx) {
    return String.fromCharCode('1'.charCodeAt(0) + idx) + ". "
  }
  isEnd() {
    return this._currentIndex == this._lines.length
  }
  _formatMsg(msg) {
    return msg.split("\\").map(t => t.trim()).join(this.eol)
  }
  getQuestionMsg() {
    if(this.isEnd()) return "End"
    return this._formatMsg(this._lines[this._currentIndex].msg)
  }
  getAnswearMsgs() {
    if(this.isEnd()) return []

    this._debugOut(DebugLevel.LogicInspect, "this._currentIndex " + this._currentIndex)
    this._activeLineIndexes = (this._getNextLines(this._currentIndex)
      .filter((k, idx) => this._isActiveLine(this._lines[k]))
    )
    this._debugOut(DebugLevel.LogicInspect, this._activeLineIndexes)
    
    return (this._activeLineIndexes
      .map((k, idx) => this._idxToStr(idx) + this._lines[k].msg)
      .map(msg => this._formatMsg(msg) )
    )
  }
  getAnswearMsgsLength() {
    return this._activeLineIndexes.length
  }
  printDialog() {
    return [this.getQuestionMsg()].concat(this.getAnswearMsgs()).join("\n")
  }
  printDialogOld() {
    if(this._currentIndex == this._lines.length) return "End"
    if(this._currentIndex == 0) this._runLine(this._lines[this._currentIndex])

    this._debugOut(DebugLevel.LogicInspect, "this._currentIndex " + this._currentIndex)
    this._activeLineIndexes = (this._getNextLines(this._currentIndex)
      .filter((k, idx) => this._isActiveLine(this._lines[k]))
    )
    this._debugOut(DebugLevel.LogicInspect, this._activeLineIndexes)
    
    return ([this._lines[this._currentIndex].msg].concat(this._activeLineIndexes
      .map((k, idx) => this._idxToStr(idx) + this._lines[k].msg)
    )).map(msg => msg.split("\\") ).flat().map(t => t.trim()).join("\n")
  }
  chooseLine(k) {
    this._currentIndex = (this._activeLineIndexes[k] || this._runtimeError("Key " + k + " is not active"))
    this._debugOut(DebugLevel.LogicInspect, "this._currentIndex " + this._currentIndex)
    this._runLine(this._lines[this._currentIndex])
  }
  cmdEval(expr) {
    this._debugOut(DebugLevel.Debug, expr)
    this.vm.scopeEval(expr)
  }
  cmdGoto(label) {
    this._debugOut(DebugLevel.LogicInspect, "Goto " + label)
    const nextIndex = this._findLabel(label, this._currentIndex)
    if(nextIndex == null) {
      this._debugOut(DebugLevel.Error, "Could not find label " + tag._label)
    }
    else {
      this._currentIndex = nextIndex
    }
  }
  _runLine(obj) {
    this._runLine_byTag(obj, Tag.Eval, tag => {
      this.cmdEval(tag._expr)
    })
    this._runLine_byTag(obj, Tag.Goto, tag => {
      this.cmdGoto(tag._label)
    })
  }
};


exports.Self = Self
