<?php

/**
 * Inital constant configuration
 */

/**
 * Path definition.
 */
define("BASE_PATH", dirname(__FILE__));               // The physical path to the application on the server
define("BASE_URL", '/zettelite/');                         // The application root URL not including the server

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