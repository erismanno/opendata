<?php
class DB {
	private $pdo;

	function __construct() {
		// put your credentials here or in secretCredentials.php to exclude it from versioning systems
		$host = '';
		$db   = '';
		$user = '';
		$pass = '';
		include('secretCredentials.php');
		$charset = 'utf8mb4';

		$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
		$opt = [
		    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
		    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
		    PDO::ATTR_EMULATE_PREPARES   => false,
		];
		$this->pdo = new PDO($dsn, $user, $pass, $opt);
	}
   
   
	function getPDO() {
		return $this->pdo;
	}
}

