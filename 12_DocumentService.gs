
var DocumentService={templatePlaceholders:function(text){var out=[],m,rx=/{{\s*([\w.]+)\s*}}/g;while((m=rx.exec(text)))out.push(m[1]);return out;}};
