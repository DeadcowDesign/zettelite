<?php

namespace Application\Cards;

class Cabinets
{
    protected $Cabinet;
    protected $Database;
    protected $DBH;

    public function __construct() {
        $this->Database = new \Application\Database\Items();
        $this->Database->connect();
    }

    public function createCabinet($data) {

        if (!isset($data['title'])) return false;

        return $this->Database->createItem($data);

    }

    public function readCabinet($id = null) {
        
        $columns = ['id', 'title'];
        $clauses = ['type' => 'cabinet'];

        if ($id) {
            $clauses['id'] = $id;
        }

        $cabinets = $this->Database->readItem($columns, $clauses);

        foreach($cabinets as &$cabinet) {
            $clause = ['cabinet' => $cabinet['id']];
            $cabinet['drawers'] = $this->readDrawer($clause);
        }

        return $cabinets;
    }

    public function readDrawer($data) {
        
        $columns = ['id', 'title'];
        $clauses = ['type' => 'drawer'];

        if (array_key_exists('id', $data)) {
            $clauses['id'] = $data['id'];
        }

        if (array_key_exists('cabinet', $data)) {
            $clauses['parent'] = $data['cabinet'];
        }

        $drawers = $this->Database->readItem($columns, $clauses);

        foreach($drawers as &$drawer) {

            $drawer['cards'] = $this->readCards($drawer['id']);
        }

        return $drawers;
    }

    public function readCards($parent) {

        $columns = ['id', 'title', 'parent'];
        $clause = ['parent' => $parent, 'type' => 'card'];
        $cards = $this->Database->readItem($columns, $clause);

        foreach($cards as &$card) {
            $card['children'] = $this->readCards($card['id']);
        }

        return $cards;
    }

    public function updateCabinet($data) {

        if (!array_key_exists('title', $data) || !array_key_exists('id', $data)) return false;
        
        return $this->Database->updateItem($data);
    }

    public function deleteCabinet($data) {
        if (!isset($data['id'])) return false;

        return $this->Database->deleteItem($data);
    }
    
}