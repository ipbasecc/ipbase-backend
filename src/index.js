'use strict';

module.exports = {
  register(/*{ strapi }*/) {},

  bootstrap({ strapi }) {
    // const server = 'ws://localhost:61337';
    // const { WebsocketProvider } = require('y-websocket');

    // const provider = (room, _ydoc) => {
    //     return new WebsocketProvider(
    //       server, room, _ydoc, { WebSocketPolyfill: require('ws') }
    //     )
    // }
    // strapi.provider = provider

    const { WebSocketServer } = require("ws");

    // 创建 yjs ws 服务
    // 测试 不要使用
    const yjsws = new WebSocketServer({ port: 61337 });

    yjsws.on("connection", (conn, req) => {
      console.log('"yjs connection"'); // 标识每一个连接用户，用于广播不同的文件协同
      conn.onmessage = (event) => {
        yjsws.clients.forEach((conn) => {
          conn.send(event.data);
        });
      };

      conn.on("close", (conn) => {
        console.log("yjs 用户关闭连接");
      });
    })
  }
}
