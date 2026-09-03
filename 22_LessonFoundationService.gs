
function listLessons(filters){authorize_('VIEW_LESSONS');var rows=DatabaseService.rows('LESSONS');filters=filters||{};return rows.filter(function(r){return (!filters.status||r.status===filters.status)&&(!filters.query||JSON.stringify(r).toLowerCase().indexOf(String(filters.query).toLowerCase())>=0);});}
