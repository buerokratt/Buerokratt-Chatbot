-- liquibase formatted sql
-- changeset Artsiom Beida:20250424191943 ignore:true
CREATE OR REPLACE FUNCTION copy_row_with_modifications(
    table_name_to_copy_from VARCHAR,
    id_column_name VARCHAR,
    id_column_conversion_expression VARCHAR,
    id_to_copy VARCHAR,
    modifications VARCHAR[]
) RETURNS VARCHAR LANGUAGE plpgsql AS '
DECLARE
    columns VARCHAR [];
    to_select VARCHAR [] := (ARRAY [])::VARCHAR[];
    sql_query VARCHAR;
    inserted_id VARCHAR;
    modification_columns VARCHAR[] := (ARRAY [])::VARCHAR[];
    schema_name VARCHAR;
    table_name_only VARCHAR;
BEGIN
    IF position(''.'' in table_name_to_copy_from) > 0 THEN
        schema_name := split_part(table_name_to_copy_from, ''.'', 1);
        table_name_only := split_part(table_name_to_copy_from, ''.'', 2);
    ELSE
        schema_name := ''public'';
        table_name_only := table_name_to_copy_from;
    END IF;

    SELECT ARRAY_AGG(column_name)
    INTO columns
    FROM information_schema.columns
    WHERE table_schema = schema_name 
      AND table_name = table_name_only 
      AND column_name <> id_column_name;

    FOR i IN 1..array_length(modifications, 1) BY 3
    LOOP
        modification_columns := array_append(modification_columns, modifications[i]);
    END LOOP;

    FOR i IN 1..array_length(columns, 1)
    LOOP

        IF columns[i] = ANY(modification_columns)
        THEN

            FOR j IN 1..array_length(modifications, 1) BY 3
            LOOP

                IF modifications[j] = columns[i]
                THEN
                    to_select := array_append(
                        to_select,
                        format(
                            ''%L%s'',
                            modifications[j + 2],
                            modifications[j + 1]
                        )
                    );
                    EXIT;
                END IF;

            END LOOP;

        ELSE
            to_select := array_append(to_select, columns[i]);
        END IF;

    END LOOP;

    sql_query := format(
        ''INSERT INTO %I.%I(%s) SELECT %s FROM %I.%I WHERE %s = %L%s RETURNING %s::VARCHAR'',
        schema_name, table_name_only, array_to_string(columns, '', ''),
        array_to_string(to_select, '', ''),
        schema_name, table_name_only,
        id_column_name, id_to_copy, id_column_conversion_expression,
        id_column_name
    );

    EXECUTE sql_query INTO inserted_id;

    RETURN inserted_id;
END;
';
