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
			$preprocessed['name'][$i] = $value['name'];

			if ($value['time_progress'] > 0) // If at least one task is set with start and due date)
			{
				$numeric_status_adjustment = 0;

				if ($value['time_progress'] > 100)  // If current date is bigger than due date
				{
					$value['time_progress'] = 100;
					$numeric_status_adjustment += 1;
				}

				$preprocessed['numeric_status'][$i] = round(($value['work_progress'] / $value['time_progress']) - $numeric_status_adjustment, 2);
			}
			else
			{
				$preprocessed['numeric_status'][$i] = 0; // Set status to 0 if no task has been added
			}

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
			where p.projects_status_id = 1
			union
			select 'overdue' as name, count(*)
			from (select p.id
			from projects p inner join tasks t on p.id = t.projects_id
			where p.projects_status_id = 1
			group by p.id
			having current_date > max(t.due_date)) p1"
			);
		$result = $query->result_array();

		foreach ($result as $value)
		{
			$preprocessed[$value['name']] = $value['total'];
		}
		$preprocessed['closed'] = $preprocessed['all'] - $preprocessed['open'];
		$preprocessed['open'] -= $preprocessed['overdue'];

		return $preprocessed;
	}
}