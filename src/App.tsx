import { useState, useEffect } from "react";
import {
  MantineProvider,
  Table,
  Title,
  Progress,
  Group,
  Text,
  Grid,
  Checkbox,
} from "@mantine/core";
import "@mantine/core/styles.css";

import "./App.css";

async function fetchData(updater: (data: any) => void) {
  // netlify functions proxies the original http data to https
  const resp = await fetch(
    "https://marsstats.netlify.app/.netlify/functions/stats"
  );
  const data = await resp.json();
  updater([...data.data]);
}

const players = ["Howard", "Yvonne", "Aredy", "Sam"];
const colors = ["red", "green", "yellow", "blue"];

function App() {
  const [data, setData] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState<
    Record<string, boolean>
  >({});
  useEffect(() => {
    fetchData(setData);
  }, []);
  console.log(selectedPlayers);
  const filtered = data.filter((d: any) => {
    const selectedArr = Object.keys(selectedPlayers).filter(
      (p) => selectedPlayers[p]
    );
    const gPlayers = d.players.map((p2: any) => p2.name.trim());
    return (
      selectedArr.length === 0 || selectedArr.every((p) => gPlayers.includes(p))
    );
  });

  const corpCounts = new Map();
  const corpWins = new Map();
  const corpGens = new Map();
  const cardCounts = new Map();
  const cardWins = new Map();
  const cardGens = new Map();
  const pCards = new Map<string, Map<string, number>>();
  const pCorps = new Map<string, Map<string, number>>();
  players.forEach((p) => {
    pCards.set(p, new Map());
    pCorps.set(p, new Map());
  });
  const pWins = new Map<string, number>();
  filtered.forEach((d: any) => {
    const winnerName = d.players[d.winner].name.trim();
    pWins.set(winnerName, (pWins.get(winnerName) ?? 0) + 1);
    d.players.forEach((p: any) => {
      corpCounts.set(p.corp, (corpCounts.get(p.corp) ?? 0) + 1);
      corpGens.set(p.corp, (corpGens.get(p.corp) ?? 0) + d.generations);
      if (p.id === d.players[d.winner].id) {
        corpWins.set(p.corp, (corpWins.get(p.corp) ?? 0) + 1);
      }
      const pName = p.name.trim();
      const target = pCorps.get(pName);
      if (target) {
        target.set(p.corp, (target.get(p.corp) ?? 0) + 1);
      }
      p.cards.forEach((c: any) => {
        cardCounts.set(c, (cardCounts.get(c) ?? 0) + 1);
        cardGens.set(c, (cardGens.get(c) ?? 0) + d.generations);
        if (p.id === d.players[d.winner].id) {
          cardWins.set(c, (cardWins.get(c) ?? 0) + 1);
        }
        const target = pCards.get(pName);
        if (target) {
          target.set(c, (target.get(c) ?? 0) + 1);
        }
      });
    });
  });
  const [gameSortKey, setGameSortKey] = useState<string>("");
  let gameSortFn = (a: any) => a["createdTimeMs"];
  switch (gameSortKey) {
    case "createdTimeMs":
    case "durationMs":
    case "map":
    case "generations":
      gameSortFn = (a: any) => a[gameSortKey];
      break;
  }
  const sortedGames = filtered.sort((a, b) => gameSortFn(b) - gameSortFn(a));
  const [corpSortKey, setCorpSortKey] = useState<string>("");
  let corpSortFn = (a: any) => a[1];
  switch (corpSortKey) {
    case "played":
      corpSortFn = ([_k, v]) => v;
      break;
    case "win":
      corpSortFn = ([k, v]) => (corpWins.get(k) ?? 0) / v;
      break;
    case "avggen":
      corpSortFn = ([k, v]) => (corpGens.get(k) ?? 0) / v;
      break;
  }
  const sortedCorps = Array.from(corpCounts.entries()).sort(
    (a, b) => corpSortFn(b) - corpSortFn(a)
  );
  const [cardSortKey, setCardSortKey] = useState<string>("");
  let cardSortFn = (a: any) => a[1];
  switch (cardSortKey) {
    case "played":
      cardSortFn = ([_k, v]) => v;
      break;
    case "win":
      cardSortFn = ([k, v]) => (cardWins.get(k) ?? 0) / v;
      break;
    case "avggen":
      cardSortFn = ([k, v]) => (cardGens.get(k) ?? 0) / v;
      break;
  }
  const sortedCards = Array.from(cardCounts.entries()).sort(
    (a, b) => cardSortFn(b) - cardSortFn(a)
  );
  // console.log(data);
  return (
    <MantineProvider defaultColorScheme="dark">
      <Grid>
        <Grid.Col span={12}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              justifyContent: "space-between",
            }}
          >
            {players.map((p, i) => {
              return (
                <div
                  key={p}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Title order={3}>{p}</Title>
                  <Checkbox
                    value={Boolean(selectedPlayers[p]).toString()}
                    onChange={(event: any) => {
                      console.log(p, event.currentTarget.checked);
                      const newSelectedPlayers = { ...selectedPlayers };
                      newSelectedPlayers[p] = event.currentTarget.checked;
                      setSelectedPlayers(newSelectedPlayers);
                    }}
                  />
                  <Title order={1} style={{ color: colors[i] }}>
                    {pWins.get(p) ?? 0}
                  </Title>
                  {/* {i < players.length - 1 ? <Title order={1} style={{ margin: "0px 8px" }}>{`-`}</Title> : null} */}
                </div>
              );
            })}
          </div>
          <div>
            <Progress.Root size={20}>
              {players.map((p, i) => {
                const pct = ((pWins.get(p) ?? 0) / sortedGames.length) * 100;
                return (
                  <Progress.Section
                    key={p}
                    value={((pWins.get(p) ?? 0) / sortedGames.length) * 100}
                    color={colors[i]}
                  >
                    <Progress.Label>{pct.toFixed(0)}%</Progress.Label>
                  </Progress.Section>
                );
              })}
            </Progress.Root>
          </div>
        </Grid.Col>
        <Grid.Col span={{ lg: 6, base: 12 }}>
          <Title>Games</Title>
          <div className="mobileScroll">
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th onClick={() => setGameSortKey("createdTimeMs")}>
                    Time
                  </Table.Th>
                  <Table.Th onClick={() => setGameSortKey("durationMs")}>
                    Duration
                  </Table.Th>
                  <Table.Th>Map</Table.Th>
                  <Table.Th onClick={() => setGameSortKey("generations")}>
                    Gens
                  </Table.Th>
                  <Table.Th>Result</Table.Th>
                  {players.map((p, i) => (
                    <Table.Th key={p}>
                      <div style={{ color: colors[i] }}>{p}</div>
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedGames.map((d: any) => {
                  return (
                    <Table.Tr key={d.createdTimeMs}>
                      <Table.Td>
                        <a
                          href={`http://azure.howardchung.net:8081/game?id=${d.gameId}`}
                        >
                          {new Date(d.createdTimeMs).toLocaleString()}
                        </a>
                      </Table.Td>
                      <Table.Td>{`${Math.floor(d.durationMs / 1000 / 60)}:${(
                        Math.floor(d.durationMs / 1000) % 60
                      )
                        .toString()
                        .padStart(2, "0")}`}</Table.Td>
                      <Table.Td>{d.map}</Table.Td>
                      <Table.Td>{d.generations}</Table.Td>
                      <Table.Td>
                        <div
                          style={{
                            display: "flex",
                            minWidth: "120px",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              width: "100%",
                              margin: "0 auto",
                              bottom: "10px",
                            }}
                          >
                            ▼
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              width: "1px",
                              height: "100%",
                              left: "50%",
                              zIndex: 1,
                              backgroundColor: "white",
                            }}
                          ></div>
                          <SplitBar
                            values={players.map(
                              (p) =>
                                d.players.find(
                                  (p2: any) => p2.name.trim() === p
                                )?.score ?? 0
                            )}
                          />
                        </div>
                      </Table.Td>
                      {players.map((p, i) => {
                        return (
                          <Table.Td
                            key={p}
                            style={{
                              backgroundColor:
                                d.players[d.winner]?.name === p
                                  ? colors[i]
                                  : "initial",
                            }}
                          >
                            <Text size={"xs"}>{`${
                              d.players.find((p2: any) => p2.name === p)
                                ?.corp ?? ""
                            }`}</Text>
                          </Table.Td>
                        );
                      })}
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </div>
        </Grid.Col>
        <Grid.Col span={{ lg: 3, base: 12 }}>
          <Title>Corps</Title>
          <div className="mobileScroll">
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th onClick={() => setCorpSortKey("played")}>
                    Played
                  </Table.Th>
                  <Table.Th onClick={() => setCorpSortKey("win")}>
                    Win%
                  </Table.Th>
                  <Table.Th onClick={() => setCorpSortKey("avggen")}>
                    Avg.Gens
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedCorps.map(([k, v]) => (
                  <Table.Tr key={k}>
                    <Table.Td>
                      {" "}
                      {k}
                      <SplitBar
                        values={players.map((p) => pCorps.get(p)?.get(k) ?? 0)}
                      />
                    </Table.Td>
                    <Table.Td>{v}</Table.Td>
                    <Table.Td>
                      <PercentBar value={((corpWins.get(k) ?? 0) / v) * 100} />
                    </Table.Td>
                    <Table.Td>
                      {((corpGens.get(k) ?? 0) / v).toFixed(2)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        </Grid.Col>
        <Grid.Col span={{ lg: 3, base: 12 }}>
          <Title>Cards</Title>
          <div className="mobileScroll">
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th onClick={() => setCardSortKey("played")}>
                    Played
                  </Table.Th>
                  <Table.Th onClick={() => setCardSortKey("win")}>
                    Win%
                  </Table.Th>
                  <Table.Th onClick={() => setCardSortKey("avggen")}>
                    Avg.Gens
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedCards.map(([k, v]) => (
                  <Table.Tr key={k}>
                    <Table.Td>
                      <div>
                        {k}
                        <SplitBar
                          values={players.map(
                            (p) => pCards.get(p)?.get(k) ?? 0
                          )}
                        />
                      </div>
                    </Table.Td>
                    <Table.Td>{v}</Table.Td>
                    <Table.Td>
                      <PercentBar value={((cardWins.get(k) ?? 0) / v) * 100} />
                    </Table.Td>
                    <Table.Td>
                      {((cardGens.get(k) ?? 0) / v).toFixed(2)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        </Grid.Col>
        {/* <pre>{JSON.stringify(data)}</pre> */}
      </Grid>
    </MantineProvider>
  );
}

function PercentBar({ value }: { value: number }) {
  return (
    <div>
      <Group justify="space-between">
        <Text fz="xs" c={value > 50 ? "green" : "red"} fw={700}>
          {value.toFixed(1)}%
        </Text>
      </Group>
      <Progress.Root>
        <Progress.Section value={value} color={value > 50 ? "green" : "red"} />
      </Progress.Root>
    </div>
  );
}

function SplitBar({ values }: { values: number[] }) {
  const sum = values.reduce((a, b) => a + b, 0);
  return (
    <div style={{ width: "100%" }}>
      <Progress.Root size={14} classNames={{ label: "label" }}>
        {values.map((v, i) => {
          if (!v) {
            return null;
          }
          return (
            <Progress.Section key={i} value={(v / sum) * 100} color={colors[i]}>
              <Progress.Label>{v}</Progress.Label>
            </Progress.Section>
          );
        })}
      </Progress.Root>
    </div>
  );
}

export default App;
