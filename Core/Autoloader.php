<?php

namespace Core;

/**
 * Core\Autoloader
 * 
 * THIS IS A CORE LUNAR FILE ALTER AT OWN RISK!
 * 
 * This is the core functionality for the autoloader. It uses basic 
 * SPL autoloading and is based on the directory structure matching the application
 * structure.
 * 
 * @author  James Filby <jim@deadcowdesign.co.uk>
 * @copyright 2016
 * @since 0.0.1
 */
class Autoloader
{

    public static function load($class = null)
    {

        $filename = BASE_PATH . '/' . str_replace('\\', '/', $class) . ".php";

        if (file_exists($filename)) {

            require_once($filename);

            if (class_exists($class)) {

                return true;
            }
        }

        return false;
    }
}

spl_autoload_register('core\autoloader::load');
