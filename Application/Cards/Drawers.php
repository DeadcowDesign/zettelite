<?php

namespace Application\Cards;

class Drawers
{
    protected $Drawer;
    protected $Database;

    public function __construct() {
        $this->Database = new \Application\Database\Items();
        $this->Database->connect();
    }

    /**
     * makeDrawer - creates a drawer directory in the Cards path and populates it
     * with an index.csv file which will hold a list of cards.
     * 
     * @return {int} The last insert ID which should be the new drawer id
     */
    public function createDrawer($data) {
        if (!\is_array($data)) return false;
        
        if (!array_key_exists('title', $data) || 
            !array_key_exists('cabinet', $data) 
        ) {

            return false;
        }

        return $this->Database->createItem($data);
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
    
    /**
     * makeDrawer - creates a drawer directory in the Cards path and populates it
     * with an index.csv file which will hold a list of cards.
     * 
     * @return {int} The last insert ID which should be the new drawer id
     */
    public function updateDrawer($data) {

        if (!\is_array($data)) return false;

        if (!array_key_exists('title', $data) || 
            !array_key_exists('id', $data)
        ) {

            return false;
        }

        return $this->Database->updateItem($data);
    }

    /**
     * getDrawer - given a drawer name, this retrieves the list of cards from the
     * drawers index file and returns the ids and titles as an array. We use a 
     * index to avoid having to open every card file to get the title and id from
     * each one whenever a drawer is accessed.
     */
    public function deleteDrawer($data) {

        if (!\is_array($data)) return false;

        if (!array_key_exists('id', $data)) return false;

        return $this->Database->deleteItem($data['id']);
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
        header("Location: /backup.zip");
    }
}