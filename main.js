import {Bodies, Body, Engine, Runner, Events, Render, World} from 'matter-js';
import {FRUITS} from "./fruits.js";

const engine = Engine.create();
const render = Render.create({
    engine,
    element: document.body,
    options: {
        wireframes: false,
        background: '#F7F4C8',
        width: 620,
        height: 850,
    }
});
const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
    isStatic: true,
    render: {
        fillStyle: '#E6B143'
    }
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
    isStatic: true,
    render: {
        fillStyle: '#E6B143'
    }
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
    isStatic: true,
    render: {
        fillStyle: '#E6B143'
    }
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
    name: 'topLine',
    isStatic: true,
    isSensor: true,
    render: {
        fillStyle: '#E6B143'
    }
})

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;


function addFruit() {
    const index = Math.floor(Math.random() * 5);
    const fruit = FRUITS[index];

    const body = Bodies.circle(300, 50, fruit.radius, {
        index,
        isSleeping: true,
        render: {
            sprite: {
                texture: `${fruit.name}.png`,
            }
        },
        restitution: 0.3,
    });

    currentBody = body;
    currentFruit = fruit;

    World.add(world, body);
}


// 마우스 클릭 위치에 과일을 떨어뜨린다.
window.addEventListener('click', (event) => {
    if (disableAction) {
        return;
    }

    // 클릭한 위치를 가져옵니다.
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // 과일의 위치를 클릭한 위치로 설정합니다.
    if ((mouseX - currentFruit.radius > 30 && mouseX + currentFruit.radius < 590) && topLine.position.y > mouseY) {
        Body.setPosition(currentBody, {
            x: mouseX,
            y: mouseY,
        });

        currentBody.isSleeping = false;
        disableAction = true;

        setTimeout(() => {
            addFruit();
            disableAction = false;
        }, 1000);
    }
});


Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
        if (collision.bodyA.index === collision.bodyB.index) {
            const index = collision.bodyA.index;

            if (index === FRUITS.length - 1) {
                return;
            }
            World.remove(world, [collision.bodyA, collision.bodyB]);

            const newFruit = FRUITS[index + 1];

            const newBody = Bodies.circle(
                collision.collision.supports[0].x,
                collision.collision.supports[0].y,
                newFruit.radius,
                {
                    render: {
                        sprite: {texture: `${newFruit.name}.png`},
                    },
                    index: index + 1,
                }
            )

            World.add(world, newBody);
        }

        if (
            !disableAction &&
            (collision.bodyA.name === 'topLine' || collision.bodyB.name === 'topLine')) {
            alert('게임 오버');
        }
    });
});


addFruit();