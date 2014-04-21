<?php
/**
 * Handel the uploaded files
 */
// Point to a safe and secure path to upload the files
$secureDirectory = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'upload' . DIRECTORY_SEPARATOR;
// Point to a directory where the (temporary) resizes images will be saved. Change the url below if you change this
$cacheDirectory = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'cache' . DIRECTORY_SEPARATOR;
$output = '0';
if (isset($_FILES['filename']) && !empty($_FILES['filename']) && isset($_FILES['filename']['name'][0])) {
    foreach ($_FILES['filename']['name'] as $index => $name) {
        $file = array();
        $file['name'] = $_FILES['filename']['name'][$index];
        $file['type'] = $_FILES['filename']['type'][$index];
        $file['tmp_name'] = $_FILES['filename']['tmp_name'][$index];
        $file['error'] = $_FILES['filename']['error'][$index];
        $file['size'] = $_FILES['filename']['size'][$index];
        if(isset($file['name']) && !empty($file['name'])) {
            if($file['error'] === 0 && $file['type'] == 'image/jpeg') {
                $filename = uniqid() .'.jpg';
                $filepath = $secureDirectory . $filename;
                if(move_uploaded_file($file['tmp_name'], $filepath)) {
                    $output = '1';
                }
            }
        }
    }
}
echo $output;
exit;