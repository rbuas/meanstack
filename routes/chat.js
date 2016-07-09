var _log = require("../libs/log");
var _chat = require("../models/chat");

module.exports.broadcast = function(socket) {
    _log.message("Chat::client was connect");

    socket.on("connect user", function(user, callback) {
        _log.message("Chat::connect user", user);
        _chat.connectUser(socket, user, callback);
    });

    socket.on("disconnect", function() {
        _log.message("Chat::client was disconnect", socket.user);
        _chat.disconnectUser(socket);
    });

    socket.on("send message", function(msg, callback) {
        _log.message("Chat::client message : " + msg, socket.user);
        _chat.sendMessage(socket, msg, callback);
    });
}