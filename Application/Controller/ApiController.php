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

    protected $Cabinets = null;
    protected $Drawers = null;
    protected $Cards = null;

    public function init() {
        $this->Cabinets = new \Application\Cards\Cabinets();
        $this->Drawers = new \Application\Cards\Drawers();
        $this->Cards = new \Application\Cards\Cards();
    }
    public function createCabinetAction() {

        $this->respondWithJSON(200, $this->Cabinets->createCabinet($_POST));
    }

    public function readCabinetAction() {
        
        $this->respondWithJSON(200, $this->Cabinets->readCabinet());

    }

    public function updateCabinetAction($data) {

        $this->respondWithJSON(200, $this->Cabinets->updateCabinet($data));
    }

    public function deleteCabinetAction() {
                
        $this->respondWithJSON(200, $this->Cabinets->deleteCabinet($_POST));
    }

    public function createDrawerAction() {

        $this->respondWithJSON(200, $this->Drawers->createDrawer($_POST));
    }

    public function readDrawerAction() {

        $this->respondWithJSON(200, $this->Drawers->readDrawer($_POST));
    }

    public function updateDrawerAction() {

        $this->respondWithJSON(200, $this->Drawers->updateDrawer($_POST));
    }

    public function deleteDrawer() {

        $this->respondWithJSON(200, $this->Drawers->deleteDrawer());
    }

    public function createCardAction() {

        $this->respondWithJSON(200, $this->Cards->createCard($_POST));
    }

    public function readCardsAction() {

        $this->respondWithJSON(200, $this->Cards->readCards($_POST));
    }

    public function readCardAction($data) {

        $this->respondWithJSON(200, $this->Cards->readCard($_POST));
    }

    public function updateCardAction() {

        $this->respondWithJSON(200, $this->Cards->updateCard($_POST));
    }

    public function deleteCardAction() {

        $this->respondWithJSON(200, $this->Cards->deleteCard($_POST));
    }

    protected function respondWithJSON(int $code = 200, $message = '') {
        \header('Content-Type: application/json');
        echo \json_encode($message);
        \http_response_code(200);
    }

    public function createImageAction($data) {
        $drawer = new \Application\Cards\Drawers();
        $result = $drawer->saveImage();
        \header('Content-Type: application/json');
        echo \json_encode($result);
        \http_response_code(200);
    }


}