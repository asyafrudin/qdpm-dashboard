<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Project extends CI_Controller
{
	public function index()
	{
		$this->load->view('project_view');
	}

	public function get_ongoing_status()
	{
		$this->load->model('project_model');
		$ongoing_status = $this->project_model->get_ongoing_status();

		echo json_encode($ongoing_status, JSON_NUMERIC_CHECK);
	}

	public function get_population()
	{
		$this->load->model('project_model');
		$population = $this->project_model->get_population();

		echo json_encode($population, JSON_NUMERIC_CHECK);
	}
}
