/**
 * Function to handle files.
 * @param domElement
 * @constructor
 */
var FileUploader = function ( domElement ) {

    /**
     * The unique ID of the queue element.
     * @type {string}
     */
    this.elQueue = 'queue';

    /**
     *
     * @type Array with allowed file types. Leave empty to allow everything. Remember to
     * always check files server-side as well!
     */
    this.allowedMimeTypes = new Array('image/jpeg', 'image/png', 'image/gif');

    /**
     * Current class
     * @type {FileUploader}
     */
    var scope = this;

    /**
     * @type {number} Number total files to be uploaded. Will be increased after selecting
     * more files.
     */
    this._numberOfImages = 0;

    /**
     * @type {number} The current number (index) of the uploaded file.
     */
    this._currentImageNumber = 1;

    /**
     * List of files that are currently in the queue.
     * @type {Array}
     * @private
     */
    this._queue = new Array();

    /**
     * Current uploaded status.
     * @type {boolean}
     * @private
     */
    this._isUploading = false;

    this.domElement = domElement;

    this.init = function() {
        currentForm = scope.domElement.form;
        if (currentForm.id == null || currentForm.id == '') {
            uniqid =  Math.floor(Math.random()* 1000000);
            domElement.form.setAttribute('id', 'FormFileupload' + uniqid);
        }
        if (scope.allowedMimeTypes != null && scope.allowedMimeTypes != '') {
            allowedMimeTypes = '';
            for (i = 0; i < scope.allowedMimeTypes.length; i++) {
                if (i > 0) {
                    allowedMimeTypes += ',';
                }
                allowedMimeTypes += scope.allowedMimeTypes[i];
            }
            scope.domElement.setAttribute('accept', allowedMimeTypes);
        }
    }

    /**
     * After selecting files from the file input we add those files to the queue and empty
     * it's value after.
     */
    scope.domElement.addEventListener('change', function(e) {
        if (scope.domElement.files != null) {
            scope.queueFiles(scope.domElement.files);
        }
    });

    this.queueFiles = function(files) {
        domQueue = document.getElementById(scope.elQueue);
        for (i = 0; i < files.length; i++) {
            scope._queue.push(files[i]);
            if (domQueue != null) {
                fileHtml = '<div id="FileUpload'+ scope._queue.length +'">';
                fileHtml += files[i].name;
                fileHtml += '<span class="pull-right" id="FileUploadCompletionText'+ scope._queue.length +'">0%</span>'
                fileHtml += '<div class="progress" id="FileUploadProgress'+ scope._queue.length +'">';
                fileHtml += '<div id="FileUploadCompletionBar'+ scope._queue.length +'" class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">';
                fileHtml += '</div>';
                fileHtml += '</div>';
                domQueue.innerHTML += fileHtml;
            }
        }
        scope.domElement.value = '';
        scope.upload(scope);
    }

    /**
     * Uploads the next file in the queue if there is any left to upload.
     */
    this.upload = function(scope) {
        if (scope._isUploading == true) {
            return;
        }

        domCurrentUploadedItem = document.getElementById('FileUpload' + scope._currentImageNumber);
        if (domCurrentUploadedItem == null) {
            return;
        }
        scope._isUploading = true;

        xhr = new XMLHttpRequest();

        /**
         * Progress callback of a currently uploaded item.
         */
        xhr.upload.addEventListener("progress", function (evt) {
            if(evt.lengthComputable){
                percentCompleted = Math.round(100 / evt.total * evt.loaded);
                document.getElementById('FileUploadCompletionText' + scope._currentImageNumber).innerHTML = percentCompleted + '%';
                document.getElementById('FileUploadCompletionBar' + scope._currentImageNumber).setAttribute('aria-valuenow', percentCompleted);
                document.getElementById('FileUploadCompletionBar' + scope._currentImageNumber).style.width = percentCompleted + '%';
            }
        }, false);

        /**
         * Handling function when loading is complete
         */
        xhr.addEventListener("load", function (evt) {
            document.getElementById('FileUploadCompletionText' + scope._currentImageNumber).innerHTML = '100%';
            document.getElementById('FileUploadCompletionBar' + scope._currentImageNumber).setAttribute('aria-valuenow', 100);
            document.getElementById('FileUploadCompletionBar' + scope._currentImageNumber).style.width = '100%';
            document.getElementById('FileUploadProgress' + scope._currentImageNumber).className = 'progress';
            if(this.responseText == '0') {
                document.getElementById('FileUploadCompletionBar' + scope._currentImageNumber).className = 'progress-bar progress-bar-danger';
            }
            else {
                document.getElementById('FileUploadCompletionBar' + scope._currentImageNumber).className = 'progress-bar progress-bar-success';
            }
            scope._isUploading = false;
            scope._currentImageNumber++;
            scope.upload(scope); // Continue to the next file
        }, false);

        /**
         * Post the current form info + the current file that has to be uploaded.
         */
        postUrl = scope.domElement.form.target;
        if (postUrl == null || postUrl == '') {
            postUrl = location.href;
        }
        currentFile = scope._queue[(scope._currentImageNumber-1)];

        /**
         * Check if filetype is allowed for uploading...
         */
        doUpload = false;
        if (scope.allowedMimeTypes == null || scope.allowedMimeTypes == '') {
            doUpload = true;
        }
        else {
            for (i = 0; i < scope.allowedMimeTypes.length; i++) {
                if (currentFile.type.match(scope.allowedMimeTypes[i])) {
                    doUpload = true;
                }
            }
        }
        if (doUpload == false) {
            scope._isUploading = false;
            document.getElementById('FileUploadCompletionText' + scope._currentImageNumber).innerHTML = '0%';
            document.getElementById('FileUploadCompletionBar' + scope._currentImageNumber).className = 'progress-bar progress-bar-danger';
            document.getElementById('FileUploadCompletionBar' + scope._currentImageNumber).setAttribute('aria-valuenow', 0);
            document.getElementById('FileUploadCompletionBar' + scope._currentImageNumber).style.width = '100%';
            return;
        }
        document.getElementById('FileUploadProgress' + scope._currentImageNumber).className = 'progress progress-striped active';

        xhr.open("post", postUrl, true);
        form = scope.domElement.form;
        formData = new FormData();
        for (i = 0; i < form.elements.length; i ++) {
            if (form.elements[i].id != scope.domElement.id) {
                formData.append(form.elements[i].name, form.elements[i].value);
            }
        }
        formData.append(scope.domElement.name, currentFile);
        xhr.send(formData);
    }
}
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