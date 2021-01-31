<?php

namespace Application\Database;

class Items extends \Application\Database\Database {

    function createItem($data) {
        $query = "INSERT INTO `items` (title, content, parent, type) VALUES (:title, :content, :parent, :type)";
        
        $queryData = [
            ':title'    => $data['title'],
            ':content'  => $data['content'],
            ':type'     => $data['type'],
            ':parent'   => $data['parent']
        ];

        try {

            $this->DBH->prepare($query)->execute($queryData);

        } catch (PDOException $e) {

            $this->ErrorMessage = $e->getMessage();

            return false;
        }

        return $this->DBH->lastInsertId();
    }

    function readItem($columns, $clauses) {

        $columns = implode(', ', $columns);
        $clause = '';
        $queryData = [];

        foreach($clauses as $key => $value) {
            $clause .= " AND $key = :$key";
            $queryData[':' . $key] = $value;
        }

        $clause = preg_replace('/AND/', 'WHERE', $clause, 1);

        $query = "SELECT $columns FROM items $clause";

        try {

            $stmt = $this->DBH->prepare($query);
            $stmt->execute($queryData);

        } catch (PDOException $e) {

            $this->ErrorMessage = $e->getMessage();

            return false;
        }

        return $stmt->fetchAll();
    }

    function updateItem($data) {

        $query = "UPDATE items SET title = :title, content = :content WHERE id = :id";

        if (!array_key_exists('content', $data)) {
            $data['content'] = '';
        }

        $queryData = [
            ':title' => $data['title'],
            ':content' => $data['content'],
            ':id' => $data['id']
        ];

        try {

            $this->DBH->prepare($query)->execute($queryData);

        } catch (PDOException $e) {

            $this->ErrorMessage = $e->getMessage();

            return false;
        }

        return $data['id'];
    }
}