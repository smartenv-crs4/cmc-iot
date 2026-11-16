# CMC-IoT Developer Guide

This guide introduces the CMC-IoT domain model, resource categories, and the main integration patterns. The generated [API reference](../doc/index.html) remains the source for exact endpoint parameters and response schemas.

## What the service does

CMC-IoT provides a common API and data model for heterogeneous IoT systems. It models the managed system as a **Thing**, the measurable endpoints under it as **Devices**, and the time-stamped readings as **Observations**. Metadata resources describe what a Device measures, which units it uses, where it is located, who supplies it, and which actions its type supports.

A client can use the REST API to manage resources and query history, or use Redis Pub/Sub for low-latency notifications. These are complementary paths: Pub/Sub is not a historical store, while polling is not an immediate event stream.

## Resource model

| Category | Resources | Purpose and relationships |
| --- | --- | --- |
| Managed systems | `Things`, `Devices` | A Thing represents a managed system or integration endpoint. A Device belongs to one Thing and one DeviceType. Things can carry API/direct connection metadata and can be marked mobile. |
| Measurement semantics | `DeviceTypes`, `ObservedProperties`, `Units` | A DeviceType describes a class of Device and references an ObservedProperty. A Unit references an ObservedProperty and defines a symbol and accepted value range. An Observation references a Device and a Unit. |
| Organization and location | `Sites`, `Vendors`, `Domains` | A Site can have coordinates or be nested under another Site. Things reference a Site and Vendor. Domains group DeviceTypes through a many-to-many association. |
| Telemetry | `Observations` | An Observation contains a numeric value, timestamp, Device ID, Unit ID, and optional location. The service validates the measurement against Device/Thing state and its Unit. |
| Integration actions | `ApiActions` | An ApiAction associates an action name, HTTP method, headers and request prototypes with a DeviceType. Device action calls are proxied to the external Device. |

```text
Vendor and Site
      |   \ location hierarchy
      v    v
     Thing  <---- Api/Direct connection details
       |
       +---- Device ---- DeviceType ---- ObservedProperty
       |          |                         ^
       |          +---- Observations ---- Unit
       |
       +---- associated Devices
```

A Device's `typeId` describes its measurement capability; its `thingId` identifies the Thing that owns or connects it. Do not treat the DeviceType as a particular physical Device.

## Resource categories and operations

All resource collections expose the usual create/read/update/delete or list actions, subject to the route's authorization and validation middleware. The main entry points are:

| Category | Collection path | Typical use |
| --- | --- | --- |
| Things | `/things` | Create systems, associate them with Sites/Vendors, update connection data, manage their state and Devices. |
| Devices | `/devices` | Register measurement endpoints, query or change their state, and send/read Observations. |
| DeviceTypes | `/deviceTypes` | Define Device classes and attach or retrieve Domain associations. |
| ObservedProperties and Units | `/observedProperties`, `/units` | Define the semantic quantity and its valid measurement units/ranges. |
| Observations | `/observations` | Create, retrieve, update (if enabled), delete (if enabled), or search measurements. |
| Sites, Vendors, Domains | `/sites`, `/vendors`, `/domains` | Maintain topology, supplier metadata, and DeviceType classification. |
| ApiActions | `/apiActions` | Define external operations available to Devices of a given DeviceType. |

Useful scoped actions include `POST /devices/:id/actions/getObservations` and `POST /things/:id/actions/getObservations`. The former searches one Device; the latter searches the Devices associated with a Thing. For more general filters use `POST /observations/actions/search`.

The Service group also has environment/diagnostic routes. In particular, `/running_env` currently returns the full resolved configuration without authentication, and `/configuration` returns it to an authenticated caller. Treat these routes as sensitive and do not expose them publicly without reviewing their access controls.

## First steps

### Runtime requirements

The service uses MongoDB for persistent resources, CMC Auth for token validation, and Redis services for the configured cache and push-notification features. Which external services are mandatory is controlled by the active environment configuration (`redisCache.must` and `redisPushNotification.must`). Configure the environment and service URLs/credentials locally; never commit production credentials or paste them into examples.

### Start locally

```sh
npm install
NODE_ENV=dev npm start
```

The default development configuration uses the service port declared in `config/default.json` (currently `3030`). The service also needs reachable MongoDB and CMC Auth instances; Redis availability is required when the active configuration marks it as mandatory.

Obtain a token from the configured CMC Auth service and send it as a bearer token on protected routes:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Most resource routes require a token, but authorization is route-specific. For example, the Site location/search actions and some service diagnostics currently have no token middleware. Consult the API reference and review the route before relying on an endpoint being protected.

### Find the API reference

- Local static reference: [`doc/index.html`](../doc/index.html)
- When the service is running: `http://localhost:3030/doc`
- Source annotations: `routes/routesHandlers/`

The committed static documentation is for readers. Maintainers regenerate it after changing ApiDoc annotations with `npm run docs`.

## Observations: polling and Pub/Sub

There are two Redis-related features that serve different purposes:

1. `redisCache` stores a bounded, configurable set of recent Observations per Device to accelerate eligible searches.
2. `redisPushNotification` publishes live events on channels. Redis Pub/Sub does not retain messages for disconnected subscribers.

Do not confuse the internal observation cache with the push-notification channels.

### Polling the REST API

Use polling when you need history, filters, pagination, recovery after downtime, or a simple request/response integration.

General search example:

```http
POST /observations/actions/search
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

```json
{
  "searchFilters": {
    "devicesId": ["<DEVICE_ID>"],
    "timestamp": {"from": 1760000000000, "to": 1760003600000},
    "unitsId": ["<UNIT_ID>"]
  },
  "pagination": {"skip": 0, "limit": 100}
}
```

The `devicesId`, `timestamp`, `unitsId`, `value`, and supported location filters can be combined. Use `skip`/`limit` to page through results. The response includes `_metadata`; its `source` indicates whether the result came from the database, Redis cache, or cache-plus-database fallback.

The implementation only considers the recent Redis observation cache for a simple Device-ID filter with an explicit page that fits within the configured cache window. More complex filters, unbounded searches, or pages outside that window use the database. If a Device's cache is missing, the search path can refill it from the database. Therefore polling remains the API for historical/corrective reads even when Redis cache is enabled.

**Advantages:** queryable history, filters and pagination, repeatable recovery after reconnect, and no separate Redis subscriber required.

**Trade-offs:** results are only as fresh as the poll interval, and frequent polling adds HTTP/query load. Use incremental time windows with a small overlap and deduplicate by Observation `_id` to avoid gaps at interval boundaries.

### Subscribing to Redis Pub/Sub

Use Pub/Sub when you need low-latency notification that something new happened. First call the authenticated channel-discovery action, connect to the configured Redis push-notification service, subscribe to the returned channel, and wait for the Redis subscribe acknowledgement before relying on delivery.

For a single Device:

- `POST /devices/:id/actions/getDeviceObservationsRedisNotification` returns its Observation channel.
- `POST /devices/:id/actions/getDeviceRedisNotification` returns its Device-state channel.

For a Thing:

- `POST /things/:id/actions/getThingObservationsRedisNotification` returns a map keyed by Device ID. Each entry contains that Device's Observation channel.
- `POST /things/:id/actions/getThingRedisNotification` returns the Thing channel plus a `devices` map of Device-state channels keyed by Device ID.

Channel names are built from configured prefixes and IDs, for example `<observation-prefix><deviceId>`, `<device-prefix><deviceId>`, and `<thing-prefix><thingId>`. Treat the returned values as authoritative; prefixes vary by environment.

Observation channels publish a raw Observation object when an Observation is created. Device and Thing state channels publish JSON envelopes shaped like:

```json
{
  "action": "Device Update",
  "message": {
    "_id": "<DEVICE_ID>",
    "name": "<DEVICE_NAME>",
    "disabled": false
  }
}
```

Device actions include `Device Update`, `Enable/Disable Device`, and a deletion/dismissal instruction telling the subscriber to unsubscribe. Thing actions include `Thing Update`, `Enable/Disable Thing`, `Add Devices`, and the corresponding Thing-deletion instruction. Device-specific lifecycle events are published on the Device channel, not on the Thing channel. A no-op enable/disable request does not emit a state-change event.

**Advantages:** event-driven updates with low polling overhead and low notification latency.

**Trade-offs:** Pub/Sub is transient, not a queue. A subscriber that is disconnected, starts late, or misses a message cannot replay it from Redis Pub/Sub. Notification delivery also does not replace reading the stored Observation/resource from the API when you need authoritative state.

### Recommended hybrid pattern

For consumers that need both live updates and a complete record:

1. Discover the channel and connect to Redis.
2. Subscribe and wait for the acknowledgement; buffer incoming events.
3. Query REST for records after the consumer's last stored timestamp/ID, using a small overlap.
4. Merge the query results and buffered events, deduplicating by Observation `_id` or resource ID.
5. Continue processing the live stream. On every reconnect, repeat the catch-up query before resuming normal operation.

This avoids the gap that can occur if a client polls first and subscribes only afterward. It also treats Redis as a notification mechanism rather than the system of record.

### Redis connection security

The channel-discovery endpoints currently return the configured Redis connection object, including its password, without masking. Keep calls to trusted backends, protect access tokens, and do not expose these responses or Redis credentials to public browser code. Review this contract before deploying to untrusted clients.

## Additional capabilities

- **Geospatial topology:** Sites can have coordinates or be nested under another Site; `POST /sites/actions/searchSitesByLocation` supports radius/bounding-box searches, while `getLinkedSites` traverses Site relationships.
- **Dynamic Device integration:** ApiActions attach HTTP method, headers and request prototypes to a DeviceType. The Device action proxy selects the action for that type and forwards the request to the Thing's configured API endpoint.
- **Lifecycle management:** disabling a Thing can disable associated Devices; deleting resources with retained Observation history may dismiss rather than physically remove them. A dismissed resource is not equivalent to a normal active resource.
- **Domain grouping:** DeviceTypes can be associated with multiple Domains through the association resource/actions.

## Helpful workflow

1. Create or identify an ObservedProperty and its Units.
2. Create a Vendor and a Site (or link the Site into an existing hierarchy).
3. Create a DeviceType for the measurement and associate the needed Domain(s).
4. Create a Thing with its ownership, site/vendor, mobile flag, and any required connector metadata.
5. Create one or more Devices with the Thing and DeviceType IDs.
6. Send Observations, then verify them using the scoped Device/Thing search or `POST /observations/actions/search`.
7. Add ApiActions when a DeviceType needs proxyable commands.
8. Choose polling, Pub/Sub, or the hybrid pattern according to latency and recovery requirements.

For exact request schemas, status codes, and response fields, use the generated [API reference](../doc/index.html).
