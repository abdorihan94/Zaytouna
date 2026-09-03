
function nextId_(type){var p=ID_PREFIXES[type]||String(type).toUpperCase().slice(0,3), sh=DatabaseService.ensureSheet('SEQUENCES',['key','value']), rows=DatabaseService.rows('SEQUENCES'), found=rows.filter(function(r){return r.key===type;})[0], n=found?Number(found.value)+1:1;DatabaseService.upsert('SEQUENCES',{id:type,key:type,value:n});return p+'-'+('000000'+n).slice(-6);}
