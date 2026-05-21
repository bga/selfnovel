const vm = require("vm")

class NodeVmRunner {
  create(obj) {
    this._vm = obj
    vm.createContext(this._vm);
  }
  scopeEval(s) {
    return vm.runInContext(s, this._vm);
  }
}

exports.Self = NodeVmRunner
