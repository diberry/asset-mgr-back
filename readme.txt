https://github.com/Microsoft/vscode-recipes/tree/master/nodemon
1) npm run debug
2) VSCode debug


files uploaded to "uploads"
mp3 files generated and put into "out", route users /download

current file name is guid + ".mp3"

feature flipping
https://www.npmjs.com/package/fflip



https://www.zeolearn.com/magazine/background-processing-in-node-js


batch transcription
batch text to speech - get private preview from Erik

Add mocks so I'm not hitting live website

P0 - figure out which looping is sync and async

download stream example - https://medium.com/@richard534/uploading-streaming-audio-using-nodejs-express-mongodb-gridfs-b031a0bcb20f

http.createServer(function (req, resp) {
  if (req.url === '/doodle.png') {
    if (req.method === 'PUT') {
      req.pipe(request.put('http://mysite.com/doodle.png'))
    } else if (req.method === 'GET' || req.method === 'HEAD') {
      request.get('http://mysite.com/doodle.png').pipe(resp)
    }
  }
})

https://stackoverflow.com/questions/42571829/stream-rest-api-http-response-in-node-js-express
var http = require( 'http' );

http.createServer( function ( req, res ) {
res.writeHead( 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
    'X-Content-Type-Options': 'nosniff'
} );
res.write( 'Beginning\n' );
var count = 10;
var io = setInterval( function () {
    res.write( 'Doing ' + count.toString() + '\n' );
    count--;
    if ( count === 0 ) {
        res.end( 'Finished\n' );
        clearInterval( io );
    }
}, 1000 );
} ).listen( 8000 );