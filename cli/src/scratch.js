import blessed from 'blessed'

const screen = blessed.screen({
	smartCSR: true,
	title: 'Optic'
});

const box = blessed.box({
	top: 'top',
	left: 'center',
	width: '100%',
	height: 3,
	content: 'Hello {bold}Optic{/bold}!',
	tags: true,
	border: {
		type: 'line'
	},
	style: {
		fg: 'default',
		border: {
			fg: '#0ff004'
		},
		hover: {
			bg: 'green'
		}
	}
});

const input = blessed.textarea({
	label: ' My Input ',
	content: '',
	border: 'line',
	style: {
		fg: 'blue',
		bg: 'default',
		bar: {
			bg: 'default',
			fg: 'blue'
		},
		border: {
			fg: 'default',
			bg: 'default'
		}
	},
	width: '100%',
	height: 5,

	left: 0,
	top: '200',
	keys: true,
	vi: true,
	//inputOnFocus: true
});


const bottomInputLeft = blessed.textbox({
	value: '>: ',
	style: {
		fg: 'black',
		bg: '#e2e2e2',
		bar: {
			bg: 'default',
			fg: 'blue'
		}
	},
	width: 20,
	height: 1,
	left: 0,
	bottom: 0,
	// vi: true,
	keys: true,
	inputOnFocus: true
});

const bottomInput = blessed.textbox({
	style: {
		fg: 'blue',
		bg: '#e2e2e2',
		bar: {
			bg: 'default',
			fg: 'blue'
		}
	},
	width: '100%-3',
	height: 1,
	left: 3,
	bottom: 0,
	// vi: true,
	keys: true,
	inputOnFocus: true
});


screen.append(box)
screen.append(input)
screen.append(bottomInputLeft)
screen.append(bottomInput)

bottomInput.on('keypress', (ch, key) => {
	if (key.name === 'enter') {
		bottomInput.focus()
	}
	box.setContent(key.name)
	screen.render()
})

screen.key(['escape', 'q', 'C-c'], function(ch, key) {

	return process.exit(0);
});

screen.render();

bottomInput.focus()

// setInterval(() => {
// 	box.content = new Date().getTime().toString()
// 	screen.render()
// }, 1000)
