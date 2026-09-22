# Concept Scorecard

We will choose the concept by scoring a playable promise, not a story pitch. Each candidate must be explainable as:

> The player uses **one action** to create **one surprising consequence**, then makes increasingly difficult decisions about it.

## Hard filters

A concept is rejected before scoring if any answer is no.

- Can the essential interaction be implemented and tested today?
- Can it be played with one finger on a phone?
- Can the complete game remain under 10 MB?
- Can its 3D objects be built entirely as Three.js code?
- Can a stranger understand the goal without reading a paragraph?
- Can we show the core visual and mechanic in a five-second clip?
- Is there a satisfying small version we can finish even if every stretch goal is cut?

## Weighted score

Score every category from 1 to 5, multiply by the weight, and divide the total by 5.

| Category | Weight | What earns a 5 |
|---|---:|---|
| Touch feel and replayability | 30 | The first gesture feels good and creates repeated skill decisions. |
| Authored visual identity | 25 | A frame is recognizable without title, UI, or explanation. |
| Original discovery | 20 | The mechanic, rule, look, or control scheme is hard to confuse with another entry. |
| Four-day feasibility | 15 | A polished complete loop is plausible in one day, leaving time for iteration. |
| Receipt value | 10 | Experiments, rejected versions, and gate results tell a clear build story. |

Minimum selection score: 80/100. No concept wins purely because it is ambitious.

## Candidate seeds

These are prompts for prototypes, not commitments.

### Echo Cartographer

The world is almost invisible. Each touch sends a physical pulse through the environment, briefly revealing geometry while also waking hazards. The player must navigate by deliberately choosing what to reveal and what to leave unknown.

Potential signature: a sculptural, code-built world visible only as expanding light and deformation bands.

### Borrowed Gravity

The player drags one gravity source around a compact diorama. Everything—player, enemies, loose structures, and projectiles—reacts to the same field, turning movement and combat into one readable gesture.

Potential signature: every object leans, orbits, and sheds particles toward the player's fingertip.

### Shadow Smuggler

The player moves a portable light rather than the character. The character can travel only through connected shadows, so changing the light redraws the navigable level in real time.

Potential signature: chunky handcrafted geometry becomes a living shadow puzzle with one continuous control.

## Prototype test

Each serious candidate gets a 60–90 minute grey-box prototype. Record:

- time until first meaningful interaction;
- whether the gesture works reliably on a phone viewport;
- whether three consecutive decisions feel different;
- what the player learns without text;
- estimated draw calls, triangle count, and transfer size;
- one still frame and one five-second motion clip;
- the honest reason to keep or reject it.

