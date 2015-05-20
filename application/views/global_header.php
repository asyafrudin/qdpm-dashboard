<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content="qdpm visual dashboard">
    <meta name="author" content="Amir Syafrudin">
    <link rel="icon" href="<?php echo base_url('favicon.ico') ?>">

    <title><?php echo $page_title; ?></title>

    <!-- Bootstrap core CSS -->
    <?php echo link_tag('css/bootstrap.min.css') ?>

    <!-- Global styles -->
    <?php echo link_tag('css/main.css') ?>

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
        <script src="<?php echo base_url('js/html5shiv.min.js') ?>"></script>
        <script src="<?php echo base_url('js/respond.min.js') ?>"></script>
    <![endif]-->
    <script src="<?php echo base_url('js/jquery.min.js') ?>"></script>
    <script src="<?php echo base_url('js/bootstrap.min.js') ?>"></script>
    <script src="<?php echo base_url('js/highcharts.js') ?>"></script>
    <script src="<?php echo base_url('js/'.$page_script) ?>"></script>
</head>
<body>
    <nav class="navbar navbar-fixed-top">
        <div class="container">
            <div class="navbar-header">
                <a class="navbar-brand" href="#">qdPM Visual Dashboard</a>
            </div>
        </div>
    </nav>
