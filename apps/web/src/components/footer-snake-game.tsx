import { useEffect, useEffectEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { useEffectiveTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

import type { EffectiveTheme } from "@/lib/theme";
import type { CSSProperties } from "react";

export type GamePhase = "idle" | "morphing" | "paused" | "playing" | "game-over" | "won";
export type Direction = "up" | "down" | "left" | "right";

export type Point = {
  readonly x: number;
  readonly y: number;
};

export type SnakeState = {
  readonly direction: Direction;
  readonly food: Point | null;
  readonly pendingDirection: Direction;
  readonly score: number;
  readonly snake: ReadonlyArray<Point>;
};

type IdleGameState = {
  readonly phase: "idle";
};

type MorphingGameState = {
  readonly phase: "morphing";
};

type PlayingGameState = {
  readonly phase: "playing";
  readonly snakeState: SnakeState;
};

type PausedGameState = {
  readonly phase: "paused";
  readonly snakeState: SnakeState;
};

type GameOverState = {
  readonly phase: "game-over";
  readonly snakeState: SnakeState;
};

type WonGameState = {
  readonly phase: "won";
  readonly snakeState: SnakeState;
};

type GameState =
  | IdleGameState
  | MorphingGameState
  | PausedGameState
  | PlayingGameState
  | GameOverState
  | WonGameState;

type FooterSnakeGameProps = {
  readonly morphDurationMs?: number;
  readonly random?: () => number;
  readonly tickDurationMs?: number;
};

const defaultTickDurationMs = 180;
const defaultMorphDurationMs = 300;
const boardColumns = 27;
const boardRows = 15;
const boardCellWidthPercent = 100 / boardColumns;
const boardCellHeightPercent = 100 / boardRows;

const logoOffset = createPoint(11, 4);
const snakeOffset = createPoint(9, 2);

const idleLogoCells: ReadonlyArray<Point> = [
  offsetPoint(createPoint(0, 0), logoOffset),
  offsetPoint(createPoint(0, 1), logoOffset),
  offsetPoint(createPoint(0, 2), logoOffset),
  offsetPoint(createPoint(0, 3), logoOffset),
  offsetPoint(createPoint(0, 4), logoOffset),
  offsetPoint(createPoint(1, 1), logoOffset),
  offsetPoint(createPoint(2, 2), logoOffset),
  offsetPoint(createPoint(3, 1), logoOffset),
  offsetPoint(createPoint(4, 0), logoOffset),
  offsetPoint(createPoint(4, 1), logoOffset),
  offsetPoint(createPoint(4, 2), logoOffset),
  offsetPoint(createPoint(4, 3), logoOffset),
  offsetPoint(createPoint(4, 4), logoOffset),
];

const initialSnakeBody: ReadonlyArray<Point> = [
  offsetPoint(createPoint(5, 4), snakeOffset),
  offsetPoint(createPoint(4, 4), snakeOffset),
  offsetPoint(createPoint(3, 4), snakeOffset),
];

const initialDirection: Direction = "right";

export function FooterSnakeGame({
  morphDurationMs = defaultMorphDurationMs,
  random = Math.random,
  tickDurationMs = defaultTickDurationMs,
}: FooterSnakeGameProps) {
  const theme = useEffectiveTheme();
  const [gameState, setGameState] = useState<GameState>({ phase: "idle" });

  const queueDirection = useEffectEvent((direction: Direction) => {
    setGameState((currentState) => queueNextDirection(currentState, direction));
  });

  const advanceGame = useEffectEvent(() => {
    setGameState((currentState) => advanceGameState(currentState, random));
  });

  const pauseGame = useEffectEvent(() => {
    setGameState((currentState) => {
      if (currentState.phase !== "playing") {
        return currentState;
      }

      return {
        phase: "paused",
        snakeState: currentState.snakeState,
      };
    });
  });

  useEffect(() => {
    if (gameState.phase !== "morphing") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setGameState(createPlayingState(random));
    }, morphDurationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [gameState.phase, morphDurationMs, random]);

  useEffect(() => {
    if (gameState.phase !== "playing") {
      return;
    }

    const intervalId = window.setInterval(() => {
      advanceGame();
    }, tickDurationMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [advanceGame, gameState.phase, tickDurationMs]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const direction = parseDirectionKey(event.key);

      if (!direction) {
        return;
      }

      event.preventDefault();
      queueDirection(direction);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [queueDirection]);

  useEffect(() => {
    function handleBlur() {
      pauseGame();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        pauseGame();
      }
    }

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pauseGame]);

  const snakeCells = getRenderedSnakeCells(gameState);
  const head = snakeCells[0];
  const food = getRenderedFood(gameState);
  const isResultPhase = gameState.phase === "game-over" || gameState.phase === "won";
  const isIdle = gameState.phase === "idle";
  const isPaused = gameState.phase === "paused";
  const showControls = gameState.phase !== "idle";
  const isPlaying = gameState.phase === "playing";
  const showPauseButton = gameState.phase === "playing" || gameState.phase === "paused";
  const showScore = gameState.phase !== "idle";
  const actionLabel = gameState.phase === "idle" ? "Play" : "Play again";
  const score = getScore(gameState);
  const boardStyle = getBoardStyle(theme);

  return (
    <section aria-label="Footer snake game" className="border-t border-border/80 px-5 py-5 sm:px-8">
      <div className="mx-auto flex w-full flex-col items-center gap-4 text-center">
        <div
          aria-label="Pixel M snake board"
          className={cn(
            "relative w-full overflow-hidden rounded-[1.75rem]",
            isIdle ? "border border-transparent" : "border border-border/80",
          )}
          data-phase={gameState.phase}
          data-testid="footer-snake-board"
          role="img"
          style={
            isIdle
              ? {
                  aspectRatio: `${boardColumns} / ${boardRows}`,
                }
              : {
                  ...boardStyle,
                  aspectRatio: `${boardColumns} / ${boardRows}`,
                }
          }
        >
          <div
            className={cn(
              "pointer-events-none absolute top-4 right-4 z-10 text-[11px] leading-none text-foreground/72 transition-opacity duration-200",
              showScore ? "opacity-100" : "opacity-0",
            )}
            data-testid="snake-score"
          >
            Score {score}
          </div>
          <div
            className={cn(
              "absolute z-10 flex items-center gap-2 transition-[top,left,transform,opacity] duration-300 ease-out",
              isIdle
                ? "top-[72%] left-1/2 -translate-x-1/2 -translate-y-1/2"
                : "top-4 left-4 translate-x-0 translate-y-0",
            )}
          >
            <Button
              onClick={() => {
                setGameState({ phase: "morphing" });
              }}
              type="button"
              variant={gameState.phase === "idle" ? "default" : "outline"}
            >
              {actionLabel}
            </Button>
            {showPauseButton ? (
              <Button
                onClick={() => {
                  setGameState((currentState) => {
                    if (currentState.phase === "playing") {
                      return {
                        phase: "paused",
                        snakeState: currentState.snakeState,
                      };
                    }

                    if (currentState.phase === "paused") {
                      return {
                        phase: "playing",
                        snakeState: currentState.snakeState,
                      };
                    }

                    return currentState;
                  });
                }}
                type="button"
                variant="outline"
              >
                {isPaused ? "Resume" : "Pause"}
              </Button>
            ) : null}
          </div>
          {snakeCells.map((point, index) => (
            <div
              key={`snake-segment-${index}`}
              aria-hidden="true"
              className={cn(
                "absolute transition-[left,top,background-color] ease-out",
                gameState.phase === "morphing" ? "duration-300" : "duration-150",
              )}
              data-col={point.x}
              data-row={point.y}
              data-segment="snake"
              data-testid={index === 0 ? "snake-head" : undefined}
              style={getCellStyle(point, index === 0, theme)}
            />
          ))}
          {food ? (
            <div
              aria-hidden="true"
              className="absolute"
              data-col={food.x}
              data-row={food.y}
              data-testid="snake-food"
              style={getFoodStyle(food, theme)}
            />
          ) : null}
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="max-w-md text-xs leading-6 text-muted-foreground" role="status">
            {getStatusCopy(gameState, head)}
          </p>
        </div>

        <div className="grid justify-items-center gap-4">
          {showControls ? (
            <div className="grid w-full max-w-48 justify-items-center gap-2 sm:hidden">
              <Button
                aria-label="Move up"
                disabled={!isPlaying}
                onClick={() => {
                  queueDirection("up");
                }}
                type="button"
                variant="outline"
              >
                Up
              </Button>
              <div className="grid w-full grid-cols-2 gap-2">
                <Button
                  aria-label="Move left"
                  disabled={!isPlaying}
                  onClick={() => {
                    queueDirection("left");
                  }}
                  type="button"
                  variant="outline"
                >
                  Left
                </Button>
                <Button
                  aria-label="Move right"
                  disabled={!isPlaying}
                  onClick={() => {
                    queueDirection("right");
                  }}
                  type="button"
                  variant="outline"
                >
                  Right
                </Button>
              </div>
              <Button
                aria-label="Move down"
                disabled={!isPlaying}
                onClick={() => {
                  queueDirection("down");
                }}
                type="button"
                variant="outline"
              >
                Down
              </Button>
            </div>
          ) : null}

          {isResultPhase ? (
            <p className="max-w-md text-xs leading-6 text-muted-foreground">
              {gameState.phase === "won"
                ? "Board cleared. Start again for another run."
                : "Hit Play again to reset the board."}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function createPoint(x: number, y: number): Point {
  return { x, y };
}

function offsetPoint(point: Point, offset: Point): Point {
  return createPoint(point.x + offset.x, point.y + offset.y);
}

function getBoardStyle(theme: EffectiveTheme): CSSProperties {
  return {
    backgroundColor:
      theme === "light"
        ? "color-mix(in oklab, var(--muted) 88%, var(--background))"
        : "color-mix(in oklab, var(--background) 80%, var(--foreground))",
    backgroundImage:
      theme === "light"
        ? "linear-gradient(to right, color-mix(in oklab, var(--border) 78%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--border) 78%, transparent) 1px, transparent 1px)"
        : "linear-gradient(to right, color-mix(in oklab, var(--foreground) 10%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 10%, transparent) 1px, transparent 1px)",
    backgroundSize: `calc(100% / ${boardColumns}) calc(100% / ${boardRows})`,
  };
}

function getCellStyle(point: Point, isHead: boolean, theme: EffectiveTheme): CSSProperties {
  return {
    backgroundColor: isHead
      ? "color-mix(in oklab, var(--primary) 84%, var(--foreground))"
      : theme === "light"
        ? "color-mix(in oklab, var(--foreground) 32%, var(--background))"
        : "color-mix(in oklab, var(--foreground) 72%, var(--background))",
    borderRadius: "4px",
    height: `calc(${boardCellHeightPercent}% - 8px)`,
    left: `calc(${point.x * boardCellWidthPercent}% + 4px)`,
    top: `calc(${point.y * boardCellHeightPercent}% + 4px)`,
    width: `calc(${boardCellWidthPercent}% - 8px)`,
  };
}

function getFoodStyle(point: Point, theme: EffectiveTheme): CSSProperties {
  return {
    ...getCellStyle(point, false, theme),
    backgroundColor:
      theme === "dark"
        ? "color-mix(in oklab, var(--primary) 68%, white)"
        : "color-mix(in oklab, var(--primary) 38%, var(--foreground))",
  };
}

function getRenderedSnakeCells(gameState: GameState): ReadonlyArray<Point> {
  switch (gameState.phase) {
    case "idle":
      return idleLogoCells;
    case "morphing":
      return initialSnakeBody;
    case "paused":
    case "playing":
    case "game-over":
    case "won":
      return gameState.snakeState.snake;
  }
}

function getRenderedFood(gameState: GameState): Point | null {
  switch (gameState.phase) {
    case "paused":
    case "playing":
    case "game-over":
    case "won":
      return gameState.snakeState.food;
    case "idle":
    case "morphing":
      return null;
  }
}

function createPlayingState(random: () => number): PlayingGameState {
  const food = pickRandomEmptyCell(initialSnakeBody, random);

  return {
    phase: "playing",
    snakeState: {
      direction: initialDirection,
      food,
      pendingDirection: initialDirection,
      score: 0,
      snake: initialSnakeBody,
    },
  };
}

export function parseDirectionKey(key: string): Direction | null {
  switch (key) {
    case "ArrowUp":
      return "up";
    case "ArrowDown":
      return "down";
    case "ArrowLeft":
      return "left";
    case "ArrowRight":
      return "right";
  }

  switch (key.toLowerCase()) {
    case "w":
    case "k":
      return "up";
    case "a":
    case "h":
      return "left";
    case "s":
    case "j":
      return "down";
    case "d":
    case "l":
      return "right";
    default:
      return null;
  }
}

export function getNextHead(head: Point, direction: Direction): Point {
  switch (direction) {
    case "up":
      return createPoint(head.x, head.y - 1);
    case "down":
      return createPoint(head.x, head.y + 1);
    case "left":
      return createPoint(head.x - 1, head.y);
    case "right":
      return createPoint(head.x + 1, head.y);
  }
}

export function pickRandomEmptyCell(
  occupiedCells: ReadonlyArray<Point>,
  random: () => number = Math.random,
): Point | null {
  const emptyCells: Array<Point> = [];

  for (let y = 0; y < boardRows; y += 1) {
    for (let x = 0; x < boardColumns; x += 1) {
      const point = createPoint(x, y);

      if (!occupiedCells.some((cell) => pointsEqual(cell, point))) {
        emptyCells.push(point);
      }
    }
  }

  if (emptyCells.length === 0) {
    return null;
  }

  const selectedIndex = Math.min(emptyCells.length - 1, Math.floor(random() * emptyCells.length));

  return emptyCells[selectedIndex] ?? null;
}

function queueNextDirection(gameState: GameState, direction: Direction): GameState {
  switch (gameState.phase) {
    case "idle":
    case "morphing":
      return gameState;
    case "paused":
      return {
        ...gameState,
        snakeState: {
          ...gameState.snakeState,
          pendingDirection: direction,
        },
      };
    case "playing":
      if (
        direction === gameState.snakeState.direction ||
        isOppositeDirection(direction, gameState.snakeState.direction)
      ) {
        return gameState;
      }

      return {
        ...gameState,
        snakeState: {
          ...gameState.snakeState,
          pendingDirection: direction,
        },
      };
    case "game-over":
    case "won":
      return gameState;
  }
}

function advanceGameState(gameState: GameState, random: () => number): GameState {
  if (gameState.phase !== "playing") {
    return gameState;
  }

  const { snakeState } = gameState;
  const head = snakeState.snake[0];

  if (!head) {
    return {
      phase: "game-over",
      snakeState,
    };
  }

  const nextDirection = snakeState.pendingDirection;
  const nextHead = getNextHead(head, nextDirection);

  if (isOutsideBoard(nextHead)) {
    return {
      phase: "game-over",
      snakeState: {
        ...snakeState,
        direction: nextDirection,
        pendingDirection: nextDirection,
      },
    };
  }

  const isEatingFood = snakeState.food !== null && pointsEqual(nextHead, snakeState.food);
  const bodyToCheck = isEatingFood
    ? snakeState.snake
    : snakeState.snake.slice(0, snakeState.snake.length - 1);

  if (bodyToCheck.some((segment) => pointsEqual(segment, nextHead))) {
    return {
      phase: "game-over",
      snakeState: {
        ...snakeState,
        direction: nextDirection,
        pendingDirection: nextDirection,
      },
    };
  }

  const nextSnake = isEatingFood
    ? [nextHead, ...snakeState.snake]
    : [nextHead, ...snakeState.snake.slice(0, snakeState.snake.length - 1)];
  const nextFood = isEatingFood ? pickRandomEmptyCell(nextSnake, random) : snakeState.food;
  const nextSnakeState: SnakeState = {
    direction: nextDirection,
    food: nextFood,
    pendingDirection: nextDirection,
    score: isEatingFood ? snakeState.score + 1 : snakeState.score,
    snake: nextSnake,
  };

  if (isEatingFood && nextFood === null) {
    return {
      phase: "won",
      snakeState: nextSnakeState,
    };
  }

  return {
    phase: "playing",
    snakeState: nextSnakeState,
  };
}

function getStatusCopy(gameState: GameState, head: Point | undefined): string {
  switch (gameState.phase) {
    case "idle":
      return "Press Play to morph the M into a snake.";
    case "morphing":
      return "Building the run...";
    case "paused":
      return `Paused. Score ${gameState.snakeState.score}.`;
    case "playing":
      return `Score ${gameState.snakeState.score}. Head ${formatPoint(head)}.`;
    case "game-over":
      return `Game over. Score ${gameState.snakeState.score}.`;
    case "won":
      return `Board full. Score ${gameState.snakeState.score}.`;
  }
}

function getScore(gameState: GameState): number {
  switch (gameState.phase) {
    case "idle":
    case "morphing":
      return 0;
    case "paused":
    case "playing":
    case "game-over":
    case "won":
      return gameState.snakeState.score;
  }
}

function formatPoint(point: Point | undefined): string {
  if (!point) {
    return "-,-";
  }

  return `${point.x},${point.y}`;
}

function isOutsideBoard(point: Point): boolean {
  return point.x < 0 || point.x >= boardColumns || point.y < 0 || point.y >= boardRows;
}

function pointsEqual(left: Point, right: Point): boolean {
  return left.x === right.x && left.y === right.y;
}

function isOppositeDirection(left: Direction, right: Direction): boolean {
  switch (left) {
    case "up":
      return right === "down";
    case "down":
      return right === "up";
    case "left":
      return right === "right";
    case "right":
      return right === "left";
  }
}
