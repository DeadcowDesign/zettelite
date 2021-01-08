<?php

namespace Application\Controller;

/**
 * Application\Controller\Controller
 * 
 * This is the base controller class from which all other controllers inherit.
 * Use this as a jumping off point for any global functionality that may be
 * required across your pages (for instance, Twig initialization) by populating
 * any pre-flight code in the init function.
 *
 * @author  James Filby <jim@deadcowdesign.co.uk>
 * @copyright 2016
 * @since 0.0.1
 */
class Controller extends \Core\Controller {
	
    protected function init() {
		return true;
	}
}