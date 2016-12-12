const App = {
    init() {
        App.bindEvents()
        App.drawCircleGrid()
        const highscore = localStorage.getItem('highscore')
        if (highscore) $('#highscore').text(`Highscore: ${highscore}`)
    },

    state: {
        currentCircle: '',
        score: 0,
        gameover: false,
        missed: false
    },

    bindEvents() {
        const $startButton = $('#startButton')
        $startButton.on('click', () => {
            $startButton.addClass('clicked')
            setTimeout(() => {
                $startButton.removeClass('clicked')
                App.resetScore()
                App.startGame()
            }, 150)
        })
    },
    
    drawCircleGrid() {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                $('#canvas').drawEllipse({
                    layer: true,
                    name: `r${i}c${j}`,
                    fillStyle: '#ccc',
                    x: i * 64 + 45,
                    y: j * 64 + 47,
                    width: 50,
                    height: 50,
                    click: function(layer) {
                        // Check if the circle is currently lighted
                        const isLighted = layer.name === App.state.currentCircle
                        const isHerring = layer.name === App.state.currentHerring
                        if (isLighted) {
                            App.incrementScore()
                            App.state.missed = false
                        }
                        if (isHerring) App.state.gameover = true
                        
                        $(this).animateLayer(layer, {
                            fillStyle: isLighted ? 'lightgreen' : '#000',
                            scale: 1.0
                        }, 150)
                        setTimeout(() => {
                            $(this).animateLayer(layer, {
                                fillStyle: '#ccc',
                                scale: 1.0
                            }, 150)
                        }) 
                    }
                })
            }  
        }
    },

    incrementScore() {
        App.state.score = App.state.score + 1
        $('#score').text(App.state.score)
    },

    resetScore() {
        App.state.score = 0
        $('#score').text(App.state.score)
    },

    setHighscore(highscore) {
        //use localStorage to persist the highscore between plays
        const oldHighscore = localStorage.getItem('highscore')
        if (!oldHighscore || highscore > oldHighscore) {
            localStorage.setItem('highscore', highscore)
            $('#highscore').text(`Highscore: ${highscore}`)
        }
    },

    startGame() {
        App.state.gameover = false
        App.state.missed = false

        // Starts the game by triggering the circles to light up, 
        // at a slowly increasing rate.
        let interval = 1000
        const onLight = () => {
            if (!App.state.missed) {
                App.state.missed = true
                if (interval >= 400) interval *= 0.96
                if (interval >= 200) interval *= 0.99
                
                //pick a random circle
                let r = Math.floor((Math.random() * 5))
                let c = Math.floor((Math.random() * 5))
                
                //set the App state
                App.state.currentCircle = `r${r}c${c}`

                //light the circle up
                $('#canvas').animateLayer(`r${r}c${c}`, {
                    fillStyle: '#FFA500',
                    scale: 1.4
                }, 150)
                //off the lights before the next circle lights up
                setTimeout(() => {
                    $('#canvas').animateLayer(`r${r}c${c}`, {
                        fillStyle: '#ccc',
                        scale: 1.0
                    }, 150)
                }, interval)

                //if the game has not ended.. 
                //starts the timeout for lighting the next circle
                setTimeout(onLight, interval + 150)
            } else {
                App.state.gameover = true
                App.state.currentCircle = ''
                App.setHighscore(App.state.score)
                $('#startButton').text('Game Over')
                setTimeout(() => {
                    $('#startButton').text('Play Again')
                }, 1500)
            }
        }

        // Add some red herrings to make the game harder!
        // Clicking on the orange circles will end the game!
        let herringInterval = 3000
        const onHerrings = () => {
            if (!App.state.gameover) {

                if (herringInterval >= 500) herringInterval *= 0.95

                //pick a random circle that is not the currentCircle
                let r, c
                do {
                    r = Math.floor((Math.random() * 5))
                    c = Math.floor((Math.random() * 5))
                } while (App.state.currentCircle === `r${r}c${c}`)
                
                //set the App state
                App.state.currentHerring = `r${r}c${c}`
                //light the circle up
                $('#canvas').animateLayer(`r${r}c${c}`, {
                    fillStyle: '#c33',
                    scale: 1.4
                }, 150)
                //off the lights before the next circle lights up
                setTimeout(() => {
                    $('#canvas').animateLayer(`r${r}c${c}`, {
                        fillStyle: '#ccc',
                        scale: 1.0
                    }, 150)
                }, 1000)

                //starts the timeout for lighting the next herring
                setTimeout(onHerrings, herringInterval)
            }
        }
        onLight()

        //start showing red herrings after 10s
        setTimeout(() => {
            onHerrings()
        }, 10000)
    },

}

$(document).ready(() => {
    App.init()
})
