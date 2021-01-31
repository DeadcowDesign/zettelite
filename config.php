<?php

/**
 * Inital constant configuration
 */

/**
 * Path definition.
 */
define("BASE_PATH", dirname(__FILE__));               // The physical path to the application on the server
define("BASE_URL", '');                         // The application root URL not including the server

/**
 * Application defaults
 */
define("APPLICATION_NAME", 'Application');
define("DEFAULT_CONTROLLER", "Home");
define("DEFAULT_ACTION", "index");
define("ERROR_CONTROLLER", "Error");

/**
 * User defined configs
 */
define("CARD_FOLDER", BASE_PATH . DIRECTORY_SEPARATOR . 'cache');

define("DB_HOST", "127.0.0.1");
define("DB_USER", "root");
define("DB_PASS", "root");
define("DB_NAME", "zettelite");

define('KB', 1024);
define('MB', 1048576);
define('GB', 1073741824);
define('TB', 1099511627776);