// Connect Button 실행 함수
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const bitRateVal = document.getElementById("bitRate");
const comPortVal = document.getElementById("comPort");
const modbusIDVal = document.getElementById("modbusID");
const changeMBAddressVal = document.getElementById("writeMBAddress");
const changeElAngleVal   = document.getElementById("writeElAngle");

connectBtn.addEventListener("click", function() {
// 서버로 요청을 보내는 코드
var comPort  = comPortVal.value;
var bitRate  = bitRateVal.value;
var modbusID = modbusIDVal.value;

let data = new Object();
data.comPort  = comPort;
data.bitRate  = bitRate;
data.modbusID = modbusID;

const url = '/api/connectClient';

fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(data => {
    // 서버 응답 처리 코드
    console.log(data);
    })
    .catch(error => {
    // 오류 처리 코드
    });
});
disconnectBtn.addEventListener("click", function() {
// 서버로 요청을 보내는 코드
const url = '/api/disconnectClient';

fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    //body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(data => {
    // 서버 응답 처리 코드
    console.log(data);
    })
    .catch(error => {
    // 오류 처리 코드
    });
});

// 슬라이더 처리 함수 //
const slider = document.getElementById("grpPosRNG");
const output = document.getElementById("sliderValue");

output.innerHTML = slider.value + '%';

slider.oninput = function() {
output.innerHTML = this.value + '%';
}
slider.onchange = function() {
//값이 바뀌고 난 후 콜백함수
const url = '/api/gripperPosCtrl';
let data = new Object();
data.gripperPosCtrl = this.value;

fetch(url, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})
.then(response => response.text())
.then(data => {
    // 서버 응답 처리 코드
    // console.log(data);
})
.catch(error => {
    // 오류 처리 코드
    console.error(error);
});
}

const gripperInitialize = function() {
url = '/api/gripperInitialize';

fetch(url, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    // body: JSON.stringify(data)
})
.then(response => response.text())
.then(data => {
    console.log(data);
})
.catch(error => {
    console.error(error);
});
}

const gripperOpen = function() {
url = '/api/gripperOpen';

fetch(url, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    // body: JSON.stringify(data)
})
.then(response => response.text())
.then(data => {
    console.log(data);
})
.catch(error => {
    console.error(error);
});
}

const gripperClose = function() {
url = '/api/gripperClose';

fetch(url, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    // body: JSON.stringify(data)
})
.then(response => response.text())
.then(data => {
    console.log(data);
})
.catch(error => {
    console.error(error);
});
}

const gripperWriteMBAddress = function() {
url = '/api/gripperWriteMBAddress';
let changeMBAddress = changeMBAddressVal.value;

let data = new Object();
data.changeMBAddress  = changeMBAddress;

fetch(url, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})
.then(response => response.text())
.then(data => {
    console.log(data);
})
.catch(error => {
    console.error(error);
});
}

const gripperWriteElAngle = function() {
url = '/api/gripperWriteElAngle';
let changeElAngle = changeElAngleVal.value;

let data = new Object();
data.changeElAngle  = changeElAngle;

fetch(url, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})
.then(response => response.text())
.then(data => {
    console.log(data);
})
.catch(error => {
    console.error(error);
});
}


let intervalID;

const dataReceive = document.getElementById("dataReceive");
dataReceive.onchange = function() {
url = '/api/gripperData';

if (dataReceive.checked) {
    data = {dataRepeat: true};
    intervalID = setInterval(readData, 100);
} else {
    data = {dataRepeat: false};
    clearInterval(intervalID);
}

fetch(url, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})
.then(response => response.text())
.then(data => {
    console.log(data);
})
.catch(error => {
    console.error(error);
});
}
// dataTake
const readData = function() {
url = '/api/sendData';

fetch(url)
    .then(response => response.json())
    .then(function(data) {
    const grpPos = document.getElementById("grpPos");
    const grpVel = document.getElementById("grpVel");
    const grpCur = document.getElementById("grpCur");

    let buffer1 = new ArrayBuffer(2); // 2바이트 버퍼 생성
    let int16Array1 = new Int16Array(buffer1); // 16비트 정수 배열 생성
    let buffer2 = new ArrayBuffer(2); // 2바이트 버퍼 생성
    let int16Array2 = new Int16Array(buffer2); // 16비트 정수 배열 생성
    let buffer3 = new ArrayBuffer(2); // 2바이트 버퍼 생성
    let int16Array3 = new Int16Array(buffer3); // 16비트 정수 배열 생성
    int16Array1[0] = data.position; // 16비트 부호 있는 정수 할당
    int16Array2[0] = data.velocity; // 16비트 부호 있는 정수 할당
    int16Array3[0] = data.current; // 16비트 부호 있는 정수 할당

    // console.log(data); // -1234

    grpPos.text = int16Array1[0]+" deg";
    grpVel.text = int16Array2[0]+" RPM";
    grpCur.text = int16Array3[0]+" mA";
    // data => console.log(data)
    })
    .catch(error => console.error(error));
};
