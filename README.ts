CREATE TABLE my_table (
    id SERIAL PRIMARY KEY,
    eight_digit_number INTEGER NOT NULL,
    CONSTRAINT check_eight_digits CHECK (eight_digit_number >= 10000000 AND eight_digit_number <= 99999999)
);
