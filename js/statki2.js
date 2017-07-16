// document.addEventListener("DOMContentLoaded", function(event) {

// Zmienne globalne
	var welcomeSection = document.getElementById('welcome');
	var battleAreas = document.getElementById('gameplay');
	var playersArea = document.getElementById('playersArea');
	var computersArea = document.getElementById('computersArea'); 
	var buttonField = computersArea.querySelectorAll('button');

	var computer = {
		name: '',
		moves: 0,
		striked: 0
	};

	var startButton = document.getElementById('start');
	startButton.addEventListener('click', gettingStarted, false);

	// Funkcja 'wyłączająca' wiadomość powitalną
	function gettingStarted() {
		view.showName();
		welcomeSection.className = 'hideSection';
		battleAreas.classList.remove('hideSection');
	}

	var view = {
		showName: function() {
			var computersName = document.getElementById('computersName');
			var computersMessage = 'Nazwa przeciwnika: ';

			computer.name = prompt('Podaj imię dla komputera: ');

			while (!computer.name) {
				computer.name = prompt('Podaj imię dla komputera: ');
			}

			computersName.textContent = computersMessage + computer.name;
		},

		displayMessage: function(msg) {
			var result = document.getElementById('result');
			result.innerHTML = msg;
		},

		displayStrike: function(location) {
			var cell = document.getElementById(location);
			cell.setAttribute('class', 'strike');
		},

		displayMiss: function(location) {
			var cell = document.getElementById(location);
			cell.setAttribute('class', 'miss');
		}
	};

	var model = {
		boardSize: 10,
		numShips: 10,
		shipLength: [3, 2, 2, 1, 1, 1],
		fourMast: 1,
		threeMast: 2,
		twoMast: 3,
		oneMast: 4,
		shipsSunk: 0,
		ships: [
			{locations: [0, 0, 0, 0], hits: ['', '', '', '']},
			{locations: [0, 0, 0], hits: ['', '', '']},
			{locations: [0, 0, 0], hits: ['', '', '']},
			{locations: [0, 0], hits: ['', '']},
			{locations: [0, 0], hits: ['', '']},
			{locations: [0, 0], hits: ['', '']},
			{locations: [0], hits: ['']},
			{locations: [0], hits: ['']},
			{locations: [0], hits: ['']},
			{locations: [0], hits: ['']}
		], 

		fire: function(fieldsId) {
			for (var i = 0; i < this.numShips; i++) {
				var ship = this.ships[i];
				locations = ship.locations;

				for (var j = 0; j < locations.length; j++) {

					if (locations[j] == fieldsId) {
						ship.hits[j] = 'hit';
						view.displayStrike(fieldsId);
						view.displayMessage('Trafiony!');
						document.getElementById(fieldsId).style.pointerEvents = 'none';

						if (this.isSunk(ship)) {
							view.displayMessage('Zatopiłeś okręt!');
							this.shipsSunk++;
						}

						return true;
					} 
				}
			}

			view.displayMiss(fieldsId);
			view.displayMessage('Spudłowałeś.');
			document.getElementById(fieldsId).style.pointerEvents = 'none';

			return false;
		},

		isSunk: function(ship) {
			for (var i = 0; i < ship.hits.length; i++) {

				if (ship.hits[i] !== 'hit') {
					return false;
				}
			}

			return true;
		
		},

		shipsEstablishedLocations: function() {

			this.generateRestMast();

			// for (var i = 0; i < 7; i++) {
			// 	var lokacja = this.ships[i].locations;
			// 	console.log("Lokacja: " + lokacja);
			// }
			
			this.generateOneMast();
		},

		// Generowanie losowego położenia statków jednomasztowych
		generateOneMast: function() {
			var oneMastLocations = [];
			var fieldsAroundShip = [];
			
			for (var i = 0; i < this.oneMast; i++) {
				do {
					do {
						var number = Math.floor((Math.random() * 100) + 100);
						var field = document.getElementById(number);
						var fieldParent = field.parentNode;
						var fieldPrevious = field.parentNode.previousElementSibling;
						var fieldPreviousChild = field.parentNode.previousElementSibling.firstChild.firstChild;
						var fieldNext = field.parentNode.nextElementSibling;
					} while (field.className !== 'empty'); 

					oneMastLocations.push(number);
				} while (this.collision(oneMastLocations));

				this.ships[i + 6].locations = oneMastLocations;
				this.surroundingFields(oneMastLocations);
				oneMastLocations = [];
			}
		},

		// Generowanie lokalizacji cztero, trzy i dwumasztowców
		generateRestMast: function() {
			var restMastLocations = [];
			var nextNeighbourFields = [];
			var counter = 0;

			for (var i = 0; i < this.shipLength.length; i++) {
				// console.log("Pętla while, gdzie losujemy pierwsze pole z klasą empty");
				// Losujemy liczbę z zakresu 100 - 199 tak długo, aż ten numer zwróci nam pole o klasie 'empty'
				do {
					var number = Math.floor((Math.random() * 100) + 100);
					var field = document.getElementById(number);
					var fieldParent = field.parentNode;
					var fieldPrevious = field.parentNode.previousElementSibling;
					var fieldPreviousChild = field.parentNode.previousElementSibling.firstChild.firstChild;
					var fieldNext = field.parentNode.nextElementSibling;

				} while (field.className !== 'empty'); 

				// Nadajemy klasę temporary, ponieważ to pole nie zostało jeszcze porównane z pozostałymi w celu wykrycia kolizji
				field.className = 'temporary';
				restMastLocations.push(number);
				// console.log("Wylosowaliśmy pierwsze puste pole i dodajemy je do tablicy");

				do {
					for (var j = this.shipLength[i]; j > 0; j--) {

						// Jeżeli istnieje wolne pole powyżej pierwszej lokalizacji
						if (document.getElementById(restMastLocations[counter] - 10) && document.getElementById(restMastLocations[counter] - 10).className === 'empty') {
							nextNeighbourFields.push(restMastLocations[counter] - 10);
						}

						// Jeżeli istnieje wolne pole z lewej strony pierwszej lokalizacji
						if ((!fieldPreviousChild) && document.getElementById(restMastLocations[counter] - 1) && document.getElementById(restMastLocations[counter] - 1).className === 'empty') {
							nextNeighbourFields.push(restMastLocations[counter] - 1);
						}

						// Jeżeli istnieje wolne pole z prawej strony pierwszej lokalizacji
						if (fieldNext && document.getElementById(restMastLocations[counter] + 1) && document.getElementById(restMastLocations[counter] + 1).className === 'empty') {
							nextNeighbourFields.push(restMastLocations[counter] + 1);
						}

						// Jeżeli istnieje wolne pole poniżej pierwszej lokalizacji
						if (document.getElementById(restMastLocations[counter] + 10) && document.getElementById(restMastLocations[counter] + 10).className === 'empty') {
							nextNeighbourFields.push(restMastLocations[counter] + 10);
						}

						do {
							// Generujemy losową liczbę z zakresu od zera do wartości, która jest długością tablicy zawierającej pola, w które można wstawić kolejną część statku 
							var randomNumber = Math.floor(Math.random() * nextNeighbourFields.length);

						} while (restMastLocations.indexOf(nextNeighbourFields[randomNumber]) >= 0);
							
						var nextField = document.getElementById(nextNeighbourFields[randomNumber]);
						nextField.className = 'temporary';

						// Dodajemy do tablicy, zawierającej lokalizację pierwszej części statku, jego kolejną część z tablicy nextNeighbourFields[], 
						// na podstawie wygenerowanej liczby randomNumber
						restMastLocations.push(nextNeighbourFields[randomNumber]);
						counter++;

					}
					// console.log("Losujemy kolejne pole, dopóki występuje kolizja");
				} while (this.collision(restMastLocations));

				this.ships[i].locations = restMastLocations;

				// console.log("Nie było kolizji, więc przechodzimy do oznaczenia pól naokoło");
				this.surroundingFields(restMastLocations);
				nextNeighbourFields = [];
				restMastLocations = [];
				counter = 0;
				// console.log("Zerujemy tablice, liczniki i zaczynamy od nowa pętlę");
			}
		},

		// Robimy pola surrounding dla lokalizacji statków, które oddzielają statki między sobą
		surroundingFields: function(locationArray) {
			for (var i = 0; i < locationArray.length; i++) {

				// Pobieramy kolejno element tablicy z zaakceptowanymi lokalizacjami statku
				var field = document.getElementById(locationArray[i]);
				var fieldsParentPrevious = field.parentNode.previousElementSibling;
				var fieldsParentNext = field.parentNode.nextElementSibling;
				var fieldsId = locationArray[i];

				// Pole powyżej lokalizacji
				var aboveField = document.getElementById(fieldsId - 10);

				// Pole poniżej lokalizacji
				var followingField = document.getElementById(fieldsId + 10);

				// Pole po lewej
				var fieldPrevious = document.getElementById(fieldsId - 1);

				// Pole po prawej
				var fieldNext = document.getElementById(fieldsId + 1);

				// Sprawdzamy pola powyżej naszej lokalizacji
				if (aboveField && locationArray.indexOf(fieldsId - 10) < 0) {
					aboveField.className = 'surrounding';
					var aboveParent = aboveField.parentNode;
					var aboveParentPrevious = aboveParent.previousElementSibling;
					var aboveParentNext = aboveParent.nextElementSibling;

					// Jeżeli pole po lewej stronie powyższego pola nie jest oznaczeniem wiersza planszy
					if (!aboveParentPrevious.innerText) {
						aboveParentPrevious.firstChild.className = 'surrounding';
					}

					// Jeżeli istnieje jeszcze pole po prawej stronie ponwyższego pola
					if (aboveParentNext) {
						aboveParentNext.firstChild.className = 'surrounding';
					}
					// console.log("Pole powyżej");
				}
				// console.log("Brak pola powyżej");

				// Sprawdzamy pola poniżej naszej lokalizacji
				if (followingField && locationArray.indexOf(fieldsId + 10) < 0) {
					followingField.className = 'surrounding';
					var followingParent = followingField.parentNode;
					var followingParentPrevious = followingParent.previousElementSibling;
					var followingParentNext = followingParent.nextElementSibling;

					// Jeżeli pole po lewej stronie poniższego pola nie jest oznaczeniem wiersza planszy
					if (!followingParentPrevious.innerText) {
						followingParentPrevious.firstChild.className = 'surrounding';
					}

					// Jeżeli istnieje jeszcze pole po prawej stronie poniższego pola
					if (followingParentNext) {
						followingParentNext.firstChild.className = 'surrounding';
					}
					// console.log("Pole poniżej");
				}

				// Sprawdzamy pola po bokach naszej lokalizacji
				// Sprawdzamy pole po lewej, czy nie jest oznaczeniem wiersza i czy nie jest to pole już zajęte
				if (!fieldsParentPrevious.innerText && locationArray.indexOf(fieldsId - 1) < 0) {
					fieldPrevious.className = 'surrounding';
					// console.log("Pole po lewej");
				}

				// Sprawdzamy pole po prawej, czy nie jest to pole już zajęte
				if (fieldsParentNext && locationArray.indexOf(fieldsId + 1) < 0) {
					fieldNext.className = 'surrounding';
					// console.log("Pole po prawej");
				}
				// console.log("Brak pola poniżej");
			}	
		},

		collision: function(locations) {
			for (var i = 0; i < this.numShips; i++) {
				var shipsLocation = this.ships[i].locations;

				for (var j = 0; j < locations.length; j++) {
					for (var k = 0; k < shipsLocation.length; k++) {
						if (locations[j] == shipsLocation[k]) {
							locations.pop();
							return true;
						} 
					}
				}
			}
			return false;
		}
	};

	var controller = {
		guesses: 0,

		processGuess: function(fieldsId) {
			this.guesses++;
			var hit = model.fire(fieldsId);

			// Jeżeli liczba trafionych i zatopionych statków jest równa ogólnej liczbie statków, wtedy kończymy grę
			if (hit && model.shipsSunk == model.numShips) {
				view.displayMessage('Zatopiłeś wszystkie okręty w ' + this.guesses + ' próbach.');
				document.getElementById("computersArea").style.pointerEvents = 'none';
				var nextGame = document.getElementById("nextGame");
				nextGame.innerHTML = '<button type="button" class="next-game" onclick="location.reload()">Jeszcze raz?';
				

			}
		}
	};

	function init() {
		var computersArea = document.getElementById('computersArea'); 
		var buttonField = computersArea.querySelectorAll('button');

		view.displayMessage("Rezultat Twoich prób...");
		model.shipsEstablishedLocations();

		for (var i = 0; i < buttonField.length; i++) {
			buttonField[i].addEventListener('click', playerChoice, false);
		}
	}

	function playerChoice(e) {
		var fieldsId = e.target.id;
		controller.processGuess(fieldsId);
	}

	window.onload = init;
