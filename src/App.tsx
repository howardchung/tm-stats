import { useState, useEffect } from "react";
import "./App.css";

async function fetchData(updater: (data: any) => void) {
  const resp = await fetch("http://azure.howardchung.net:8081/api/stats");
  const data = await resp.json();
  updater(data.data.reverse());
}

function App() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetchData(setData);
  }, []);
  const corpCounts = new Map();
  const corpWins = new Map();
  const cardCounts = new Map();
  const cardWins = new Map();
  let hWins = 0;
  let yWins = 0;
  data.forEach((d: any) => {
    // TODO handle ties?
    const winner = d.players.find(
      (p: any) => p.score === Math.max(...d.players.map((p: any) => p.score))
    );
    if (winner.name === "Howard") {
      hWins += 1;
    }
    if (winner.name === "Yvonne") {
      yWins += 1;
    }
    d.players.forEach((p: any) => {
      corpCounts.set(p.corp, (corpCounts.get(p.corp) ?? 0) + 1);
      if (p.id === winner.id) {
        corpWins.set(p.corp, (corpWins.get(p.corp) ?? 0) + 1);
      }
      p.cards.forEach((c: any) => {
        cardCounts.set(c, (cardCounts.get(c) ?? 0) + 1);
        if (p.id === winner.id) {
          cardWins.set(c, (cardWins.get(c) ?? 0) + 1);
        }
      });
    });
  });
  const sortedCorps = Array.from(corpCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  const sortedCards = Array.from(cardCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  // console.log(data);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>Howard</div>

        <div style={{ display: "flex", fontSize: 24, fontWeight: 700 }}>
          <div style={{ color: "red" }}>{hWins}</div>
          <div style={{ margin: "0px 8px" }}>{`-`}</div>
          <div style={{ color: "green" }}>{yWins}</div>
        </div>

        <div>Yvonne</div>
      </div>
      <h3>Games</h3>
      <table>
        <tr>
          <td>Time</td>
          <td>Duration</td>
          <td>Map</td>
          <td>Gens</td>
          <td>Result</td>
          <td>Howard</td>
          <td>Yvonne</td>
        </tr>
        {data.map((d: any) => {
          const hscore = d.players.find((p: any) => p.name === "Howard").score;
          const yscore = d.players.find((p: any) => p.name === "Yvonne").score;
          return (
            <tr>
              <td>{new Date(d.createdTimeMs).toLocaleString()}</td>
              <td>{`${Math.floor(d.durationMs / 1000 / 60)}:${
                Math.floor(d.durationMs / 1000) % 60
              }`}</td>
              <td>{d.map}</td>
              <td>{d.generations}</td>
              <td style={{ display: "flex" }}>
                <div
                  style={{
                    color: "red",
                    fontWeight: hscore > yscore ? 700 : 400,
                  }}
                >
                  {hscore}
                </div>{" "}
                -{" "}
                <div
                  style={{
                    color: "green",
                    fontWeight: yscore > hscore ? 700 : 400,
                  }}
                >
                  {yscore}
                </div>
              </td>
              <td
                style={{ backgroundColor: hscore > yscore ? "red" : "initial" }}
              >{`${d.players.find((p: any) => p.name === "Howard").corp}`}</td>
              <td
                style={{
                  backgroundColor: yscore > hscore ? "green" : "initial",
                }}
              >{`${d.players.find((p: any) => p.name === "Yvonne").corp}`}</td>
            </tr>
          );
        })}
      </table>
      <h3>Corps</h3>
      <table>
        <tr>
          <td>Name</td>
          <td>Played</td>
          <td>Win%</td>
        </tr>
        {sortedCorps.map(([k, v]) => (
          <tr>
            <td>{k}</td>
            <td>{v}</td>
            <td>{(((corpWins.get(k) ?? 0) / v) * 100).toFixed(1)}%</td>
          </tr>
        ))}
      </table>
      <h3>Cards</h3>
      <table>
        <tr>
          <td>Name</td>
          <td>Played</td>
          <td>Play%</td>
          <td>Win%</td>
        </tr>
        {sortedCards.map(([k, v]) => (
          <tr>
            <td>{k}</td>
            <td>{v}</td>
            <td>
              {(((cardWins.get(k) ?? 0) / data.length) * 100).toFixed(1)}%
            </td>
            <td>{(((cardWins.get(k) ?? 0) / v) * 100).toFixed(1)}%</td>
          </tr>
        ))}
      </table>
      {/* <pre>{JSON.stringify(data)}</pre> */}
    </div>
  );
}

export default App;
