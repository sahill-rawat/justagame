import React, { useEffect, useState, useRef } from "react";
import kaboom from "kaboom";
import brownie from "./brownie.png";
import minerva1 from "./mini1.png";
import "./App.css";
import bgmusic from "./bgmusic.mp3";
import startbutton from "./start.png";
// import dead from "./dead.mp3";

function App() {
  const PLAYER_SPEED = 480;
  const [gameOver, setGameOver] = useState(false);
  const gameRef = useRef(null);

  useEffect(() => {

    const game = kaboom({ background: [252, 186, 3] });
    gameRef.current = game;
    game.loadSprite("minerva", minerva1);
    game.loadSprite("brownie", brownie);
    game.loadSprite("startButton", startbutton);
    game.loadSound("bgmusic", bgmusic);
    // game.loadSound("dead", dead);
    const music = game.play("bgmusic");


    game.scene("story", ()=> {
      
      game.add([
        game.text("Once upon a time in Kasol,\nMinverva got ambushed by some sneaky brownies.\nNow, it's up to us\nto save her\nfrom these little dessert delinquents!\n\nPress any button to start the game"),
        game.pos(game.width()/2, game.height()/2),
        // game.scale(1),
        game.anchor("center"),
      ]);

      const start = game.add([
        game.sprite("startButton"),
        game.scale(0.2),
        game.pos(game.width()-400, game.height()-200),
      ]);

      // start.onClick(()=> game.go("game"));

      game.onKeyPress("space", () => game.go("game"));
      game.onClick(() => game.go("game"));
    });

    game.scene("game", () => {
      
      const timer = game.add([
        game.text(0),
        game.pos(12, 32),
        game.fixed(),
        { time: 0 },
      ]);

      timer.onUpdate(() => {
        timer.time += game.dt();
        timer.text = timer.time.toFixed(2);
      });

      function grow(rate) {
        return {
          update() {
            const n = rate * game.dt();
            this.scale.x += n;
            this.scale.y += n;
          },
        };
      }

      const mini = game.add([
        game.sprite("minerva"),
        game.pos(game.width() / 2.5, game.height() / 1.5),
        game.area(),
        game.body(),
        game.scale(0.5),
        "player",
        {
          dir: game.LEFT,
          dead: false,
          speed: 240,
        },
      ]);

      mini.onCollide("enemy", (e) => {
        addExplode(game.center(), 12, 120, 30);
        // game.play(dead);
        game.destroy(e);
        game.shake(120);
        game.addKaboom(e.pos);
        game.wait(1, () => game.go("lose", "Dead"));
      });

      game.onKeyDown("left", () => {
        mini.move(-PLAYER_SPEED, 0);
        if (mini.pos.x < 0) {
          mini.pos.x = game.width();
        }
      });

      game.onKeyDown("right", () => {
        mini.move(PLAYER_SPEED, 0);
        if (mini.pos.x > game.width()) {
          mini.pos.x = 0;
        }
      });

      function addExplode(p, n, rad, size) {
        for (let i = 0; i < n; i++) {
          game.wait(game.rand(n * 0.1), () => {
            for (let i = 0; i < 2; i++) {
              game.add([
                game.pos(p.add(game.rand(game.vec2(-rad), game.vec2(rad)))),
                game.rect(4, 4),
                game.scale(1 * size, 1 * size),
                game.lifespan(0.1),
                grow(game.rand(48, 72) * size),
                game.anchor("center"),
              ]);
            }
          });
        }
      }

      function spawnBrownie() {
        const randomSpeed = game.rand(200, 400);

        const brownieObstacle = game.add([
          game.sprite("brownie"),
          game.area(),
          game.pos(game.rand(game.vec2(game.width(), 0))),
          game.scale(0.3),
          game.move(game.DOWN, randomSpeed),
          "trash",
          "enemy",
          { speed: randomSpeed },
          game.offscreen({ destroy: true }),
          // game.onDestroy(()=>setScore((score)=>score+1))
        ]);
      }

      const obstacleInterval = game.loop(1, () => {
        if (timer.time < 10) {
          spawnBrownie();
        } else {
          setGameOver(true);
          game.go("lose", "Bch gyi!");
        }
      });
    });

    game.scene("lose", (text) => {
      // const die = game.play(dead);
      game.add([
        game.sprite("minerva"),
        game.pos(game.width() / 2, game.height() / 2 - 108),
        game.scale(0.5),
        game.anchor("center"),
      ]);

      game.add([
        game.text(text),
        game.pos(game.width() / 2, game.height() / 3 + 108),
        game.scale(3),
        game.anchor("center"),
      ]);

      game.add([
        game.text("Press any button to restart."),
        game.pos(game.width() / 2, game.height() / 2.5 + 108),
        game.scale(1),
        game.anchor("center"),
      ]);

      game.onKeyPress("space", () => game.go("game"));
      game.onClick(() => game.go("game"));
    });

    game.onLoad(()=>game.go("story"));
  }, []);

  return (
    <div className="App">
      <h1>Bhaag Minerva Bhaag</h1>
      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <h2>Game Over!</h2>
          <button onClick={() => window.location.reload()}>Restart</button>
        </div>
      )}
    </div>
  );
}

export default App;
