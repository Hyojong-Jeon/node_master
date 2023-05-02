//==============================================================
// This is an example of polling (reading) Holding Registers
// on a regular scan interval with timeouts enabled.
// For robust behaviour, the next action is not activated
// until the previous action is completed (callback served).
//==============================================================
"use strict";
//==============================================================


// Add require
const express   = require('express');
const ModbusRTU = require ("modbus-serial");

// create an empty modbus client
const app     =  express();
const client  =  new ModbusRTU();

app.use(express.json()); // POST 요청에서 JSON 파일을 PARSING 하기 위해 필요

///////////////////////////////////////////////////////
//============Server-Client Data Exchange============//

// Open Server //
app.listen(3000, () => {
    console.log('Server listening on "http://localhost:3000/"');
});

//============ MODBUS RTU Data Exchange =============//
let comPort;
let bitRate;
let modbusID;
let gripperData = new Object();
gripperData.position=0;
gripperData.velocity=0;
gripperData.current=0;

/* 1. Upon SerialPort error */
client.on("error", function(error) {
    console.log("SerialPort Error: ", error);
});

/* 2. Open MODBUS RTU Serial Port from Client Reqeust*/
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

/* 3. Asyncronous Data Receiving from Client*/
app.post('/api/connectClient', (req, res) => {
    // 클라이언트에서 전송한 데이터 처리 코드
    const data = req.body;

    comPort = data.comPort;
    bitRate = data.bitRate;
    modbusID = data.modbusID;
    console.log("PORT = "+comPort+", BITRATE = "+bitRate+", MODBUS ID = "+modbusID);
    connectClient(Number(bitRate), comPort, Number(modbusID));

    res.send('USB Serial Port Opened');
});

app.post('/api/disconnectClient', (req, res) => {
    disconnectClient();
    res.send('USB Serial Port Closed');
});

app.post('/api/gripperPosCtrl', (req, res) => {
    const data = req.body;
    const gripperPosCtrl = 100*Number(data.gripperPosCtrl);
    console.log("[Gripper] Position Control:", gripperPosCtrl, "%");
    writeRegisters([104, gripperPosCtrl]);

    res.send('gripperPosCtrl Received');
});

app.post('/api/gripperInitialize', (req, res) => {
    writeRegisters([101]);
    res.send('gripperInitialize Received');
});

app.post('/api/gripperOpen', (req, res) => {
    writeRegisters([102]);
    res.send('gripperOpen Received');
});

app.post('/api/gripperClose', (req, res) => {
    writeRegisters([103]);
    res.send('gripperClose Received');
});

let intervalID;

app.post('/api/gripperData', (req, res) => {
    let dataRepeat = req.body.dataRepeat;

    if(dataRepeat) {
        intervalID = setInterval(readRegisters, 500);
        console.log("[Gripper] Data Send ON");
    } else {
        clearInterval(intervalID);
        console.log("[Gripper] Data Send OFF");
    }

    res.send('gripperData On/Off');
});

app.get('/api/sendData', (req, res) => {
    const data = gripperData;
    res.send(data);
  });

const connectClient = function(baudRateVal, comPortVal, modbusID) {
    // set requests parameters
    client.setID      (modbusID);
    // client.setTimeout (mbsTimeout);

    // try to connect
    client.connectRTUBuffered (comPortVal, { baudRate: baudRateVal, parity: "none", dataBits: 8, stopBits: 1 })
        .then(function() {
            console.log("[USB Connected, wait for reading]");
        })
        .catch(function(e) {
            console.log(e);
        })
};

const disconnectClient = function() {
    client.close( function() {console.log(comPort+' 장치와의 연결이 종료되었습니다.')})
};

const writeRegisters = function(values)  {
    // write 3 registers statrting at register 101
    // negative values (< 0) have to add 65535 for Modbus registers
    const modbusID = 0;

    client.writeRegisters(modbusID, values)
        .then(function(d) {
            console.log("MODBUS Write Registers", values, d);
        })
        .catch(function(e) {
            console.log(e.message);
        })
};

const readRegisters = function() {
    // try to read data
    client.readHoldingRegisters (11, 3)
        .then(function(data) {
            // let buffer = new ArrayBuffer(2); // 2바이트 버퍼 생성
            // let int16Array = new Int16Array(buffer); // 16비트 정수 배열 생성
            // int16Array[0] = data.data[0]; // 16비트 부호 있는 정수 할당
            // int16Array[1] = data.data[1]; // 16비트 부호 있는 정수 할당
            // int16Array[2] = data.data[2]; // 16비트 부호 있는 정수 할당

            // console.log(int16Array[0]); // -1234

            gripperData.position = data.data[0];
            gripperData.current  = data.data[1];
            gripperData.velocity = data.data[2];
            // console.log( gripperData );
        })
        .catch(function(e) {
            console.log(e);
        });
};



