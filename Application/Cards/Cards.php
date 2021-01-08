<?php

namespace Application\Cards;

class Cards 
{
    protected $Card;

    /**
     * Create a card - this expects a well-formed JSON string containing our
     * card data which should include its ID, content, and title, all in string
     * format.
     */
    public function __construct() {
        $this->Card = null;
    }

    public function setCard($cardJSON = '') {
        $this->Card = \json_decode($cardJSON);
    }
    /**
     * Ensure that our card has all the bits and bobs it needs
     */
    public function verifyCard() {

        if (!$this->Card) { return false; }
        if (!is_object($this->Card)) { return false; }

        if (!isset($this->Card->id)) {
            $this->Card->id = date("YmdHis");
        }

        if (
            !isset($this->Card->content) ||
            !isset($this->Card->title) ||
            !isset($this->Card->drawer)
            ) {
                return false;
        } 

        if (
            !is_string($this->Card->id) ||
            !is_string($this->Card->content) ||
            !is_string($this->Card->title) ||
            !is_string($this->Card->drawer)
            ) {
                return false;
        } 

        return true;
    }

    /**
     * Save our card to the file system
     */
    public function saveCard() {
        $isNewcard = true;

        if ($this->verifyCard() === true) {
            if (\file_exists(CARD_FOLDER . DIRECTORY_SEPARATOR . $this->Card->id . '.json')) {
                $isNewcard = false;
            }

            $cardFileHandle = fopen(CARD_FOLDER . DIRECTORY_SEPARATOR . $this->Card->id . '.json', 'w');
            fwrite($cardFileHandle, json_encode($this->Card));
            fclose($cardFileHandle);

            if ($isNewcard) {
                $drawer = new \Application\Cards\Drawers();
                $drawer->addToDrawer($this->Card);
            }
        }

        return $this->Card->id;
    }
}