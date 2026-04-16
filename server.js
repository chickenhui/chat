const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

let clients = [];
let history = [];
const MAX = 200;

wss.on('connection', (ws) => {
  let userId = '用户' + Math.random().toString(36).substr(2,6);
  clients.push({ ws, userId });

  ws.send(JSON.stringify({type:'init', history}));
  sysMsg(userId + ' 进入房间');
  sendUserList();

  ws.on('message',(data)=>{
    try{
      let msg = JSON.parse(data);
      let time = new Date().toLocaleTimeString();
      let obj = {
        from:userId, to:msg.to||'',
        content:msg.content, time,
        type:msg.type||'chat'
      };

      if(obj.type==='chat'&&!obj.to){
        history.push(obj);
        if(history.length>MAX)history.shift();
        sendAll(obj);
      }
      if(obj.type==='private'&&obj.to){
        sendPrivate(obj);
      }
    }catch(e){}
  });

  ws.on('close',()=>{
    clients=clients.filter(c=>c.ws!==ws);
    sysMsg(userId+' 离开房间');
    sendUserList();
  });
});

function sendAll(msg){
  let str=JSON.stringify(msg);
  clients.forEach(c=>c.ws.readyState===1&&c.ws.send(str));
}

function sendPrivate(msg){
  let str=JSON.stringify({...msg,isPrivate:true});
  clients.forEach(c=>{
    if(c.userId===msg.from||c.userId===msg.to)
      c.ws.readyState===1&&c.ws.send(str);
  });
}

function sysMsg(content){
  sendAll({type:'system',content,time:new Date().toLocaleTimeString()});
}

function sendUserList(){
  let list = clients.map(c=>c.userId);
  sendAll({type:'userList',users:list});
}

server.listen(process.env.PORT||3000);