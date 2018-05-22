<?php
#https://phpdelusions.net/pdo
include("db.php");
header("Access-Control-Allow-Origin: *");
header("Content-type: text/csv");
class GetData{
	private $db;
	private $pdo;
	function __construct() {
		$this->db = new DB();
		$this->pdo = $this->db->getPDO();
		$this->getYear($_GET['year']);	
	}

	function getYear($year){
		echo "id,konz,jahr,gruppe,parameter,messungen_nichtnull,messungen_null\n";
		$parameter = json_decode(file_get_contents('parameter.json'), true);
		$stmt = $this->pdo->prepare('SELECT 
		AVG(fracht_kg_d) as konz,
		Gruppe as gruppe,
		SUM(if(`fracht_kg_d`>0,1,0)) as messungen_nichtnull,
		SUM(if(`fracht_kg_d`=0,1,0)) as messungen_null,
		Param as parameter
		FROM `daten_OGD_2013_2017` WHERE Jahr = :year GROUP BY Param');
		$stmt->execute(['year' => $year.'']);
		$data = $stmt->fetchAll();
		$out = fopen('php://output', 'w');
		for($i = 0; $i < sizeof($data); $i++){
			unset($row);
			$row['id'] = $parameter[$data[$i]['parameter']];
			unset($parameter[$data[$i]['parameter']]);
			$row['konz'] = $data[$i]['konz'];
			$row['jahr'] = $year;
			$row['gruppe'] = $data[$i]['gruppe'];
			$row['parameter'] = $data[$i]['parameter'];
			$row['messungen_nichtnull'] = $data[$i]['messungen_nichtnull'];
			$row['messungen_null'] = $data[$i]['messungen_null'];
			fputcsv($out, $row);
		}
		foreach($parameter as $emptyParameter=>$emptyID){
			unset($row);
			$row['id'] = $emptyID;
			$row['konz'] = '0';
			$row['jahr'] = $year;
			$row['gruppe'] = 'NULL';
			$row['parameter'] = $emptyParameter;
			$row['messungen_nichtnull'] = 'NULL';
			$row['messungen_null'] = 'NULL';
			fputcsv($out, $row);
		}
		fclose($out);
	}
}
$run = new GetData();

