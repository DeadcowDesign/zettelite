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

    public function getAllDrawers() {
        $cardList = [];
        $dirListing = \scandir(CARD_FOLDER);

        foreach($dirListing as $drawer) {
            if (\is_dir(CARD_FOLDER . DIRECTORY_SEPARATOR . $drawer)) {

                if (\file_exists(CARD_FOLDER . DIRECTORY_SEPARATOR . $drawer . DIRECTORY_SEPARATOR . 'index.csv')) {
                    $handle = \fopen(CARD_FOLDER . DIRECTORY_SEPARATOR . $drawer . DIRECTORY_SEPARATOR . 'index.csv', 'r');

                    while (($data = \fgetcsv($handle)) !== FALSE) {
                        $card = new \stdClass();
                        $card->id = $data[0];
                        $card->title = $data[1];
                        $card->drawer = $drawer;
                        array_push($cardList, $card);
                    }
                }
            }
        }

        return $cardList;
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

        if (\file_exists($targetDrawer)) {
            return false;
        }
        
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

        $targetDrawer = CARD_FOLDER . DIRECTORY_SEPARATOR . $card->drawer;

        if (!\is_dir($targetDrawer)) {
            $this->makeDrawer($card->drawer);
        }

        // If our file exists it should alredy be in the directory so we can skip
        if (!\file_exists(CARD_FOLDER . DIRECTORY_SEPARATOR . $card->drawer . DIRECTORY_SEPARATOR . $card->id . '.json')) {
            $listing = \fopen($targetDrawer . DIRECTORY_SEPARATOR . "index.csv", "a");
            \fputcsv($listing, [$card->id, $card->title]);
            \fclose($listing);
        } else {
            $tmpFile = \fopen($targetDrawer . DIRECTORY_SEPARATOR . "tmp.csv", "w");
            $listing = \fopen($targetDrawer . DIRECTORY_SEPARATOR . "index.csv", "r");

            while ( ($data = \fgetcsv($listing, 1000, ",")) !== FALSE) {
                if(\is_array($data)) {
                    if ($data[0] !== $card->id) {
                        \fputcsv($tmpFile, $data);
                    } else {
                        \fputcsv($tmpFile, [$card->id, $card->title]);
                    }
                }
            };
            \fclose($tmpFile);
            \fclose($listing);
            unlink($targetDrawer . DIRECTORY_SEPARATOR . "index.csv");
            rename($targetDrawer . DIRECTORY_SEPARATOR . "tmp.csv", $targetDrawer . DIRECTORY_SEPARATOR . "index.csv");
        }
        
        $cardFileHandle = fopen(CARD_FOLDER . DIRECTORY_SEPARATOR . $card->drawer . DIRECTORY_SEPARATOR . $card->id . '.json', 'w');

        fwrite($cardFileHandle, json_encode($card));
        fclose($cardFileHandle);

        if ($card->parent) {
            echo($card->parent);
            $parentFilename = CARD_FOLDER . DIRECTORY_SEPARATOR . $card->drawer . DIRECTORY_SEPARATOR . $card->parent . '.json';
            if (\file_exists($parentFilename)) {
                $parentCard = \file_get_contents($parentFilename);
                $parentCardData = \json_decode($parentCard);

                if (!\property_exists($parentCardData, 'children')) {
                    $parentCardData->children = [];
                }

                if (!\in_array($parentCardData->children, $card->id)) {
                    array_push($parentCardData->children, $card->id);
                    $parentCardHandle = fopen($parentFilename, 'w');
                    fwrite($parentCardHandle, json_encode($parentCardData));
                    fclose($parentCardHandle);
            
                }
            }
        }

        return true;
    }

    /**
     * VERY RAW file uploader.
     * 
     * TODO - make this suck less before prod.
     */
    public function saveImage() {

        if (empty($_FILES)) {
            echo("No file received");
            \http_response_code(400);
            exit;
        }

        $fileExtension = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);

        if ($_FILES["image"]["size"] > (2*MB)) {
            echo("Image files must be smaller than 2MB");
            \http_response_code(413);
            exit;
        }

        switch ($fileExtension) {
            case 'jpg':
            case 'jpeg':
                if(!\imagecreatefromjpeg($_FILES["image"]["tmp_name"])) {
                    echo("This does not appear to be a valid jpg image");
                    \http_response_code(415);
                    exit;
                }
                break;
            case 'png':
                if(!\imagecreatefrompng($_FILES["image"]["tmp_name"])) {
                    echo("This does not appear to be a valid png image");
                    \http_response_code(415);
                    exit;
                }
                break;
            case 'gif':
                if(!\imagecreatefromgif($_FILES["image"]["tmp_name"])) {
                    echo("This does not appear to be a valid gif image");
                    \http_response_code(415);
                    exit;
                }
                break;
            default:
                echo("File upload only accepts gif jpeg or png files");
                \http_response_code(415);
                exit;
        }

        var_dump($_FILES);
        $target = CARD_FOLDER . DIRECTORY_SEPARATOR .  $_POST['drawer'] . DIRECTORY_SEPARATOR . $_FILES["image"]["name"];
        move_uploaded_file($_FILES["image"]["tmp_name"], $target);
        $outputURL = BASE_URL . 'cache/' . $_POST['drawer'] . '/' . $_FILES["image"]["name"];
        return $outputURL;
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