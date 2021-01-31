<?php

namespace Application\Database;
    
class Database
{

    protected $DBH = null;
    protected $ErrorMessage = '';

    public function connect() {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";";
        $options = [
            \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
            \PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $this->DBH = new \PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (\PDOException $e) {
            throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
    }

    public function getError() {
        return $this->ErrorMessage;
    }
}