// import Self as Renderer
const Renderer = require("./Renderer").Self
// const NodeVmRunner = require("./NodeVmRunner").Self
const NodeVmRunner = require("./WebVmRunner").Self
const fs = require("fs")
const readline = require("readline")

;function main(args) {
  const scenePath = args[1]

  var renderer = new Renderer()
  const print = msg => process.stdout.write(msg + "\n")

  renderer.onReset = renderer => {
    renderer.vm = new NodeVmRunner()

    const vmScriptGlobal = {
      $bg_src: "" 
    };
    renderer.vm.create(vmScriptGlobal)
    if(1) {
    console.log(renderer.vm.scopeEval("$bg_src = 'abc'"))
    console.log(renderer.vm.scopeEval("a = 1"))
    console.log(vmScriptGlobal.$bg_src)
    console.log(renderer.vm.scopeEval("a += 1"))
    console.log(renderer.vm.scopeEval("a"))
    };
  };
  renderer.init()
  // return

  // console.log(renderer._lines)


  renderer.parse(fs.readFileSync(scenePath, 'utf8'))
  // console.log(renderer._lines)
  // console.log(renderer._lines[0].tags)
  console.log(renderer._lines[0])
  console.log(renderer._lines[1])

  // print(renderer.printDialog())
  // return
  
  
  var rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout,

    prompt: "% ", 

    terminal: true,
    historySize: 2000,  
  })
  
  const iter = (choose) => {
    console.log("choose = " + choose)
    if(choose == null) return

    renderer.chooseLine(choose.charCodeAt(0) - '1'.charCodeAt(0))
    print(renderer.printDialog())
    // var buffer = Buffer.alloc(1)
    // const choose = fs.readSync(process.stdin.fd, buffer, 0, 1)
    // process.stdin.pause()
    // console.log(choose)
    // console.log(buffer)
    
  }
  rl.on('line',  (choose) => {
    if(choose == null) return;
    if(choose.length == 1) iter(choose)
    rl.write("")

    var m = choose.match(/^>(\S+)/);
    if(m != null) {
      renderer.cmdGoto(m[1])
      print(renderer.printDialog())
    };  

    var m = choose.match(/^\$(\S+)/);
    if(m != null) {
      renderer.cmdEval(m[1])
      print(renderer.printDialog())
    };  
  })
  print(renderer.printDialog())
  // iter(null)
  return
  
  while(!renderer.isEnd()) {
    print(renderer.printDialog())
    var buffer = Buffer.alloc(1)
    const choose = fs.readSync(process.stdin.fd, buffer, 0, 1)
    process.stdin.pause()
    console.log(choose)
    console.log(buffer)
    renderer.chooseLine(choose.charCodeAt(0) - '1'.charCodeAt(0))
  }
}

main([].slice.call(process.argv, 1))
