SELECT nextval(pg_get_serial_sequence('users', 'id')) AS new_id,
       nextval('table_name_code_seq')                AS new_code;
