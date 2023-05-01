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

let mbsStatus   = "Initializing...";    // holds a status of Modbus

// Modbus 'state' constants
const MBS_STATE_INIT          = "State init";
const MBS_STATE_IDLE          = "State idle";
const MBS_STATE_NEXT          = "State next";
const MBS_STATE_GOOD_READ     = "State good (read)";
const MBS_STATE_FAIL_READ     = "State fail (read)";
const MBS_STATE_GOOD_CONNECT  = "State good (port)";
const MBS_STATE_FAIL_CONNECT  = "State fail (port)";

// Modbus configuration values

const mbsScan     = 1000;
const mbsTimeout  = 5000;
let mbsState    = MBS_STATE_INIT;




//==============================================================
const readModbusData = function()
{
    // try to read data
    client.readHoldingRegisters (11, 1)
        .then(function(data)
        {
            mbsState   = MBS_STATE_GOOD_READ;
            mbsStatus  = "success";
            console.log( Number( data.data ) );
            // 모드버스를 통해 받은 데이터
        })
        .catch(function(e)
        {
            mbsState  = MBS_STATE_FAIL_READ;
            mbsStatus = e.message;
            console.log(e);
        });
};

//==============================================================
const runModbus = function()
{
    let nextAction;

    switch (mbsState)
    {
        case MBS_STATE_INIT:
            nextAction = connectClient;
            break;

        case MBS_STATE_NEXT:
            nextAction = readModbusData;
            break;

        case MBS_STATE_GOOD_CONNECT:
            nextAction = readModbusData;
            break;

        case MBS_STATE_FAIL_CONNECT:
            nextAction = connectClient;
            break;

        case MBS_STATE_GOOD_READ:
            nextAction = readModbusData;
            break;

        case MBS_STATE_FAIL_READ:
            if (client.isOpen)  { mbsState = MBS_STATE_NEXT;  }
            else                { nextAction = connectClient; }
            break;

        default:
            // nothing to do, keep scanning until actionable case
    }

    // console.log();
    console.log(nextAction);

    // execute "next action" function if defined
    if (nextAction !== undefined)
    {
        nextAction();
        mbsState = MBS_STATE_IDLE;
    }

    // set for next run
    setTimeout (runModbus, mbsScan);
};

//============Server-Client Data Exchange============//

// Open Server //
app.listen(3000, () => {
    console.log('Server listening on "http://localhost:3000/"');
});

//============ MODBUS RTU Data Exchange =============//
var comPort;
var bitRate;
var modbusID;

/* 1. Upon SerialPort error */
client.on("error", function(error) {
    console.log("SerialPort Error: ", error);
});

/* 2. Open MODBUS RTU Serial Port from Client Reqeust*/
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

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
    var data = req.body;
    var gripperPosCtrl = Number(data.gripperPosCtrl);
    // console.log(gripperPosCtrl);

    res.send('gripperPosCtrl Received');
});

const connectClient = function(baudRateVal, comPortVal, modbusID) {
    // set requests parameters
    client.setID      (modbusID);
    client.setTimeout (mbsTimeout);

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

const writeRegisters = function(modbusID, values)  {
    // write 3 registers statrting at register 101
    // negative values (< 0) have to add 65535 for Modbus registers
    client.writeRegisters(modbusID, values)
        .then(function(d) {
            console.log("MODBUS Write Registers", values, d);
        })
        .catch(function(e) {
            console.log(e.message);
        })
};

// runModbus();
// setTimeout (writeRegisters, 1500);


