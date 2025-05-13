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
BEGIN
    SELECT ARRAY_AGG(column_name)
    INTO columns
    FROM information_schema.columns
    WHERE table_name = table_name_to_copy_from AND column_name <> id_column_name;

    FOR i IN 1..array_length(columns, 1)
    LOOP

        IF columns[i] = ANY(modifications)
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
        ''INSERT INTO %I(%s) ''
        ''SELECT %s ''
        ''FROM %I ''
        ''WHERE %s = %L%s ''
        ''RETURNING %s::VARCHAR'',
        table_name_to_copy_from, array_to_string(columns, '', ''),
        array_to_string(to_select, '', ''),
        table_name_to_copy_from,
        id_column_name, id_to_copy, id_column_conversion_expression,
        id_column_name
    );

    EXECUTE sql_query INTO inserted_id;

    RETURN inserted_id;
END;
';
