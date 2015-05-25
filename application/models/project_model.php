<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Project_model extends CI_Model
{
	function __construct()
	{
		parent::__construct();
	}

	function get_ongoing_status()
	{
		$this->load->database();

		$query = $this->db->query(
			'select p.id, p.name, ifnull(ceiling(sum(t.progress) / count(t.id)), 0) as work_progress, 
				ifnull(ceiling((current_date - min(t.start_date)) / (max(t.due_date) - min(t.start_date)) * 100), 0) as time_progress 
			from tasks t right join projects p on t.projects_id = p.id 
			where p.projects_status_id = 1 
			group by p.id
			order by p.name'
			);
		$result = $query->result_array();

		$i = 0;
		foreach ($result as $value)
		{
			$preprocessed[$i][0] = $value['name']; // Project name

			// Project status
			if ($value['time_progress'] > 0) // Calculate only if there are progress in time
			{
				$numeric_status_adjustment = 0;

				if ($value['time_progress'] > 100)  // If current date is bigger than due date
				{
					// Penalty!
					$numeric_status_adjustment = 1;
				}

				$preprocessed[$i][1] = round(($value['work_progress'] / $value['time_progress']) - $numeric_status_adjustment, 2);
			}
			else
			{
				$preprocessed[$i][1] = 0; // No progress reported
			}

			$preprocessed[$i][2] = $value['id']; // Project ID

			$i++;
		}

		return $preprocessed;
	}

	function get_population()
	{
		$this->load->database();

		$query = $this->db->query(
			"select 'all' as name, count(*) as total
			from projects p
			union
			select 'open' as name, count(*) as total
			from projects p
			where p.projects_status_id = 1"
			);
		$result = $query->result_array();

		foreach ($result as $value)
		{
			$preprocessed[$value['name']] = $value['total'];
		}
		$preprocessed['closed'] = $preprocessed['all'] - $preprocessed['open'];

		return $preprocessed;
	}
}