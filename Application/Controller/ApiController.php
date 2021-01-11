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
class ApiController extends Controller {

    /**
     * This is the page that is available at either /home/index, or the root
     * page of the website.
     */
    public function addNoteAction($note = '') {
        $noteData = new \stdClass();
        $noteData->title = $_POST['title'];
        $noteData->content = $_POST['content'];
        $noteData->drawer = $_POST['drawer'];
        $noteData->id = isset($_POST['id']) ? $_POST['id'] : '';
        $note = new \Application\Cards\Cards();
        $note->setCard(\json_encode($noteData));
        $id = $note->saveCard();


        \header('Content-Type: application/json');
        \header('Card-Id: ' . $id);
        echo $id;
        \http_response_code(200);
    }

    public function getDrawerAction($data) {
        if (!$data['drawer']) return false;

        $drawer = new \Application\Cards\Drawers();
        \header('Content-Type: application/json');
        echo \json_encode($drawer->getDrawer(urldecode($data['drawer'])));
        \http_response_code(200);    
    }

    public function getDrawersAction() {
        $drawers = new \Application\Cards\Drawers();
    
        \header('Content-Type: application/json');
        echo \json_encode($drawers->getDrawers());
        \http_response_code(200);
    }

    public function makeDrawerAction($data) {
        if (!$data['drawer']) return false;

        $drawer = new \Application\Cards\Drawers();
        $drawer->makeDrawer($data['drawer']);
    }

    public function backupAction($data) {

        $drawer = new \Application\Cards\Drawers();
        $drawer->createBackup();
    }
}