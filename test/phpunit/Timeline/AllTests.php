<?php

class Sdx_AllTests
{
  protected static function _suite($filepath)
  {
    $target_dir = dirname($filepath);
    
    //testの検索
    $suite = new PHPUnit_Framework_TestSuite($target_dir);
    $tests = explode(PHP_EOL, trim(shell_exec(sprintf('find %s -type f -name "*Test.php"', $target_dir))));
    sort($tests);
    foreach($tests as $test)
    {
        if(preg_match('@timeline/test/phpunit/(Timeline/.*Test)\.php$@', $test, $matches))
        {
          $class = str_replace('/', '_', $matches[1]);
          $suite->addTestSuite($class);
        }
    }

    return $suite;
  }

  public static function suite()
  {
    return self::_suite(__FILE__);
  }
}