import { useState, useEffect } from "react";
import {
  MantineProvider,
  Table,
  Title,
  Divider,
  Progress,
  Group,
  Text,
} from "@mantine/core";
import "@mantine/core/styles.css";

import "./App.css";

async function fetchData(updater: (data: any) => void) {
  // netlify functions proxies the original http data to https
  const resp = await fetch(
    "https://marsstats.netlify.app/.netlify/functions/stats"
  );
  const hist = await fetch("./oldgames.json");
  const data = await resp.json();
  const histdata = await hist.json();
  updater(
    [...data.data, ...histdata].sort(
      (a, b) => b.createdTimeMs - a.createdTimeMs
    )
  );
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
  let hWins = 0;
  let yWins = 0;
  data.forEach((d: any) => {
    // TODO handle ties?
    const winner = d.players.find(
      (p: any) => p.score === Math.max(...d.players.map((p: any) => p.score))
    );
    if (winner.name.trim() === "Howard") {
      hWins += 1;
    }
    if (winner.name.trim() === "Yvonne") {
      yWins += 1;
    }
    d.players.forEach((p: any) => {
      corpCounts.set(p.corp, (corpCounts.get(p.corp) ?? 0) + 1);
      corpGens.set(p.corp, (corpGens.get(p.corp) ?? 0) + d.generations);
      if (p.id === winner.id) {
        corpWins.set(p.corp, (corpWins.get(p.corp) ?? 0) + 1);
      }
      p.cards.forEach((c: any) => {
        cardCounts.set(c, (cardCounts.get(c) ?? 0) + 1);
        cardGens.set(c, (cardGens.get(c) ?? 0) + d.generations);
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
    <MantineProvider defaultColorScheme="dark">
      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
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
        <Divider />
        <div style={{ display: "flex", gap: "16px" }}>
          <div>
            <Title>Games</Title>
            <Table>
              <Table.Tr>
                <Table.Td>Time</Table.Td>
                <Table.Td>Duration</Table.Td>
                <Table.Td>Map</Table.Td>
                <Table.Td>Gens</Table.Td>
                <Table.Td>Result</Table.Td>
                <Table.Td>Howard</Table.Td>
                <Table.Td>Yvonne</Table.Td>
              </Table.Tr>
              {data.map((d: any) => {
                const hscore = d.players.find(
                  (p: any) => p.name.trim() === "Howard"
                )?.score;
                const yscore = d.players.find(
                  (p: any) => p.name.trim() === "Yvonne"
                )?.score;
                return (
                  <Table.Tr>
                    <Table.Td>
                      {new Date(d.createdTimeMs).toLocaleString()}
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
                        <Text color="red" fw={hscore > yscore ? 700 : 400}>
                          {hscore}
                        </Text>
                        <Text>{` - `}</Text>
                        <Text color="green" fw={yscore > hscore ? 700 : 400}>
                          {yscore}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td
                      style={{
                        backgroundColor: hscore > yscore ? "red" : "initial",
                      }}
                    >{`${
                      d.players.find((p: any) => p.name.trim() === "Howard")
                        ?.corp
                    }`}</Table.Td>
                    <Table.Td
                      style={{
                        backgroundColor: yscore > hscore ? "green" : "initial",
                      }}
                    >{`${
                      d.players.find((p: any) => p.name.trim() === "Yvonne")
                        ?.corp
                    }`}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table>
          </div>
          <div>
            <Title>Corps</Title>
            <Table>
              <Table.Tr>
                <Table.Td>Name</Table.Td>
                <Table.Td>Played</Table.Td>
                <Table.Td>Win%</Table.Td>
                <Table.Td>Avg.Gens</Table.Td>
              </Table.Tr>
              {sortedCorps.map(([k, v]) => (
                <Table.Tr>
                  <Table.Td>{k}</Table.Td>
                  <Table.Td>{v}</Table.Td>
                  <Table.Td>
                    <PercentBar value={((corpWins.get(k) ?? 0) / v) * 100} />
                  </Table.Td>
                  <Table.Td>{((corpGens.get(k) ?? 0) / v).toFixed(2)}</Table.Td>
                </Table.Tr>
              ))}
            </Table>
          </div>
          <div>
            <Title>Cards</Title>
            <Table>
              <Table.Tr>
                <Table.Td>Name</Table.Td>
                <Table.Td>Played</Table.Td>
                <Table.Td>Play%</Table.Td>
                <Table.Td>Win%</Table.Td>
                <Table.Td>Avg.Gens</Table.Td>
              </Table.Tr>
              {sortedCards.map(([k, v]) => (
                <Table.Tr>
                  <Table.Td>{k}</Table.Td>
                  <Table.Td>{v}</Table.Td>
                  <Table.Td>
                    <PercentBar
                      value={(cardCounts.get(k) / data.length) * 100}
                    />
                  </Table.Td>
                  <Table.Td>
                    <PercentBar value={((cardWins.get(k) ?? 0) / v) * 100} />
                  </Table.Td>
                  <Table.Td>{((cardGens.get(k) ?? 0) / v).toFixed(2)}</Table.Td>
                </Table.Tr>
              ))}
            </Table>
          </div>
          {/* <pre>{JSON.stringify(data)}</pre> */}
        </div>
      </div>
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
        <Progress.Section
          // className={classes.progressSection}
          value={value}
          color={value > 50 ? "green" : "red"}
        />
      </Progress.Root>
    </div>
  );
}

export default App;
