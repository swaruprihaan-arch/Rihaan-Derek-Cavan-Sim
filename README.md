# Rihaan · Derek · Cavan — SIM

A browser simulation collection with two simulators. Everything runs as static files, with no build step.

- **Flight Simulator (CONTRAIL)**: 43 aircraft (airliners, fighters, helicopters, gliders, warbirds), 26 real airports, weather, time of day, liveries and a paint shop, missions, a career mode, AI traffic, an ILS guide, failures, replay and resume.
- **Racing Simulator (CONTRAIL Racing)**: 8 cars, 5 circuits (coast, oval, mountain, night city, desert), AI opponents, a countdown start, laps and lap records, boost, drift, rain and night racing.

## Controls

Both simulators show a small on-screen keyboard in the corner. It lights up the keys you are pressing and pulses the key you should press next. Press **K** to hide it.

| Flight | Racing |
|---|---|
| W / S: speed up / slow down | W: gas · S: brake / reverse |
| A / D: turn | A / D: steer |
| Space / Shift: go up / go down | Space: drift · Shift: boost |
| V: camera · Esc: pause · F1: help | R: reset car · V: camera · Esc: pause |

## Run locally

```
python3 -m http.server 8765
# open http://localhost:8765/
```

Three.js and fonts load from a CDN, so the first launch needs an internet connection.

## Tests

```
npm install
npm test
```
