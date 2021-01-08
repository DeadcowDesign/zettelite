<?php

namespace Core;

/**
 * Core\Controller
 * 
 * THIS IS A CORE LUNAR FILE ALTER AT OWN RISK!
 * 
 * This is the core Controller class. It simply serves as a boilerplate for the
 * application controller class. It includes an init function that is fired
 * on construct for any global code or configuration.
 * 
 * @author  James Filby <jim@deadcowdesign.co.uk>
 * @copyright 2016
 * @since 0.0.1
 */
class Controller
{
    protected $className = '';
    protected $methodName = '';

    public function __construct($class = '', $method = '')
    {
        $this->className = $class;
        $this->methodName = $method;

        $this->init();
    }

    protected function render() {
        readfile(BASE_PATH . '/' . APPLICATION_NAME . '/Templates/' . $this->className . '/' . $this->methodName . '.html');
    }
}
