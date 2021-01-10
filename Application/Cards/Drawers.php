<?php

namespace Application\Cards;

class Drawers
{
    protected $Drawer;

    /**
     * getDrawers - returns the list of Drawers from the card cache directory.
     * Drawers are simply directories, this function lists the dirs in the cache
     * folder, removes the top and parent listings, and outputs the result in an
     * array. Note that this function does not currently handle nested directories
     * 
     */
    public function getDrawers() {

        $dirListing = \scandir(CARD_FOLDER);
        $drawers = [];

        foreach($dirListing as $drawer) {

            if (\is_dir(CARD_FOLDER . DIRECTORY_SEPARATOR . $drawer)) {
                array_push($drawers, $drawer);
            }
        }

        $drawers = array_values(array_diff($drawers, array('..', '.')));

        return $drawers;
    }

    /**
     * getDrawer - given a drawer name, this retrieves the list of cards from the
     * drawers index file and returns the ids and titles as an array. We use a 
     * index to avoid having to open every card file to get the title and id from
     * each one whenever a drawer is accessed.
     */
    public function getDrawer($drawer = '') {

        $targetDrawer = CARD_FOLDER . DIRECTORY_SEPARATOR . $drawer . DIRECTORY_SEPARATOR;
        $cards = [];

        if (($handle = fopen($targetDrawer . "index.csv", "r")) !== FALSE) {

            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {

                if ($data[0]) {
                    array_push($cards, [$data[0], $data[1]]);
                }
            }
            fclose($handle);
        }

        return $cards;
    }

    /**
     * makeDrawer - creates a drawer directory in the Cards path and populates it
     * with an index.csv file which will hold a list of cards.
     */
    public function makeDrawer($drawer) {

        $targetDrawer = CARD_FOLDER . DIRECTORY_SEPARATOR . $drawer;

        if (!\mkdir($targetDrawer, 0755)) {

            return false;
        }

        $listing = fopen($targetDrawer . DIRECTORY_SEPARATOR . "index.csv", "w");
        fclose($listing);

        return true;
    }

    /**
     * addToDrawer - add a card to a drawer. This function adds the card details
     * to the drawer's index file. We do not need to check if this exists as this
     * is already created when we first save the card.
     */
    public function addToDrawer($card) {
        var_dump($card);

        if (!isset($card->id) || $card->id == '') {
            echo('No ID?');
            return false;
        }
        $targetDrawer = CARD_FOLDER . DIRECTORY_SEPARATOR . $card->drawer;

        if (!\is_dir($targetDrawer)) {
            $this->makeDrawer($card->drawer);
        }

        $cardFileHandle = fopen(CARD_FOLDER . DIRECTORY_SEPARATOR . $card->drawer . DIRECTORY_SEPARATOR . $card->id . '.json', 'w');
        fwrite($cardFileHandle, json_encode($card));
        fclose($cardFileHandle);

        $listing = \fopen($targetDrawer . DIRECTORY_SEPARATOR . "index.csv", "a");
        \fputcsv($listing, [$card->id, $card->title]);
        \fclose($listing);

        return true;
    }
}