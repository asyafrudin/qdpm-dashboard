<!DOCTYPE html>
<html lang="en">
<style>
	<?php echo link_tag('css/main.css') ?>
</style>
<head>
	<title>Project Charts</title>
	<?php echo link_tag('css/main.css') ?>
	<script src="<?php echo base_url('js/jquery.min.js') ?>"></script>
	<script src="<?php echo base_url('js/highcharts.js') ?>"></script>
	<script src="<?php echo base_url('js/dashboard.project.js') ?>"></script>
</head>
<body>
	<div class="container" id="ongoingstatus"></div>
	<div class="container" id="population"></div>
</body>
</html>