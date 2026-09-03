
function validateRecord_(data,required){required.forEach(function(k){if(!safeText_(data[k]))throw Error('الحقل مطلوب: '+k);});return data;}
