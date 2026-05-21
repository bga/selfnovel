exports.neq = function(a,  b) {
  if(!(a != b)) throw new Error("assert.neq failed. " + a + " == " + b)
}
