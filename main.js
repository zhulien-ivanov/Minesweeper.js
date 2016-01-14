(function () {
	var generatorButton = document.getElementById('generate-field-button'),
		integerRegexValidator = new RegExp('^[0-9]+$'),
		// If the handlers are attached to the container.
		field,
		fieldDiv,
		tableElement,
		minesArray,
		minesList,
		revealed;

	generatorButton.addEventListener('click', function (ev) {
		var rowsCountInput = document.getElementById('rows-count-input').value,
			columnsCountInput = document.getElementById('columns-count-input').value,
			minesCountInput = document.getElementById('mines-count-input').value,
			// field,
			// fieldDiv,
			// tableElement,
			tableRowElementScheme,
			tableColumnElementScheme,
			tableRowElement,
			tableColumnElement,
			minesCount,
			rowsCount,
			row,
			columnsCount,
			column,
			previousGameField,
			totalFreeCells,
			revealedCells = 0;

		revealed = [];
		minesArray = [];
		minesList = [];

		if (!integerRegexValidator.test(rowsCountInput)) {
			alert('The value for rows is not a valid number.');
		}
		else if (!integerRegexValidator.test(columnsCountInput)) {
			alert('The value for columns is not a valid number.');
		}
		else if (!integerRegexValidator.test(minesCountInput)) {
			alert('The input mines count value is not a valid number.');
		}
		else {
			// VALIDATION < 0 and NUMBER OF MINES < ROWS * COLUMNS
			
			rowsCount = Number(rowsCountInput);
			columnsCount = Number(columnsCountInput);
			minesCount = Number(minesCountInput);

			totalFreeCells = (rowsCount * columnsCount) - minesCount;

			field = generateField(rowsCount, columnsCount, minesCount);

			fieldDiv = document.getElementById('field-div');
						
			// Clear the previous game field if such exists.
			// fieldDiv.innerHTML = '';
			previousGameField = fieldDiv.childNodes[0];

			if (previousGameField) {
				fieldDiv.removeChild(previousGameField);
			}

			tableElement = document.createElement('table');

			tableRowElementScheme = document.createElement('tr');

			tableColumnElementScheme = document.createElement('td');
			tableColumnElementScheme.classList.add('hidden-cell');

			for (row = 0; row < rowsCount; row++) {
				revealed[row] = new Array(columnsCount);

				tableRowElement = tableRowElementScheme.cloneNode(true);

				// tableColumnElementScheme.setAttribute("data-row", row);

				for (column = 0; column < columnsCount; column++) {
					tableColumnElement = tableColumnElementScheme.cloneNode(true);
					tableColumnElement.setAttribute('id', row + '-' + column);
					// tableColumnElement.setAttribute("data-column", column);

					tableRowElement.appendChild(tableColumnElement);
				}

				tableElement.appendChild(tableRowElement);
			}

			tableElement.addEventListener('click', function (ev) {
				var idInfo,
					row,
					column,
					adjacentCells,
					index,
					len,
					cellInfo,
					uiCell,
					actualCell,
					arrayCopy,
					element = ev.target;

				if (element instanceof HTMLTableCellElement) {
					if (element.classList.contains('hidden-cell')) {
						// If the cell is not marked as a potential mine
						if (!element.classList.contains('marked-as-mine')) {
							// row = Number(element.getAttribute('data-row'));
							// column = Number(element.getAttribute('data-column'));

							idInfo = element.getAttribute('id').split('-');
							row = Number(idInfo[0]);
							column = Number(idInfo[1]);

							actualCell = field[row][column];

							if (actualCell === 'X') {
								revealMinesOnLoss();
							}
							else {
								if (actualCell === ' ') {
									arrayCopy = JSON.parse(JSON.stringify(field));

									adjacentCells = getAdjacentCells(row, column, field, arrayCopy, revealed, []);

									for (index = 0, len = adjacentCells.length; index < len; index++) {
										cellInfo = adjacentCells[index];

										// tableElement.querySelector('td[data-row="' + cell.row + '"][data-column="' + cell.column + '"]');			
										uiCell = document.getElementById(cellInfo.row + '-' + cellInfo.column);

										if (!uiCell.classList.contains('marked-as-mine')) {
											actualCell = field[cellInfo.row][cellInfo.column];
											revealed[cellInfo.row][cellInfo.column] = true;

											revealCell(uiCell, actualCell);
											revealedCells += 1;
										}
									}
								}
								else {
									revealed[row][column] = true;

									revealCell(element, actualCell);
									revealedCells += 1;
								}

								if (revealedCells === totalFreeCells) {
									revealMinesOnWin();
								}
							}
						}
					}
				}
			});

			tableElement.addEventListener('contextmenu', function (ev) {
				var element = ev.target;

				ev.preventDefault();

				if (element instanceof HTMLTableCellElement) {
					if (element.classList.contains('hidden-cell')) {
						element.classList.toggle('marked-as-mine');
					}
				}

				return false;

			}, false);

			fieldDiv.appendChild(tableElement);
		}
	});

	function revealMinesOnWin() {
		var row,
			column,
			element,
			index,
			len;

		for (index = 0, len = minesList.length; index < len; index++) {
			row = minesList[index].row;
			column = minesList[index].column;

			if (!revealed[row][column]) {
				// element = tableElement.querySelector('td[data-row="' + row + '"][data-column="' + column + '"]');
					
				element = document.getElementById(row + '-' + column);
				element.classList.remove('hidden-cell');
				element.classList.add('marked-as-mine', 'revealed-cell');
			}
		}

		tableElement.classList.add('on-win');
	}

	function revealMinesOnLoss() {
		var element,
			row,
			rows,
			column,
			columns;

		for (row = 0, rows = revealed.length; row < rows; row++) {
			for (column = 0, columns = revealed[0].length; column < columns; column++) {
				if (!revealed[row][column]) {
					// element = tableElement.querySelector('td[data-row="' + row + '"][data-column="' + column + '"]');
					
					element = document.getElementById(row + '-' + column);
					element.classList.remove('hidden-cell');

					if (element.classList.contains('marked-as-mine')) {
						if (!minesArray[row][column]) {
							// element.classList.remove('marked-as-mine');
							element.classList.add('wrong-mine-mark');
						}
					}
					else {
						if (minesArray[row][column]) {
							element.classList.add('marked-as-mine');
						}
					}

					// if (minesArray[row][column]) {
					// 	if (!element.classList.contains('marked-as-mine')) {
					// 		element.classList.add('marked-as-mine');
					// 	}
					// }
					// else {
					// 	if (element.classList.contains('marked-as-mine')) {
					// 		element.classList.add('wrong-mine-mark');
					// 	}
					// }
				}
			}
		}

		tableElement.classList.add('on-loss');
	}

	function revealCell(cell, value) {
		var colour;

		switch (value) {
			case 1:
				colour = 'one';
				break;
			case 2:
				colour = 'two';
				break;
			case 3:
				colour = 'three';
				break;
			case 4:
				colour = 'four';
				break;
			case 5:
				colour = 'five';
				break;
			case 6:
				colour = 'six';
				break;
			case 7:
				colour = 'seven';
				break;
			case 8:
				colour = 'eight';
				break;
		}

		if (colour) {
			colour += '-mines';

			cell.classList.add(colour);
		}

		cell.innerText = value;
		cell.classList.remove('hidden-cell');
		cell.classList.add('revealed-cell');
	}

	function getAdjacentCells(row, column, array, arrayCopy, revealed, adjacentCells) {
		if (!isInRange(row, column, array)) {
			return adjacentCells;
		}

		if (arrayCopy[row][column] === 'v') {
			return adjacentCells;
		}

		if (revealed[row][column]) {
			return adjacentCells;
		}

		adjacentCells.push({
			row: row,
			column: column
		});

		// If the cell is a number
		// if (!isNaN(array[row][column])) {
		if (integerRegexValidator.test(array[row][column])) {
			arrayCopy[row][column] = 'v';

			return adjacentCells;
		}

		arrayCopy[row][column] = 'v';

		getAdjacentCells(row, column - 1, array, arrayCopy, revealed, adjacentCells);
		getAdjacentCells(row - 1, column, array, arrayCopy, revealed, adjacentCells);
		getAdjacentCells(row, column + 1, array, arrayCopy, revealed, adjacentCells);
		getAdjacentCells(row + 1, column, array, arrayCopy, revealed, adjacentCells);

		getAdjacentCells(row - 1, column - 1, array, arrayCopy, revealed, adjacentCells);
		getAdjacentCells(row - 1, column + 1, array, arrayCopy, revealed, adjacentCells);
		getAdjacentCells(row + 1, column + 1, array, arrayCopy, revealed, adjacentCells);
		getAdjacentCells(row + 1, column - 1, array, arrayCopy, revealed, adjacentCells);

		return adjacentCells;
	}

	function generateField(rows, columns, minesCount) {
		var row,
			column,
			index,
			len,
			element,
			temp,
			random,
			currentRow,
			currentColumn,
			shuffled = [],
			final = [];

		for (row = 0; row < rows; row++) {
			for (column = 0; column < columns; column++) {
				shuffled.push({
					row: row,
					column: column
				});
			}
		}

		// Fill field with blank cells
		for (row = 0; row < rows; row++) {
			final[row] = [];
			minesArray[row] = [];

			for (column = 0; column < columns; column++) {
				final[row][column] = ' ';
			}
		}

		len = shuffled.length - 1;
		
		// Fill field with mines
		for (index = 0; index < minesCount; index++) {
			random = getRandomNumber(index, len);

			if (random !== index) {
				temp = shuffled[index];
				shuffled[index] = shuffled[random];
				shuffled[random] = temp;
			}

			element = shuffled[index];

			final[element.row][element.column] = 'X';
			minesArray[element.row][element.column] = true;
			minesList.push({
				row: element.row,
				column: element.column
			});
		}				
		
		// Fill field with numbers
		for (index = 0, len = minesList.length; index < len; index++) {
			element = minesList[index];

			row = element.row;
			column = element.column;

			for (var rowIndex = -1; rowIndex <= 1; rowIndex++) {
				for (var columnIndex = -1; columnIndex <= 1; columnIndex++) {
					if (rowIndex === 0 && columnIndex === 0) {
						continue;
					}

					currentRow = row + rowIndex;
					currentColumn = column + columnIndex;

					if (isInRange(currentRow, currentColumn, final)) {
						// If the cell is not a mine or a number.
						// isNaN(final[currentRow][currentColumn])
						if (final[currentRow][currentColumn] !== 'X' && !integerRegexValidator.test(final[currentRow][currentColumn])) {
							final[currentRow][currentColumn] = getMinesCount(currentRow, currentColumn, final);
						}
					}
				}
			}
		}

		return final;
	}

	function getMinesCount(row, column, array) {
		var minesCount = 0,
			currentRow,
			currentColumn;

		for (var rowIndex = -1; rowIndex <= 1; rowIndex++) {
			for (var columnIndex = -1; columnIndex <= 1; columnIndex++) {
				if (rowIndex === 0 && columnIndex === 0) {
					continue;
				}

				currentRow = row + rowIndex;
				currentColumn = column + columnIndex;

				if (isInRange(currentRow, currentColumn, array)) {
					if (array[currentRow][currentColumn] === 'X') {
						minesCount++;
					}
				}
			}
		}

		return minesCount;
	}

	function isInRange(row, column, array) {
		var maxRow = array.length,
			maxColumn = array[0].length;

		if (row < 0 || row >= maxRow || column < 0 || column >= maxColumn) {
			return false;
		}

		return true;
	}

	function getRandomNumber(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
})();