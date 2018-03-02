var Parser = module.exports;

Parser.parseQueryResults = function(results) {
    for(const key in results){
        results[key] = results[key].value;
    }

    return results;
}