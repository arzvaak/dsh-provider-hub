# DSH Provider Hub

A small installable DeepSeek Harness plugin that adds **Settings → Providers**:

- **BharatCode** preset with Qwen and DeepSeek model entries, API-key setup and live catalog discovery.
- **OpenAI-compatible endpoints**, using either Chat Completions or Responses, including localhost gateways.
- **ChatGPT (Codex), GitHub Copilot and other subscriptions**, by embedding the settings component from an installed `dsh-plugin-subscriptions` plugin. That plugin owns OAuth, refresh, quotas and subscription adapters.

The hub uses DSH's native `llm-pi-ai` adapter and authenticated settings/credentials Remote APIs. It does not fork Harness or copy the subscription plugin. API keys go into DSH's credential store, not the provider configuration or browser storage.

## Install

Use a DSH profile with the native `@deepseek-ai/dsh-llm-pi-ai` adapter enabled (standard profiles already supply it). Install the prebuilt GitHub package:

```sh
dsh plugin --profile desktop add github:arzvaak/dsh-provider-hub
```

If subscriptions are not installed in the same profile:

```sh
dsh plugin --profile desktop add dsh-plugin-subscriptions
```

Restart DSH, then open **Settings → Providers**. For a web profile, substitute `web` for `desktop`. If the subscription plugin is already installed, keep that installation. A standalone archive is also available under [Releases](https://github.com/arzvaak/dsh-provider-hub/releases). Download it and pass its local `.tgz` path to the same `dsh plugin add` command.

## Use

**BharatCode:** select BharatCode, enter your key, optionally discover the account's current models, review model capacities, and save. Select the provider/model in the conversation model picker. The preset uses `https://bharatcode.ai/api/model/v1`; its initial model IDs and capacities are defaults from the local integration, not a guarantee of current account availability.

**Other endpoints:** select Add OpenAI-compatible, give it a unique route ID, enter the API base URL (include `/v1` or the gateway prefix), pick its API format and enter its key. Discover models or add IDs manually. Endpoints without discovery are supported through manual entries. A localhost server that accepts any key may use a placeholder key. Remote endpoints require HTTPS.

**Subscriptions:** expand Manage subscription sign-in to use the installed plugin's original controls. ChatGPT subscriptions authenticate as Codex; GitHub subscriptions mean GitHub Copilot. An ordinary GitHub account does not itself provide paid Copilot models. Subscription inference and subscription account limits remain the upstream plugin's responsibility.

Keys are never read back into the form. A blank key field keeps the stored key or the exported environment variable named in Key reference. The hub preserves route options such as headers, reasoning compatibility, retries and timeouts, and keeps existing per-model advanced options when a matching ID is retained. It uses the namespace's revision to reject stale saves. If settings save succeeds but credential storage fails, the page explains the partial save and asks you to retry the key.

Model discovery runs inside the host. Missing context/output capacities use editable estimates of 32,768/4,096 tokens. Review these before saving. Discovery replaces the draft model list; saved models are the IDs in that draft. The hub does not remove existing routes; use DSH's native Models settings for advanced editing/removal.

## Existing integrations considered

- [V1ki/dsh-plugin-subscriptions](https://github.com/V1ki/dsh-plugin-subscriptions): selected for subscription support; covers ChatGPT/Codex and Copilot plus Claude, Grok and Antigravity.
- [GooDAnDReaDY/dsh-subscriptions](https://github.com/GooDAnDReaDY/dsh-subscriptions): a broader subscription bridge; an alternative, not validated with this hub.
- [xxww0098/dsh-plugin-oauth-subs](https://github.com/xxww0098/dsh-plugin-oauth-subs): another subscription bridge using proxy routes; an alternative, not validated with this hub.

## Development and validation

```sh
git clone https://github.com/arzvaak/dsh-provider-hub.git
cd dsh-provider-hub
npm ci --ignore-scripts
npm run build
npm test
DSH_SOURCE=/path/to/deepseek-harness npm run test:composition
npm pack

# Optional test against the real subscription UI and Harness slot registry:
DSH_SOURCE=/path/to/deepseek-harness \
SUBSCRIPTIONS_SOURCE=/path/to/unpacked/dsh-plugin-subscriptions \
  npm run test:compatibility
```

`test:composition` requires a built Harness checkout and Node 24. It creates an isolated temporary profile and local OpenAI-compatible test server, then exercises the real Loader, settings revision/write path, native credential store, model discovery, model catalog and streamed inference. It does not touch the desktop profile or use real account credentials. `npm test` runs standalone unit/UI tests without a Harness installation. `test:compatibility` additionally mounts the real subscription component and uses the real Harness slot registry. Subscription support is tested with the existing 0.9.7 settings component contract; future upstream UI changes may require adaptation.

Validation covers an isolated Harness composition and the subscription plugin 0.9.7 UI contract. It does not establish live BharatCode, ChatGPT or Copilot account inference.
