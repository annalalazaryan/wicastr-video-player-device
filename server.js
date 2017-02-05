var fs = require('fs');
var stdin = process.stdin,
    stdout = process.stdout,
    inputChunks = [];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});

stdin.on('end', function () {
    var inputJSON = inputChunks.join(),
        parsedData = JSON.parse(inputJSON),
        outputJSON = JSON.stringify(parsedData, null, '    ');
    stdout.write(outputJSON);
    stdout.write('\n');
    fs.writeFile("a.json", outputJSON, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
});