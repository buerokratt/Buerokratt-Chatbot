SELECT file_name FROM llm_trainings WHERE state = 'READY' AND version_number = :versionNumber LIMIT 1;
