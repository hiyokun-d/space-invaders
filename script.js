const canvas = document.getElementById('canvas');
const score = document.getElementById('score');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const player = new Player();

const invaderProjectiles = []
const projectiles = []
const GRID = []
const particles = []

const keys = {
  d: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
}; 

let frame = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)

let game = {
    over: false,
    activate: true,
}
    for (let i = 0; i < 105; i++) {
      particles.push(
        new particle({
          position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
          },

          velocity: {
            x: 0,
            y: 0.3,
          },
          radius: Math.random() * 3,
            color: "WHITE",
          fades: false
        })
      );
    }

let scoreText = 0

function createParticle({object, color, fades = false}) {
    for (let i = 0; i < 15; i++) {
      particles.push(
        new particle({
          position: {
            x: object.position.x + object.width / 2,
            y: object.position.y + object.height / 2,
          },

          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
          },
          radius: Math.random() * 3,
            color: `${color}` || "WHITE",
          fades: fades
        })
      );
    }
}

function animate() {
    if (!game.activate) return;
    requestAnimationFrame(animate);
    ctx.fillStyle = "BLACK";
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    player.update()
    particles.forEach((particle, index) => {

        if (particle.position.y -particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width
            particle.position.y = -particle.radius
        }
        
        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(index, 1)
            }, 0)
        } else particle.update()
    })

    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (invaderProjectile.position.y + invaderProjectile.height > canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
            }, 0)
        } else {
            invaderProjectile.update()
        }

        if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
            invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width) {
                        setTimeout(() => {
                            invaderProjectiles.splice(index, 1);
                            player.opacity = 0
                            game.over = true;
                        }, 0);
            
                        setTimeout(() => {
                            game.activate = false;
                        }, 2000);
            createParticle({
                object: player,
                color: "lightGray",
                fades: true
            })
        }
    })

    if (keys.a.pressed && player.position.x >= 0) {
        player.velocity.x = -5
        player.rotation = -0.25
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 5
        player.rotation = 0.25
    } else {
        player.velocity.x = 0
        player.rotation = 0
    }

    projectiles.forEach((projectile, index) => {
        if (projectile.position.x + projectile.radius < 0) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }

        projectile.update()
    })

    GRID.forEach(grid => {
      grid.update();
      
      //spawnProjectiles
        if (frame % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }
          
        grid.invaders.forEach((invader, index) => {
          invader.update({ velocity: grid.velocity });

          projectiles.forEach((projectile, indexProjectile) => {
            if (
              projectile.position.y - projectile.radius <=
                invader.position.y + invader.height &&
              projectile.position.x + projectile.radius >= invader.position.x &&
              projectile.position.x - projectile.radius <=
                invader.position.x + invader.width &&
              projectile.position.y + projectile.radius >= invader.position.y
            ) {
              setTimeout(() => {
                const invaderFound = grid.invaders.find(
                  (invader2) => invader2 === invader
                );
                const projectileFound = projectiles.find(
                  (projectile2) => projectile2 === projectile
                );

                //remove invader and projectile from screen
                  if (invaderFound && projectileFound) {
                      scoreText += 100
                      score.innerText = scoreText

                      createParticle({
                          object: invader,
                          color: "white",
                          fades: true
                      })
                  projectiles.splice(indexProjectile, 1);
                  grid.invaders.splice(index, 1);

                  if (grid.invaders.length > 0) {
                    const firstInvader = grid.invaders[0];
                    const lastInvader = grid.invaders[grid.invaders.length - 1];

                    grid.width =
                      lastInvader.position.x -
                      firstInvader.position.x +
                      lastInvader.width;
                    grid.position.x = firstInvader.position.x;
                  }
                }
              }, 0);
            }
          });
        });
    })

    if (frame % randomInterval === 0) {
        GRID.push(new grid())
        randomInterval = Math.floor(Math.random() * 500 + 500);
        frame = 0
    }
    
    frame++
}

animate()


addEventListener("keydown", ({ keyCode }) => {
    if(game.over) return
    switch (keyCode) {
        case 65:
            keys.a.pressed = true
            break;
        case 68:
            keys.d.pressed = true;
            break;
        case 32:
            projectiles.push(new projectile({
              position: { x: player.position.x + player.width / 2, y: player.position.y },
              velocity: { x: 0, y: -10 },
            }));
            break;
    }
})

addEventListener("keyup", ({ keyCode }) => {
        switch (keyCode) {
        case 65:
            keys.a.pressed = false
            break;
        case 68:
            keys.d.pressed = false;
            break;
    }
})

addEventListener("resize", e => {
    canvas.width = innerWidth
    canvas.height = innerHeight
    location.reload()
})