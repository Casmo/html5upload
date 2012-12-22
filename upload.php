<?php
/**
 * Handel the uploaded files
 */
// Point to a safe and secure path to upload the files
$secureDirectory = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'upload' . DIRECTORY_SEPARATOR;
// Point to a directory where the (temporary) resizes images will be saved. Change the url below if you change this
$cacheDirectory = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'cache' . DIRECTORY_SEPARATOR;

if(isset($_FILES['filename']['name']) && !empty($_FILES['filename']['name'])) {
	if($_FILES['filename']['error'] === 0 && $_FILES['filename']['type'] == 'image/jpeg') {
		$filename = uniqid() .'.jpg';
		$filepath = $secureDirectory . $filename;
		if(move_uploaded_file($_FILES['filename']['tmp_name'], $filepath)) {
			// Fix your own resize to create a nice thumb
			list($orgWidth, $orgHeight) = getimagesize($filepath);
			$thumb = imagecreatetruecolor(100, 100);
			$source = imagecreatefromjpeg($filepath);
			imagecopyresized($thumb, $source, 0, 0, 0, 0, 100, 100, $orgWidth, $orgHeight);
			if(imagejpeg($thumb, $cacheDirectory . $filename, 70)) {
				echo '<img src="cache/'. $filename .'" width="100" height="100" alt="" />';
				exit;
			}
			else {
				echo '1';
				exit;
			}
		}
	}
}
echo '0';
exit;