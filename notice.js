import { RelayServer } from "https://chirimen.org/remote-connection/js/beta/RelayServer.js";

window.OnLED = OnLED;
window.OffLED = OffLED;

var channel;
onload = async function () {
  // webSocketリレーの初期化
  var relay = RelayServer("chirimentest", "chirimenSocket");
  channel = await relay.subscribe("kakasi-chuo");
  messageDiv.innerText = "web socketリレーサービスに接続しました";
  channel.onmessage = getMessage;
};

function getMessage(msg) {
  // メッセージを受信したときに起動する関数
  messageDiv.innerText = msg.data;
  if (msg.data == "カラスが対策グッズになれてしまいました") {
    channel.send("LED ON");
  }
}

function OnLED() {
  // LED ON
  channel.send("LED ON");
}
function OffLED() {
  // LED OFF
  channel.send("LED OFF");
}
