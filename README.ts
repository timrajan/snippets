  function* indexCounter(start: number = 0): Generator<number> {
                    let count = start;
                        while (true) {
                            yield count++;
                        }
                    }

                    let checkboxIndex = indexCounter(0);
