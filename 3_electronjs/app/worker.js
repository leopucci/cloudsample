const { isMainThread, parentPort } = require('worker_threads');

if (!isMainThread) {
	parentPort.on('message', (data) => {
    	// 'data' contains the payload sent by main thread
        //const parsedJSON = JSON.parse(data);
        
        // Send data back to main thread
        parentPort.postMessage(data);
    }
}