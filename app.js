let ws = new WebSocket('wss://chat-h8hv.onrender.com');
let msgBox = document.getElementById('msgBox');
let input = document.getElementById('input');
let userList = document.getElementById('userList');
let emoPanel = document.getElementById('emoPanel');
let emojis = ['😀','😂','😊','👍','❤️','🎉','哈哈','加油','ok'];

let myId = '';
let target = '';

emojis.forEach(e=>{
  let d = document.createElement('div');
  d.className='emo';
  d.innerText=e;
  d.onclick=()=>{input.value+=e;emoPanel.style.display='none'}
  emoPanel.appendChild(d);
});

document.getElementById('emoBtn').onclick=()=>{
  emoPanel.style.display = emoPanel.style.display=='none'?'flex':'none';
}
emoPanel.style.display='none';

ws.onmessage=(e)=>{
  let d = JSON.parse(e.data);
  if(d.type=='init'){d.history.forEach(addMsg);return}
  if(d.type=='userList'){renderUsers(d.users);return}
  if(d.type=='system'){addSys(d.content);return}
  addMsg(d);
}

function send(){
  if(!input.value)return;
  ws.send(JSON.stringify({
    type:target?'private':'chat',
    to:target, content:input.value
  }));
  input.value='';
}

function renderUsers(users){
  userList.innerHTML='';
  users.forEach(u=>{
    let d=document.createElement('div');
    d.className='user';
    d.innerText=u;
    d.onclick=()=>{target=u;alert('私聊：'+u)};
    userList.appendChild(d);
  })
}

function addMsg(m){
  let d=document.createElement('div');
  let cls = 'msg '+(m.isPrivate?'pri':'')+(m.from==myId?' my':' other');
  d.className=cls;
  d.innerHTML=`<div class="bubble">${m.isPrivate?'[私聊]':''}${m.from}：${m.content}</div>`;
  msgBox.appendChild(d);
  msgBox.scrollTop=msgBox.scrollHeight;
}

function addSys(c){
  let d=document.createElement('div');
  d.className='system';
  d.innerText=c;
  msgBox.appendChild(d);
}

input.onkeydown=(e)=>e.key=='Enter'&&send();
