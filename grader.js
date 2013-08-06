#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
//var URL_DEFAULT = "http://www.google.com";

var assertFileExists = function(infile) {
  //console.log("== I am in assertFileExists ==");
  
  var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlExists = function(url) {
  //console.log("== I am in assertUrlExist ==");

  rest.get(url).on('complete', function(result) {
    if (result instanceof Error) {
      console.log("Can't scrape the url");
      process.exit(1);
    } else {
     
      console.log(result);
      //fs.writeFileSync(HTMLFILE_DEFAULT,result);
      return result.toString();
    }
 });
}


var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkUrl = function(htmlurl, checksfile) {
    //$ = cheerioHtmlFile(htmlfile);
    console.log("=== in checkurl ===");
    console.log(htmlurl);
    $ = cheerio.load(htmlurl);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'Path to an url', clone(assertUrlExists))
	.parse(process.argv);
    console.log("?? what is url???");
    console.log(program.url);
    
    if (program.url) {
        console.log("url is provided");
  	var checkJson = checkUrl(program.url, program.checks);
        //console.log(checkJson);
    } else {
        console.log("url is not provided");
        var checkJson = checkHtmlFile(program.file, program.checks);
    } 

    var checkJson = checkHtmlFile(program.file, program.checks);
   
    //console.log("==========");
    //console.log(checkJson);
    //console.log("==========");
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
