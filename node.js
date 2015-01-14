var proxyNum = 200; //The number of proxy services you like to try at once.
var targetURL = 'http://www.google.com/'; //The URL you like to visit.

var http = require('http');
http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');

var proxyChecker = require('proxy-checker');
var fs = require('fs');

function nth_occurrence (string, char, nth) {
    var first_index = string.indexOf(char);
    var length_up_to_first_index = first_index + 1;

    if (nth == 1) {
        return first_index;
    } else {
        var string_after_first_occurrence = string.slice(length_up_to_first_index);
        var next_occurrence = nth_occurrence(string_after_first_occurrence, char, nth - 1);

        if (next_occurrence === -1) {
            return -1;
        } else {
            return length_up_to_first_index + next_occurrence;  
        }
    }
}

function get_line(filename, line_no, callback) {
	fs.readFile(filename, function (err, data) {
		if (err) throw err;
		// Data is a buffer that we need to convert to a string
		// Improvement: loop over the buffer and stop when the line is reached
		var originalText = data.toString('utf-8');
		var lines = originalText.split("\n");
		var lineBreak = nth_occurrence (originalText, "\n", proxyNum);
		var newText = originalText.substr(lineBreak + 1);
		if(+line_no > lines.length){
			return callback('File end reached without finding line', null);
		}

		callback(null, lines[+line_no], line_no, newText);
	});
}

var operationsCompleted = 0;
function operation() {
    ++operationsCompleted;
    if (operationsCompleted === proxyNum) after_forloop(); 
}

for (i = 0; i < proxyNum; i++) {
	get_line('proxy.txt', i, function(err, line, line_no, newText){
		fs.appendFile('cache.txt', line + '\n', function (err) {
			if (err) throw err;
			operation();
		});
		if (line_no === proxyNum - 1) {
			fs.writeFile('proxy.txt', newText, function (err) {
				if (err) throw err;					
			});
			console.log("Proxy test began.");
		}
	});
}

function after_forloop() {
	proxyChecker.checkProxiesFromFile(
		// The path to the file containing proxies
		'cache.txt',
		{
			// the complete URL to check the proxy
			url: targetURL,	
			// an optional regex to check for the presence of some text on the page
			regex: /.*/
		},
		// Callback function to be called after the check
		function(host, port, ok, statusCode, err) {
			// console.log(host + ':' + port + ' => '
			//	+ ok + ' (status: ' + statusCode + ', err: ' + err + ')');
			console.log(ok + ': [' + statusCode + '] ' + host + ':' + port);
			if (ok) {				
				fs.appendFile('result.txt', host + ':' + port + '\n', function (err) {
					if (err) throw err;				
				});
			}					
		}
	);

	setTimeout(function(){
		fs.writeFile('cache.txt', "", function (err) {
			if (err) throw err;
		});
		console.log('Proxy check completed.')
		process.exit(1); 
	}, proxyNum * 200);
}