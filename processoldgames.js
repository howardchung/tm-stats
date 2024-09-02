import fs from "fs";

// Loop through oldgames
const dir = fs.readdirSync("oldgames");
const output = [];
dir.forEach((file) => {
  const json = JSON.parse(fs.readFileSync("oldgames/" + file));
  // console.log(json);
  output.push({
    generations: json.game.generation,
    createdTimeMs: json.game.expectedPurgeTimeMs - 17 * 24 * 60 * 60 * 1000,
    durationMs:
      json.players[0].timer.startedAt -
      (json.game.expectedPurgeTimeMs - 17 * 24 * 60 * 60 * 1000),
    map: json.game.gameOptions.boardName,
    players: json.players.map((p) => ({
      id: p.id,
      color: p.color,
      actions: p.actionsTakenThisGame,
      // Remove first card since it's a corp
      cards: p.tableau.slice(1).map((c) => c.name),
      cardsPlayed: p.tableau.length - 1,
      corp: p.tableau[0].name,
      name: p.name,
      score: p.victoryPointsBreakdown.total,
      timer: p.timer.sumElapsed,
    })),
  });
});
fs.writeFileSync("public/oldgames.json", JSON.stringify(output, null, 2));
// Process each one into new data format
// Save as single output JSON array
