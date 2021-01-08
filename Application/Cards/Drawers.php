<?php

namespace Application\Cards;

class Drawers
{
    protected $Drawer;

    public function getDrawers() {
        $dirListing = \scandir(CARD_FOLDER);
        $drawers = [];

        foreach($dirListing as $file) {
            if (\preg_match('/(\.csv)$/', $file)) {
                array_push($drawers, substr($file, 0, -4));
            }
        }

        return $drawers;
    }

    public function getDrawer($drawer) {
        $file = \file_get_contents(CARD_FOLDER . DIRECTORY_SEPARATOR . $drawer . '.csv');
        return array_map("str_getcsv", explode("\n", $file));
    }

    public function addToDrawer($card) {
        $drawerFileHandle = fopen(CARD_FOLDER . DIRECTORY_SEPARATOR . $card->drawer . '.csv', 'a');
        \fputcsv($drawerFileHandle, [$card->id, $card->title]);
        fclose($drawerFileHandle);
        return true;
    }

    public function createDrawer($drawer) {
        $drawerFileHandle = fopen(CARD_FOLDER . DIRECTORY_SEPARATOR . $drawer . '.csv', 'a');
        fclose($drawerFileHandle);
        return true;
    }
}