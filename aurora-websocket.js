// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AV.WebSocketSource = (function(_super) {
    __extends(WebSocketSource, _super);

    function WebSocketSource(serverUrl, fileName) {
      this.serverUrl = serverUrl;
      this.fileName = fileName;
      if (typeof WebSocket === "undefined" || WebSocket === null) {
        return this.emit('error', 'This browser does not have WebSocket support.');
      }
      this.socket = new WebSocket(this.serverUrl);
      if (this.socket.binaryType == null) {
        this.socket.close();
        return this.emit('error', 'This browser does not have binary WebSocket support.');
      }
      this.bytesLoaded = 0;
      this._setupSocket();
    }

    WebSocketSource.prototype.start = function() {
      return this._send(JSON.stringify({
        resume: true
      }));
    };

    WebSocketSource.prototype.pause = function() {
      return this._send(JSON.stringify({
        pause: true
      }));
    };

    WebSocketSource.prototype.reset = function() {
      return this._send(JSON.stringify({
        reset: true
      }));
    };

    WebSocketSource.prototype._send = function(msg) {
      if (!this.open) {
        return this._bufferMessage = msg;
      } else {
        return this.socket.send(msg);
      }
    };

    WebSocketSource.prototype._setupSocket = function() {
      var _this = this;
      this.socket.binaryType = 'arraybuffer';
      this.socket.onopen = function() {
        _this.open = true;
        _this.socket.send(JSON.stringify({
          fileName: _this.fileName
        }));
        if (_this._bufferMessage) {
          _this.socket.send(_this._bufferMessage);
          return _this._bufferMessage = null;
        }
      };
      this.socket.onmessage = function(e) {
        var buf, data;
        data = e.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
          if (data.fileSize != null) {
            return _this.length = data.fileSize;
          } else if (data.error != null) {
            return _this.emit('error', data.error);
          } else if (data.end) {
            return _this.socket.close();
          }
        } else {
          buf = new AV.Buffer(new Uint8Array(data));
          _this.bytesLoaded += buf.length;
          if (_this.length) {
            _this.emit('progress', _this.bytesLoaded / _this.length * 100);
          }
          return _this.emit('data', buf);
        }
      };
      this.socket.onclose = function(e) {
        _this.open = false;
        if (e.wasClean) {
          return _this.emit('end');
        } else {
          return _this.emit('error', 'WebSocket closed uncleanly with code ' + e.code + '.');
        }
      };
      return this.socket.onerror = function(err) {
        return _this.emit('error', err);
      };
    };

    return WebSocketSource;

  })(AV.EventEmitter);

  AV.Asset.fromWebSocket = function(serverUrl, fileName) {
    var source;
    source = new AV.WebSocketSource(serverUrl, fileName);
    return new AV.Asset(source);
  };

  AV.Player.fromWebSocket = function(serverUrl, fileName) {
    var asset;
    asset = AV.Asset.fromWebSocket(serverUrl, fileName);
    return new AV.Player(asset);
  };

}).call(this);

/*
//@ sourceMappingURL=aurora-websocket.map
*/
