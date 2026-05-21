
;(function($G) {
require.load([
  "./WebVmRunner.js", 
  "./HtmlRenderer.js", 
  "./Renderer.js",
  "./webFs.js"
  ], (err) => 
{
console.log("run!")

const HtmlRenderer = require("./HtmlRenderer.js").Self
const Renderer = require("./Renderer.js").Self
const VmRunner = require("./WebVmRunner.js").Self
const fs = require("./webFs.js")


var renderer = new Renderer()
var htmlRenderer = new HtmlRenderer()

var scenePath = "";


function Dom_wait() {
  if(!document.readyState.match(/^(interactive|complete)$/)) {
    setTimeout(Dom_wait, 100 /* ms */)
    return
  };
  onDomLoad()
}
Dom_wait()


function onDomLoad() {
  main($G.cliArgs)
}


function Dom_set_bgImg(src) {
  document.body.style.backgroundImage = "".concat("url('", src, "')")
}

function renderer_onReset() {
  renderer.vm = new VmRunner()

  const vmScriptGlobal = {}
  $bg_src = ""
  Object.defineProperty(vmScriptGlobal, "bg_src0", {
    get: (_) => $bg_src, 
    set: (v) => { Dom_set_bgImg(window.location + "/../" + ($bg_src = v)); return v }
  });
  renderer.vm.create(vmScriptGlobal)

  if(0) {
  console.log(renderer.vm.scopeEval("$bg_src = 'abc'; a = 1"))
  console.log(vmScriptGlobal.$bg_src)
  console.log(renderer.vm.scopeEval("a += 1; a"))
  };
  
}



function renderer_reset() {
  renderer.onReset = renderer_onReset
  renderer.init()
  renderer.eol = "<br />"

  console.log("reset!")
  renderer.parse(dom_scriptEdit.value)
  onSceneFileLoad()
}



function main(args) {
  console.log("main")
  const questDomElementId = args[0]
  scenePath = args[1]

  // const print = msg => process.stdout.write(msg + "\n")


  htmlRenderer.init()
  if(1) {
    let domEl = document.getElementById(questDomElementId)
    if(domEl == null) {
      throw new Error("domId " + questDomElementId + " not found")
    };
    htmlRenderer.bind(domEl)
    htmlRenderer.onSelectAnswear = onStep
  };

  document.addEventListener("keydown", Dom_onKeyUp, true)

  dom_scriptEdit.style.display = "none"  

  dom_ctrl_reset.onclick = renderer_reset
  dom_ctrl_editToggle.onclick = Mode_enterEditMode


  console.log(window.location + "/../" + scenePath)
  fs.readFile(window.location + "/../" + scenePath, 'utf8', (err, data) => {
    if(err != null) throw err;
    dom_scriptEdit.value = data
    renderer_reset()
  });
  
  // return

  // console.log(renderer._lines)

  renderer_reset()
}

function Mode_enterEditMode() {
  if(dom_scriptEdit.style.display == "none") {
    dom_scriptEdit.style.display = ""
    dom_quest00.style.display = "none"
  }
  else {
    dom_scriptEdit.style.display = "none"
    dom_quest00.style.display = ""
  }
}

function Log_viewToggle() {
  
}

function Dom_Element_isEditable(v) {
  return v.tagName == 'TEXTAREA' || v.tagName == 'INPUT' 
}
function Dom_onKeyUp(e) {
  // console.log(e)
  if(Dom_Element_isEditable(e.target)) return;

  switch(e.key) {
    case('r'): renderer_reset(); break;
    case('e'): case('E'): Mode_enterEditMode(); break;
    case('l'): Log_viewToggle(); break;
    default: {
      const k = e.keyCode - 49 + 0
      console.log("k", k)
      onStep(k)
    } break;
  }
  
}

function Dom_update() {
  htmlRenderer.set_question(renderer.getQuestionMsg())
  htmlRenderer.set_answearsList(renderer.getAnswearMsgs())
}
function onStep(choose) {
  console.log("choose = " + choose)
  if(choose == null) return
  if(!(0 <= choose && choose < renderer.getAnswearMsgsLength())) return;

  // renderer.chooseLine(choose.charCodeAt(0) - '1'.charCodeAt(0))
  renderer.chooseLine(choose)
  Dom_update()  
  // print(renderer.printDialog())
  
}

function onSceneFileLoad() {
  Dom_update()
}


})})(window)
