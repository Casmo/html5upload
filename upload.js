// unique id of the added file
var totalImageI = 0;
// current uploading status
var uploading = false;
// The current index of the uploaded file
var currentImageI = 0;
// The file queue
var queue = new Array;

function init() {
	var isMobile=navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);
	if(isMobile) {
		document.getElementById('inputFilename').removeAttribute('multiple');
	}
	document.getElementById('inputFilename').onchange = function(event) {
		addFilesToQueue();
	};
}

/**
  * Add files to the current upload queue and
  * create an html element for this file
  * @param object list of files
  */
function addFilesToQueue() {
	files = document.getElementById('inputFilename').files;
	if(files.length > 0) {
		for (var i = 0; i < files.length; i++) {
			queue[totalImageI] = files[i];
			addHtml = '<div id="image_'+ totalImageI +'" class="box">';
			addHtml += '<span class="status" id="status_'+ totalImageI +'"></span>';
			addHtml += '<span class="info" id="info'+ totalImageI +'">'+ files[i].name +'</span>';
			addHtml += '</div>';
			document.getElementById('queue').innerHTML += addHtml;
			totalImageI++;
		}
		document.getElementById('inputFilename').value = '';
		// Trigger the upload handler
	}
	upload();
}

/**
  * Upload the next file in the queue
  * @return void
  */
function upload() {
	if(uploading == true) {
		return;
	}
	
	if(queue[currentImageI] != undefined) {
		uploading = true;
		
		xhr = new XMLHttpRequest();
		
		// Update progess during upload
		xhr.upload.addEventListener("progress", function (evt) {
			progressHandling(evt, currentImageI);
		}, false);
		
		xhr.addEventListener("load", function (evt) {
	        document.getElementById('status_' + currentImageI).style.width = '100%';
	        if(this.responseText == '0') {
	        	document.getElementById('status_' + currentImageI).className += ' error';
	        }
	        else if(this.responseText == '1') {
	        	document.getElementById('status_' + currentImageI).className += ' complete';
	        }
	        else {
	        	document.getElementById('status_' + currentImageI).className += ' complete';
		        document.getElementById('image_' + currentImageI).innerHTML += this.responseText;
	        }
			uploading = false;
			currentImageI++;
			upload(); // Continue to the next file
		}, false);
		
		// Post the file to the server
		xhr.open("post", 'upload.php', true);
		var form = new FormData(document.getElementById('formUploader'));
		form.append("filename", queue[currentImageI]);
		xhr.send(form);
	}
	return;
}

/**
  * Status handeling for uploading a file
  * @param event current event of the upload
  * @param int the unique index of the html elements
  * @return void
  */
function progressHandling(evt, elementIndex) {
    if(evt.lengthComputable){
    	completion = Math.round(100 / evt.total * evt.loaded); //  + ' / ' + e.total;
        document.getElementById('status_' + elementIndex).style.width = completion + '%';
    }
}