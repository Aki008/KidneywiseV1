import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, Pause } from 'lucide-react';

const BOARD_SIZE = 15;
const CELL_SIZE = 24;
const TICK_MS = 180;

type Point = { x: number; y: number };

type Direction = 'up' | 'down' | 'left' | 'right';

const palette = ['#F97316', '#FACC15', '#34D399', '#60A5FA', '#A78BFA'];

const buildInitialSnake = (): Point[] => [
  { x: 7, y: 7 },
  { x: 6, y: 7 },
  { x: 5, y: 7 },
];

const getRandomFood = (snake: Point[]): Point => {
  let food: Point;
  do {
    food = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));

  return food;
};

const getNextHead = (head: Point, direction: Direction): Point => {
  switch (direction) {
    case 'up':
      return { x: head.x, y: head.y - 1 };
    case 'down':
      return { x: head.x, y: head.y + 1 };
    case 'left':
      return { x: head.x - 1, y: head.y };
    default:
      return { x: head.x + 1, y: head.y };
  }
};

const isOpposite = (a: Direction, b: Direction) => {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  );
};

export default function SnakeGamePage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState<Point[]>(buildInitialSnake());
  const [food, setFood] = useState<Point>(() => getRandomFood(buildInitialSnake()));
  const [direction, setDirection] = useState<Direction>('right');
  const directionRef = useRef<Direction>('right');
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const boardPixelSize = useMemo(() => BOARD_SIZE * CELL_SIZE, []);

  const resetGame = useCallback(() => {
    const freshSnake = buildInitialSnake();
    setSnake(freshSnake);
    setFood(getRandomFood(freshSnake));
    setDirection('right');
    directionRef.current = 'right';
    setIsRunning(false);
    setIsGameOver(false);
    setScore(0);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const mapping: Record<string, Direction> = {
        arrowup: 'up',
        w: 'up',
        arrowdown: 'down',
        s: 'down',
        arrowleft: 'left',
        a: 'left',
        arrowright: 'right',
        d: 'right',
      };

      if (key === ' ') {
        setIsRunning((prev) => !prev);
        return;
      }

      const next = mapping[key];
      if (!next) return;
      if (isOpposite(directionRef.current, next)) return;

      directionRef.current = next;
      setDirection(next);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!isRunning || isGameOver) return;

    const interval = window.setInterval(() => {
      setSnake((current) => {
        const head = current[0];
        const nextHead = getNextHead(head, directionRef.current);

        if (
          nextHead.x < 0 ||
          nextHead.y < 0 ||
          nextHead.x >= BOARD_SIZE ||
          nextHead.y >= BOARD_SIZE ||
          current.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y)
        ) {
          setIsGameOver(true);
          setIsRunning(false);
          return current;
        }

        const ateFood = nextHead.x === food.x && nextHead.y === food.y;
        const nextSnake = [nextHead, ...current];

        if (!ateFood) {
          nextSnake.pop();
        } else {
          setScore((prev) => prev + 1);
          setFood(getRandomFood(nextSnake));
        }

        return nextSnake;
      });
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [food, isGameOver, isRunning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, boardPixelSize, boardPixelSize);

    const gradient = ctx.createLinearGradient(0, 0, boardPixelSize, boardPixelSize);
    gradient.addColorStop(0, '#FEF3C7');
    gradient.addColorStop(1, '#DBEAFE');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, boardPixelSize, boardPixelSize);

    ctx.strokeStyle = '#FBCFE8';
    ctx.lineWidth = 1;
    for (let i = 0; i <= BOARD_SIZE; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, boardPixelSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(boardPixelSize, i * CELL_SIZE);
      ctx.stroke();
    }

    snake.forEach((segment, index) => {
      ctx.fillStyle = palette[index % palette.length];
      ctx.beginPath();
      ctx.roundRect(
        segment.x * CELL_SIZE + 2,
        segment.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4,
        6
      );
      ctx.fill();
    });

    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2.6,
      food.y * CELL_SIZE + CELL_SIZE / 2.6,
      CELL_SIZE / 8,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [boardPixelSize, food, snake]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100">
      <div className="container-mobile py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mt-4 rounded-3xl bg-white/80 p-6 shadow-xl">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Rainbow Snake Adventure</h1>
            <p className="text-sm font-medium text-gray-600">
              Help the rainbow snake eat the yummy berries! Use the arrow keys or WASD.
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex w-full flex-wrap items-center justify-center gap-3">
              <div className="rounded-full bg-yellow-200 px-4 py-2 text-sm font-semibold text-yellow-900">
                Score: {score}
              </div>
              <div className="rounded-full bg-green-200 px-4 py-2 text-sm font-semibold text-green-900">
                Space = Pause
              </div>
              {isGameOver && (
                <div className="rounded-full bg-rose-200 px-4 py-2 text-sm font-semibold text-rose-700">
                  Oops! Try again.
                </div>
              )}
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={boardPixelSize}
                height={boardPixelSize}
                className="rounded-2xl border-4 border-white shadow-lg"
              />
              {!isRunning && !isGameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/70 text-center">
                  <p className="text-lg font-bold text-gray-800">Press Play to Start!</p>
                  <p className="text-xs text-gray-500">You can also press the space bar.</p>
                </div>
              )}
              {isGameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/70 text-center">
                  <p className="text-lg font-bold text-gray-800">Game Over!</p>
                  <p className="text-xs text-gray-500">Press restart to play again.</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsRunning((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2 text-sm font-semibold text-white shadow-md"
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isRunning ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                onClick={resetGame}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary-600 shadow-md"
              >
                <RotateCcw className="h-4 w-4" />
                Restart
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-center text-sm font-medium text-gray-600 sm:grid-cols-3">
            <div className="rounded-2xl bg-blue-100 px-4 py-3">Eat the berries!</div>
            <div className="rounded-2xl bg-purple-100 px-4 py-3">Don’t bump the wall.</div>
            <div className="rounded-2xl bg-orange-100 px-4 py-3">Grow the rainbow snake.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
