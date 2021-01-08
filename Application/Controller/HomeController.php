<?php

namespace Application\Controller;

/**
 * Application\Controller\HomeController
 * 
 * This is the default controller specified by basic Lunar configuration. This
 * and the indexAction function will determine what will be shown when the user 
 * visits your home page. See the documentation for more information on
 * the use of Controllers.
 *
 * @author  James Filby <jim@deadcowdesign.co.uk>
 * @copyright 2016
 * @since 0.0.1
 */
class HomeController extends Controller {

    /**
     * This is the page that is available at either /home/index, or the root
     * page of the website.
     */
    public function indexAction($data = null) {
        $this->render();    // Render will output an html file located at Templates/Home/index.html
    }

}