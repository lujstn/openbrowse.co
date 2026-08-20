# Choosing a model

> Which model and reasoning effort to use for browser tasks, the full per-model reasoning ladder, and why the two providers want opposite ends of the dial.

*Source: https://openbrowse.co/docs/models*

OpenBrowse puts Anthropic and OpenAI models behind one API, with a repair layer per provider for each family's failure modes. You pick the model per session, and if you send none the instance's `DEFAULT_MODEL` decides. Where that is unset the default follows whichever provider is actually configured, so an OpenAI-only instance runs `gpt-5.6-terra` and an Anthropic-only instance runs `claude-sonnet-5`. Where both keys are present OpenAI wins. The v3 API and the dashboard's run form both read the same setting, so a request gets the same model whichever door it came through.

> Version numbers may be spelled with dots or dashes, and both reach the same model: `gpt-5.6-terra` and `gpt-5-6-terra` resolve identically, as do `claude-sonnet-4.6` and `claude-sonnet-4-6`. Names are resolved through one index keyed on version punctuation, so a client that normalises identifiers on the way out does not get a 422 for it.

## The short answer

| Situation | Model | `reasoningEffort` |
| --- | --- | --- |
| Most work | `gpt-5.6-terra` or `gpt-5.6-sol` | `none` |
| Most work, Anthropic | `claude-sonnet-5` | `high` |
| Hard, multi-step workflows | `claude-opus-5` | `medium` |
| Tight budget, focused prompt | `gpt-5.6-luna` | `max` |

These are also the levels a session runs at when you send no `reasoningEffort` at all, so the top row is what an out-of-the-box instance does with a request that names neither a model nor a depth.

## The finding worth knowing

On browser tasks, **the two families want opposite ends of the reasoning dial.**

OpenAI models do better with *less* reasoning. They spend less time planning ahead and more time reacting to the page actually in front of them, which is the correct instinct when the environment is a live DOM that changes under you. Anthropic's 5-series models lean towards rabbit holes and need reasoning time to refocus on the goal.

The measured effect is large. On the reference extraction task:

- `gpt-5.6-terra` at `none` finished in **11 steps and 1m 47s**. The same model at `high` took **17 steps and 5m 05s**, burning 2.1x the tokens for 2.75x the cost, and produced the same 14 records.
- `claude-sonnet-5` cost **$0.40 at `high`** and **$0.51 at `none`**, and was 1m 16s slower with reasoning switched off.

So the default instinct, that more reasoning means better results, is wrong for half of the models here. That is why an omitted `reasoningEffort` resolves to the level measured above rather than to whatever the provider does unprompted: on `gpt-5.6-terra` those two differ, and inheriting the provider's would triple the bill for the same fourteen records.

Full numbers are on the [benchmarks page](https://openbrowse.co/benchmarks).

## Two things called thinking

**Browser thinking** is how the platform works: the see, plan, next and thinking cards in the live feed. It describes the agent's step loop and cannot be switched off.

**Model reasoning** is the chain-of-thought the LLM provider exposes, such as Anthropic extended thinking or OpenAI reasoning effort. This is the one you control, per session, with `reasoningEffort`.

## The reasoning ladder, per model

`reasoningEffort` accepts `default`, `none`, `low`, `medium`, `high`, `xhigh` and `max`, validated per model at request time. An invalid value is rejected with a 422 naming the valid set for that model.

Sending `default`, or omitting the field, is not the same as letting the provider decide. OpenBrowse resolves the level itself and sends it explicitly, using the benchmark-backed pick for that model where there is one and the provider's own default where there is not. The two columns below are separated because they genuinely disagree on four of the eleven models, and the dashboard's dropdown labels them the same way: **Default** marks the level a session actually runs at, and **Provider default** appears beside it only where the provider would have chosen differently.

| Model | Accepted levels | Runs at when unset | Provider's own default | Can reasoning be disabled? |
| --- | --- | --- | --- | --- |
| `claude-sonnet-5` | `low` to `max` | `high` | `high` | yes |
| `claude-opus-5` | `low` to `max` | `medium` | `high` | yes |
| `claude-fable-5` | `low` to `max` | `high` | `high` | no |
| `claude-mythos-5` | `low` to `max` | `high` | `high` | no |
| `claude-opus-4.8` | `low` to `max` | `none` | `none` | yes |
| `claude-opus-4.7` | `low`, `medium`, `high` | `none` | `none` | yes |
| `claude-opus-4.6` | `low`, `medium`, `high` | `none` | `none` | yes |
| `claude-sonnet-4.6` | `low`, `medium`, `high` | `none` | `none` | yes |
| `gpt-5.6-terra` | `none` to `max` | `none` | `medium` | yes |
| `gpt-5.6-sol` | `none` to `max` | `none` | `medium` | yes |
| `gpt-5.6-luna` | `none` to `max` | `max` | `medium` | yes |

> This changed in 1.8.3. Before it, an omitted `reasoningEffort` inherited the provider's default, which is the fourth column. If you have been relying on that, name the level you want explicitly and nothing moves.

A few provider mechanics behind that table:

- The Claude 5 family and Opus 4.8 use adaptive thinking, and on the 5-series models the provider's own choice is adaptive thinking at high. This is why `none` must be an explicit choice there, and why `claude-fable-5` and `claude-mythos-5`, which do not accept a disabled configuration, reject it with `reasoning cannot be disabled on claude-fable-5`.
- The older Claude models (`opus-4.7`, `opus-4.6`, `sonnet-4.6`) use fixed thinking budgets: `low`, `medium` and `high` map to 2,048, 8,192 and 16,384 thinking tokens.
- OpenAI models run against the Responses API, which accepts the full `none` to `max` ladder (the chat completions endpoint rejects `max`, which is why OpenBrowse does not use it).

## Long context variants

Every Anthropic model name accepts a `[1m]` suffix, for example `claude-opus-4.8[1m]` or `claude-sonnet-5[1m]`, which requests the provider's 1M-token context window for that session. The suffix is stripped before the model is resolved, so it works on the 5-series names as well as the 4.x ones. Useful for runs that read many large pages into a single conversation; the long-context tier is priced higher by the provider.

Dotted and hyphenated spellings of the 4.x names are interchangeable, so `claude-opus-4.8` and `claude-opus-4-8` resolve to the same model.

## Migrating from thinkingLevel

Requests written for Browser Use Cloud's `thinkingLevel` field keep working: `disabled`, `low`, `medium` and `high` map onto `reasoningEffort` (`disabled` becomes `none`). Sending both fields in one request is rejected, as are the retired spellings `thinkingEffort` and `modelThinkingEffort`, each with an error naming `reasoningEffort` as the replacement.

> **Warning:** One exception, and it is easy to hit. Browser Use Cloud documents `thinkingLevel: null` as the way to clear the setting. Here an explicit `null` is treated as a value rather than as an absence, so it fails with `'None' is not a supported thinkingLevel`. Omit the field entirely instead.

## Supported models

**OpenAI:** `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`

**Anthropic:** `claude-mythos-5`, `claude-fable-5`, `claude-opus-5`, `claude-sonnet-5`, `claude-opus-4.8`, `claude-opus-4.7`, `claude-opus-4.6`, `claude-sonnet-4.6`.

Every one of those also accepts the `[1m]` suffix, so `claude-sonnet-5[1m]` and `claude-opus-4.6[1m]` are both valid. The suffix is stripped before the name is resolved and the long-context beta is requested for whichever Anthropic model it resolved to, so there is no per-model exception list to check.

**Google:** not yet.

Browser Use Cloud's v3 `model` enum has 22 names and OpenBrowse implements 8 of them, so a client that names a model explicitly may be naming one that fails here with a 422 rather than falling back. The cloud's default, `claude-opus-4.7`, is supported, so this only bites callers who set `model` themselves. See [migrating from Browser Use Cloud](https://openbrowse.co/docs/migrating) for the mapping in both directions.

`DEFAULT_MODEL` in the instance's `.env` decides which model a request that names none gets, and it is editable from the dashboard's Settings page. Leave it unset and the instance falls back to the default for whichever provider key it holds, reporting `gpt-5.6-terra` when neither key is configured. The dashboard's picker narrows the same way, offering only the families whose key is present, though an instance with no keys at all still gets the full list so that a fresh install renders a usable form. [Installation](https://openbrowse.co/docs/installation#configuration) lists it alongside every other variable.

Anthropic models need `ANTHROPIC_API_KEY` configured and OpenAI models need `OPENAI_API_KEY`; a session naming a model whose key is missing fails at launch with a message saying which variable to set.

## Setting it

```ts
const session = await client.sessions.create({
  task: "Capture every open vacancy and return the full schema for each.",
  model: "gpt-5.6-terra",
  reasoningEffort: "none",
  maxCostUsd: 3.0,
  outputSchema: mySchema,
});
```

`maxCostUsd` is a hard cap checked after every step; [cost control](https://openbrowse.co/docs/cost) covers it, along with `CLOUD_MAX_COST_FACTOR` for callers whose budgets were priced for a hosted service.

## A note on budget models

`gpt-5.6-luna` at `max` was the cheapest full extraction in the benchmark at $0.22, but it took 17 minutes and 36 steps. It is also the most prone to hallucination when the prompt is broad, though the answer-store guards refuse ungrounded values at the boundary either way. Pair it with a tightly scoped prompt and it is genuinely good value; point it at something vague and it will wander.
