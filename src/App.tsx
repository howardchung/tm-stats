import { useState, useEffect } from "react";
import {
  MantineProvider,
  Table,
  Title,
  Progress,
  Group,
  Text,
  Grid,
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

function App() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetchData(setData);
  }, []);
  const corpCounts = new Map();
  const corpWins = new Map();
  const corpGens = new Map();
  const cardCounts = new Map();
  const cardWins = new Map();
  const cardGens = new Map();
  const hCards = new Map();
  const yCards = new Map();
  const hCorps = new Map();
  const yCorps = new Map();
  let hWins = 0;
  let yWins = 0;
  data.forEach((d: any) => {
    if (d.players[d.winner].name.trim() === "Howard") {
      hWins += 1;
    }
    if (d.players[d.winner].name.trim() === "Yvonne") {
      yWins += 1;
    }
    d.players.forEach((p: any) => {
      corpCounts.set(p.corp, (corpCounts.get(p.corp) ?? 0) + 1);
      corpGens.set(p.corp, (corpGens.get(p.corp) ?? 0) + d.generations);
      if (p.id === d.players[d.winner].id) {
        corpWins.set(p.corp, (corpWins.get(p.corp) ?? 0) + 1);
      }
      if (p.name.trim() === "Howard") {
        hCorps.set(p.corp, (hCorps.get(p.corp) ?? 0) + 1);
      }
      if (p.name.trim() === "Yvonne") {
        yCorps.set(p.corp, (yCorps.get(p.corp) ?? 0) + 1);
      }
      p.cards.forEach((c: any) => {
        cardCounts.set(c, (cardCounts.get(c) ?? 0) + 1);
        cardGens.set(c, (cardGens.get(c) ?? 0) + d.generations);
        if (p.id === d.players[d.winner].id) {
          cardWins.set(c, (cardWins.get(c) ?? 0) + 1);
        }
        if (p.name.trim() === "Howard") {
          hCards.set(c, (hCards.get(c) ?? 0) + 1);
        }
        if (p.name.trim() === "Yvonne") {
          yCards.set(c, (yCards.get(c) ?? 0) + 1);
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
  const sortedGames = data.sort((a, b) => gameSortFn(b) - gameSortFn(a));
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
              justifyContent: "space-between",
            }}
          >
            <Title order={3}>Howard</Title>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 700 }}>
              <Title order={1} style={{ color: "red" }}>
                {hWins}
              </Title>
              <Title order={1} style={{ margin: "0px 8px" }}>{`-`}</Title>
              <Title order={1} style={{ color: "green" }}>
                {yWins}
              </Title>
            </div>
            <Title order={3}>Yvonne</Title>
          </div>
          <div>
            <Group justify="space-between">
              <Text fz="xs" c="red" fw={700}>
                {((hWins / (hWins + yWins)) * 100).toFixed(0)}%
              </Text>
              <Text fz="xs" c="green" fw={700}>
                {((yWins / (hWins + yWins)) * 100).toFixed(0)}%
              </Text>
            </Group>
            <Progress.Root>
              <Progress.Section
                // className={classes.progressSection}
                value={(hWins / (hWins + yWins)) * 100}
                color="red"
              />

              <Progress.Section
                // className={classes.progressSection}
                value={(yWins / (hWins + yWins)) * 100}
                color="green"
              />
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
                  <Table.Th>Howard</Table.Th>
                  <Table.Th>Yvonne</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedGames.map((d: any) => {
                  const hscore = d.players.find(
                    (p: any) => p.name.trim() === "Howard"
                  )?.score;
                  const yscore = d.players.find(
                    (p: any) => p.name.trim() === "Yvonne"
                  )?.score;
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
                        <div style={{ display: "flex" }}>
                          <SplitBar a={hscore} b={yscore} />
                        </div>
                      </Table.Td>
                      <Table.Td
                        style={{
                          backgroundColor:
                            d.players[d.winner]?.name === "Howard"
                              ? "red"
                              : "initial",
                        }}
                      >{`${d.players[0]?.corp}`}</Table.Td>
                      <Table.Td
                        style={{
                          backgroundColor:
                            d.players[d.winner]?.name === "Yvonne"
                              ? "green"
                              : "initial",
                        }}
                      >{`${d.players[1]?.corp}`}</Table.Td>
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
                      <SplitBar a={hCorps.get(k) ?? 0} b={yCorps.get(k) ?? 0} />
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
                          a={hCards.get(k) ?? 0}
                          b={yCards.get(k) ?? 0}
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

function SplitBar({ a, b }: { a: number; b: number }) {
  return (
    <div style={{ width: "100%" }}>
      <Group justify="space-between" wrap={"nowrap"}>
        <Text fz="xs" c={"red"} fw={700}>
          {a}
        </Text>
        <Text fz="xs" c={"green"} fw={700}>
          {b}
        </Text>
      </Group>
      <Progress.Root>
        <Progress.Section
          className="progressSection1"
          value={(a / (a + b)) * 100}
          color={"red"}
        />
        <Progress.Section
          className="progressSection2"
          value={(b / (a + b)) * 100}
          color={"green"}
        />
      </Progress.Root>
    </div>
  );
}

export default App;
