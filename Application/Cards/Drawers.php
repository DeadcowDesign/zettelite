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

        $targetDrawer = CARD_FOLDER . DIRECTORY_SEPARATOR . $card->drawer;

        if (!\is_dir($targetDrawer)) {
            $this->makeDrawer($card->drawer);
        }

        // If our file exists it should alredy be in the directory so we can skip
        if (!\file_exists(CARD_FOLDER . DIRECTORY_SEPARATOR . $card->drawer . DIRECTORY_SEPARATOR . $card->id . '.json')) {
            $listing = \fopen($targetDrawer . DIRECTORY_SEPARATOR . "index.csv", "a");
            \fputcsv($listing, [$card->id, $card->title]);
            \fclose($listing);
        }
        $cardFileHandle = fopen(CARD_FOLDER . DIRECTORY_SEPARATOR . $card->drawer . DIRECTORY_SEPARATOR . $card->id . '.json', 'w');
        fwrite($cardFileHandle, json_encode($card));
        fclose($cardFileHandle);

        return true;
    }

    /**
     * Create a .zip archive of all the notes in our cache folder and spit it out
     */
    public function createBackup() {
        // Get real path for our folder
        $rootPath = \realpath(CARD_FOLDER);
        $zipPath = 'backup.zip';
        // Initialize archive object
        $zip = new \ZipArchive();
        $zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);

        // Create recursive directory iterator
        /** @var SplFileInfo[] $files */
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($rootPath),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $name => $file)
        {
            // Skip directories (they would be added automatically)
            if (!$file->isDir())
            {
                // Get real and relative path for current file
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($rootPath) + 1);

                // Add current file to archive
                if (\preg_match('/(\.csv|\.json)/', $filePath)) {
                    $zip->addFile($filePath, $relativePath);
                }
            }
        }

        // Zip archive will be created only after closing object
        $zip->close();

        header('Content-Type: application/zip');
        header("Content-Disposition: attachment; filename='". $zipPath . "'");
        header('Content-Length: ' . filesize($zipPath));
        header("Location: /zettelite/backup.zip");
    }
}