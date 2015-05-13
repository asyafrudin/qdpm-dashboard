--Get percentage of work and time progress for open (ongoing) projects
select p.id, p.name, ifnull(ceiling(sum(t.progress) / count(t.id)), 0) as work_progress, 
	ifnull(ceiling((current_date - min(t.start_date)) / (max(t.due_date) - min(t.start_date)) * 100), 0) as time_progress 
from tasks t right join projects p on t.projects_id = p.id 
where p.projects_status_id = 1 
group by p.id

--Get project population: open, overdue, & not opened (on hold, closed, cancelled)
select 'all' as name, count(*) as total
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
having current_date > max(t.due_date)) p1