<?php

class bootstrap {

    /**
     * startApplication - get the configuration, do the PHP ini stuff and load the autoloader, then
     * run the autoloader.
     * 
     * @return [bool] [true]
     */
    public static function startApplication() {


        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        require_once(dirname(__FILE__) . '/config.php');
        require_once(dirname(__FILE__) . '/Core/Autoloader.php');

        $router = new Core\Router();

        $router->executeRoute();

        return true;
    }
}