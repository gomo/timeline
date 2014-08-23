<?php
date_default_timezone_set('Asia/Tokyo');
chdir(dirname(__FILE__));
ini_set('include_path', get_include_path().PATH_SEPARATOR.dirname(__FILE__).'/../../php');
ini_set('include_path', get_include_path().PATH_SEPARATOR.dirname(__FILE__));

function ___timeline_autoloader($class) {
  $file = str_replace('_', '/', $class.'.php');
  var_dump($file);
  require_once $file;
}

spl_autoload_register('___timeline_autoloader');
