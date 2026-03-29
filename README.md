# Pixel Memory Game

A browser-based memory card game built with React and TypeScript. The goal is to match all pairs of cards while minimizing moves and time.

---

## Live Demo

https://memory-game-nu-kohl.vercel.app

---

## Features

* Memory matching gameplay with a 4x4 grid
* Move counter to track attempts
* Real-time timer
* High score, and Best time tracking using localStorage
* Sound effects for card flips, matches, and winning
* Image-based cards using pixel art avatars
* Restart functionality

---

## Tech Stack

* Frontend: React with TypeScript
* State Management: React Hooks (useState, useEffect)
* Storage: Browser localStorage
* Assets: DiceBear Avatars API and Mixkit sound effects
* Deployment: Vercel

---

## How to Play

1. Click a card to flip it

2. Click a second card to try and find a matching pair

3. If the cards match, they remain visible

4. If they do not match, they flip back after a short delay

5. Continue until all pairs are matched

Try to complete the game in the fewest moves and shortest time possible

---

## Installation

```bash id="o2wq9r"
git clone https://github.com/your-username/pixel-memory-game.git
cd pixel-memory-game
npm install
npm run dev
```

---

## Future Improvements

* Add card flip animations
* Introduce difficulty levels (larger grids)
* Add multiplayer functionality
* Implement a global leaderboard

---

## License

This project is available under the MIT License.
