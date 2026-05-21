// const assert = require("./assert.js") 

class HtmlRenderer {
  init() {
    this._domRoot = null
    this.onSelectAnswear = null
  }
  bind(domRoot) {
    this._domRoot = domRoot
    // assert.neq(this._domRoot, null)

    // this._domRoot.addEventListener("keyup", this._onKeyPress.bind(this), true)
    this._domRoot.addEventListener("click", this._onClick.bind(this), true)
  }
  _onClick(e) {
    console.log(e)
    const currentTarget = e.target
    if(currentTarget.tagName != "LI") return
    const k = currentTarget.getAttribute("k")
    console.log("k", k)
    k != null && this.onSelectAnswear && this.onSelectAnswear(+k)
  }
  set_question(txt) {
    this._domRoot.getElementsByClassName("question-text")[0].innerHTML = txt
  }
  set_answearsList(list) {
    console.log(list)
    this._domRoot.getElementsByClassName("answears-text")[0].innerHTML = (list
      .map((t, idx) => "".concat("<li k=", idx, ">", t, "</li>"))
      .join("\n")
    )
  }
  set_bgImg(src) {
    console.log(src)
    this._domRoot.style.backgroudImage = "".concat("url('", src, "')")
  }
};


exports.Self = HtmlRenderer
