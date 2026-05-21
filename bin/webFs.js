console.log("webFs.js")

exports.readFile = function(url, encoding, onComplete) {
  var xhr = new XMLHttpRequest();
  
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function(ev) {  
    if (xhr.readyState == 4) {
      if ((200 <= xhr.status && xhr.status < 300)
        || (xhr.status === 0 && url.match(/^(?:https?|ftp):\/\//i))) {
        onComplete(null, xhr.responseText)
      } else {
        onComplete(new Error('failed to load remote module with HTTP'+
                           ' response status '+xhr.status+' '+
                           xhr.responseText),  null);
      }
    }
  };
  xhr.send(null);
}
