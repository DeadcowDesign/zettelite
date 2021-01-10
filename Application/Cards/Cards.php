<?php

namespace Application\Cards;

class Cards 
{
    protected $Card;
    protected $Drawers;

    /**
     * Create a card - this expects a well-formed JSON string containing our
     * card data which should include its ID, content, and title, all in string
     * format.
     */
    public function __construct() {
        $this->Card = null;
        $this->Drawers = new \Application\Cards\Drawers();
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

        if (empty($this->Card->id)) {
            $this->Card->id = date("YmdHis");
        }

        if (
            empty($this->Card->content) ||
            empty($this->Card->title) ||
            empty($this->Card->drawer) ||
            empty($this->Card->id)
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

        if ($this->verifyCard() === true) {
    
            $this->Drawers->addToDrawer($this->Card);
        }

        return $this->Card->id;
    }
}