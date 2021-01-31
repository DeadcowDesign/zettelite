<?php

namespace Application\Cards;

class Cards 
{
    protected $Database;
    /**
     * Create a card - this expects a well-formed JSON string containing our
     * card data which should include its ID, content, and title, all in string
     * format.
     */
    public function __construct() {
        $this->Database = new \Application\Database\Items();
        $this->Database->connect();

    }

    /**
     * Save our card to the file system
     */
    public function createCard($card) {
        if (!\is_array($card)) return false;
        
        // Check the new card keys against a list of required keys
        $requiredKeys = ['title', 'content', 'parent'];
        $intersect = array_intersect($requiredKeys, array_keys($card));

        // If they don't intersect exactly return false because we're missing a key
        if (!(count($requiredKeys) === count($intersect))) {
            return false;
        }

        $card['type'] = 'card';
        
        return $this->Database->createItem($card);
    }

    /**
     * Save our card to the file system
     */
    public function updateCard($data) {
        if (!\is_array($data)) return false;
        $requiredKeys = ['title', 'content', 'id'];
        $intersect = array_intersect($requiredKeys, array_keys($data));

        // If they don't intersect exactly return false because we're missing a key
        if (!(count($requiredKeys) === count($intersect))) {
            return false;
        }

        return $this->Database->updateItem($data);
    }

    public function readCard($data) {
        
        if (!\is_array($data)) return false;

        if (!array_key_exists('id', $data)) return false;

        $columns = ['id', 'title', 'content'];

        return $this->Database->readItem($columns, $data);
    }

}