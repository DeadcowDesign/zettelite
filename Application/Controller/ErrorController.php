<?php

namespace Application\Controller;

/**
 * Application\Controller\ErrorController
 * 
 * This is a controller designed specifically for dealing with errors. By default
 * Lunar uses this as the controller for missing controllers or methods,
 * outputting the 404 template as defined in notFoundAction (this is where your)
 * 404 should go).
 * 
 * If you remove this file or controller or method, Lunar will simply return
 * a 404 header instead.
 */
class ErrorController extends Controller {

    function notFoundAction() {
        \http_response_code(404);
        print_r("<h1>That's a 404</h1>");
    }
}