// Generated by CoffeeScript 1.6.3
(function() {
  var WebSocketServer, audioFolder, fs, path, port, wss;

  fs = require('fs');

  path = require('path');

  WebSocketServer = require('ws').Server;

  port = 8080;

  wss = new WebSocketServer({
    port: port
  });

  audioFolder = '../data/m4a';

  wss.on('connection', function(ws) {
    var audioPath, audioStream, createFileStream, playing;
    audioStream = null;
    audioPath = '';
    playing = false;
    ws.on('close', function() {
      return audioStream != null ? audioStream.removeAllListeners() : void 0;
    });
    ws.on('message', function(msg) {
      msg = JSON.parse(msg);
      if (msg.fileName != null) {
        audioPath = path.join(audioFolder, msg.fileName);
        fs.stat(audioPath, function(err, stats) {
          if (err) {
            return ws.send(JSON.stringify({
              error: 'Could not retrieve file.'
            }));
          } else {
            ws.send(JSON.stringify({
              fileSize: stats.size
            }));
            return createFileStream();
          }
        });
      } else if (msg.resume) {
        if (audioStream != null) {
          audioStream.resume();
        }
        playing = true;
      } else if (msg.pause) {
        if (audioStream != null) {
          audioStream.pause();
        }
        playing = false;
      } else if (msg.reset) {
        if (audioStream != null) {
          audioStream.removeAllListeners();
        }
        playing = false;
        createFileStream();
      }
    });
    return createFileStream = function() {
      audioStream = fs.createReadStream(audioPath);
      if (!playing) {
        audioStream.pause();
      }
      audioStream.on('data', function(data) {
        return ws.send(data, {
          binary: true
        });
      });
      return audioStream.on('end', function() {
        return ws.send(JSON.stringify({
          end: true
        }));
      });
    };
  });

  console.log("Serving WebSocket for Aurora.js on port " + port);

}).call(this);

/*
//@ sourceMappingURL=aurora-ws-server.map
*/
