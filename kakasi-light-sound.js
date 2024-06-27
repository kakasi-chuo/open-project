import {requestGPIOAccess} from "./node_modules/node-web-gpio/dist/index.js";
import { requestI2CAccess } from "./node_modules/node-web-i2c/index.js";
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
import nodeWebSocketLib from "websocket"; // https://www.npmjs.com/package/websocket
import {RelayServer} from "./RelayServer.js";
import NPIX from "@chirimen/neopixel-i2c";

const neoPixels = 20; //  LED個数


var channel;

blink();


async function blink(){
    const gpioAccess = await requestGPIOAccess();
    const i2cAccess = await requestI2CAccess();
    const port = i2cAccess.ports.get(1); //LEDのポート番号
    const npix = new NPIX(port, 0x41);
    await npix.init(neoPixels);
    const rport = gpioAccess.ports.get(26); //レコーダーのポート番号
    const sport = gpioAccess.ports.get(12); //センサのポート番号
    await rport.export("out");
    await sport.export("in");

  // webSocketリレーの初期化
    var relay = RelayServer("chirimentest", "chirimenSocket" , nodeWebSocketLib, "https://chirimen.org");
    channel = await relay.subscribe("kakasi-chuo");
    let num = 0; // センサがカラスに反応した回数
    
    sport.onchange = showPort;
    function showPort(ev){
        console.log(ev.value);
    }

    for (;;) {
        const v = await sport.read(); //センサがカラスに反応したか判定を行う
        if(v == 1){
            num+=1;
            await rport.write(1); //音声開始
            await nPixTest1(npix); //ライトON
            await rport.write(0); //音声終了
            await sleep(1250); 
        }

        const N = 1;                   //通知するまでの上限の回数を設定
        if(num > N){
            channel.send("カラスが対策グッズになれてしまいました");
            //パソコンへ通知を送る
        }
    }
}



async function nPixTest1(npix) {
    //LEDの光り方を決める関数
    await npix.setGlobal(10, 0, 0);
    await sleep(1250);
    await npix.setGlobal(0, 10, 0);
    await sleep(1250);
    await npix.setGlobal(0, 0, 10);
    await sleep(1250);
    await npix.setGlobal(0, 20, 20);
    await sleep(1250);
    await npix.setGlobal(20, 0, 20);
    await sleep(1250);
    await npix.setGlobal(20, 20, 0);
    await sleep(1250);
    await npix.setGlobal(20, 20, 20);
    await sleep(1250);
    await npix.setGlobal(0, 0, 0);
}

