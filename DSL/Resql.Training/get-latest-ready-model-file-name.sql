SELECT file_name FROM llm_trainings WHERE trained_date = (SELECT max(trained_date) FROM llm_trainings WHERE state = 'READY') LIMIT 1;
