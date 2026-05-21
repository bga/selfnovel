
class NodeVmRunner {
  /*
  _withifyExpr(expr) {
    var r = /^\s+ ((?<var>\w+) (?<num> \d+(\.\d+)) (?<str> \"[^\"]+\") (?<op> (([+-*\/%](\=)?) | \= )))/sx
    var m, v; while(m = r.exec(expr)) {
      if(null) {}
      else if(v = m.groups["var"]) {
        if(!this._scope.hasOwnProperty(v)) {
          this._scope[v] = null
        };
      }
    }
  }
  */
  _scopifyExpr(expr) {
    var r = new RegExp(/(?<prefix> \s*) (?<exprAll> (?<var> [a-zA-Z\$_][a-zA-Z\$_\d]*) | (?<num> -?\d+(\.\d+)?) | (?<strD> \"[^\"]+\") | (?<strS> \'[^\']+\') | (?<lOp> [,;\?\:]) | (?<op> ( ([\+\-\*\/%\(\)\[\]] \=) | \= ) ) )/.source.replace(/\s+/g, ""), "sy")
    // var r = new RegExp(/(?<prefix> \s*) (?<exprAll> (?<var> [\w\$_][\w\$_\d]+))/.source.replace(/\s+/g, ""), "sy")
    var out = ""
    var m, v; while(m = r.exec(expr)) {
      out += m.groups["prefix"]
      if(v = m.groups["var"]) {
        out += "_scope." + v
        if(!this._scope.hasOwnProperty(v)) {
          console.log("init " + v)
          this._scope[v] = null
        };
      }
      else {
        out += m.groups["exprAll"]
      }
    }
    return out
  }
  create(obj) {
    this._scope = obj
  }
  scopeEval(s) {
    var expr = this._scopifyExpr(s)
    // console.log(expr)
    // console.log(this._scope)
    return new Function("_scope", "return " + expr)(this._scope)
  }
}

exports.Self = NodeVmRunner
