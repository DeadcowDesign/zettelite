<?php

namespace Core;

/**
 * Core\Router
 * 
 * THIS IS A CORE LUNAR FILE ALTER AT OWN RISK!
 * 
 * The router represents the main core of Lunar's functionality. This takes the
 * page URL and breaks it into tokens that Lunar can understand. These are then
 * processed and concatenated into strings which equate into classes and methods
 * which are then processed by the autoloader.
 * 
 * @author  James Filby <jim@deadcowdesign.co.uk>
 * @copyright 2016
 * @since 0.0.1
 */
class Router
{

    protected $route_data = null;
    protected $className  = null;
    protected $methodName = null;
    protected $methodData = null;

    public function __construct() {

        $this->route_data = new \stdClass();
        $this->route_data->controller = null;
        $this->route_data->action     = null;
        $this->route_data->data       = null;

    }

    public function executeRoute()
    {

        $route_data = $this->parseURI();
        $class      = $this->createClassName($route_data->controller);
        $method     = $this->createMethodName($route_data->action);
        $data       = $this->createMethodData($route_data->data);

        if (!class_exists($class)) {
            $this->doError('notFound');

        } else {

            $page = new $class($this->className, $this->methodName);

            if (!method_exists($page, $method)) {
                $this->doError('notFound');

            } else {

                $page->$method($data);
            }
        }

        return true;
    }

    public function doError($errorType) {
        $errorController = "\\" . APPLICATION_NAME . '\Controller\ErrorController';
        $errorType = $errorType . "Action";

        if (!class_exists($errorController)) {
            header("HTTP/1.0 404 Not Found");
            die();
        }

        $page = new $errorController();

        if (!method_exists($page, $errorType)) {
            header("HTTP/1.0 404 Not Found");
            die();
        }

        $page->$errorType();
    }
    /**
     * parseURI takes a uri, checks against the routes table for any route overrides
     * breaks the uri up into segments and processes those segments, before finally 
     * loading a class and method based on the uri parts.
     *
     * @return [type] [description]
     */
    protected function parseURI()
    {

        if (!$_SERVER['REQUEST_URI']) {

            throw new Exception("Could not resolve route");
        }
        
        $path = $_SERVER['REQUEST_URI'];

        if (BASE_URL !== '') {
            $path = str_replace(BASE_URL, '', $path);
        } else {

        }

        $path = self::checkRoutesTable($path);
        $path = ltrim($path, '/');
        $path_parts = explode('/', $path);

        $route_data = new \stdClass();

        $route_data->controller = $this->dehyphenate(array_shift($path_parts));
        $route_data->action     = $this->dehyphenate(array_shift($path_parts));
        $route_data->data       = $path_parts;
        return $route_data;
    }

    /**
     * dehyphenate - remove hyphens from a string and camel case.
     *
     * @param  [type] $string [description]
     * @return [type]         [description]
     */
    protected function dehyphenate($strIn)
    {

        $strOut = '';

        $strParts = explode('-', $strIn);

        while ($strParts) {

            $strOut .= ucfirst(array_shift($strParts));
        }

        return $strOut;
    }

    /**
     * Create a class name from a given controller name.
     * @return [type] [description]
     */
    protected function createClassName($strIn = null)
    {

        $strOut = "";

        if (!$strIn) {

            if (defined("DEFAULT_CONTROLLER"))  {
                $this->className = DEFAULT_CONTROLLER;
                $strOut = APPLICATION_NAME . "\Controller\\" . DEFAULT_CONTROLLER . "Controller";
            }

        } else {
            $this->className = ucfirst($strIn);
            $strOut = APPLICATION_NAME . "\Controller\\" . ucfirst($strIn) . "Controller";
        }

        return $strOut;
    }

    /**
     * create a method name from the given action name.
     * @return [type] [description]
     */
    protected function createMethodName($strIn = null)
    {

        $strOut = "";

        if (!$strIn) {

            if (defined("DEFAULT_ACTION")) {
                $this->methodName = DEFAULT_ACTION;
                $strOut = DEFAULT_ACTION . "Action";
            }

        } else {
            $this->methodName = lcfirst($strIn);
            $strOut = lcfirst($strIn) . "Action";
        }

        return $strOut;
    }

    protected function createMethodData($arrIn = null)
    {

        $arrOut = array();

        while ($arrIn) {

            $key = array_shift($arrIn);
            $value = array_shift($arrIn);

            $arrOut[$key] = $value;
        }

        return $arrOut;
    }

    /**
     * checkRoutesTable - checks the routes table for an equivalent route, and if one
     * is found, returns that route. Note that currently this is a 1:1 check - data in
     * the route is not preseved and routes with data attached to them are not matched.
     * @param  string $path [description]
     * @return [type]       [description]
     */
    protected function checkRoutesTable($path = '')
    {

        $routes = array();

        include(BASE_PATH . "/routes.php");

        if (array_key_exists($path, $routes)) {

            return $routes[$path];
        }

        return $path;
    }
}