# Changelog

## 1.0.10 (2025-10-16)

### Features
- Updated look and feel to support dark and light mode
- Added version checker witn upgrade instructions
- Upated code examples to provide multi-line support for unix and powershell

## 1.0.12 (2025-10-21)

### Features
- Added dynamimic example syntax for timeFrame param
- Splitting out query for container

## 1.0.13 (2025-10-23)

### Features
- Added default perSecond as false, and updated dark mode disabled text

## 1.0.16 (2025-11-04)

### Features
- Updated to add trace-id for troubleshooting, fixed rendering issues in dark and light mode for siteLocation

## 1.0.17 (2025-11-09)

### Features
- Updated timeFrame options to exclude problem field of time_options part of a new timeFrame selection widget getting added to queries 
- Added child parsers for catalogs, and containers to split nested queries

## 1.0.18 (2025-11-21)

### Features
- Updated code rendering section to add cato raw examples, and fixed onblur issue for operation load where things reload on first click


## 1.0.19 (2026-01-21)

### Features
- updated settings to include dev server settings, as well as added new urls to settings for japan and india endpoints

## 1.0.23 (2026-07-05)

### Features
- Updated schema import process to support new nested NULL structure introduced this week.
- Migrated to newer node proxy server for sending API calls to Cato.

## 1.0.24 (2026-09-16)

### Features
- Updated schema import process to support new nested NULL structure introduced this week.
- Add new parsing update to support networkConfig child operations

## 1.0.25 (2026-09-16)

### Features
- Add new parsing update to support posture child operations

## 1.0.26 (2026-11-15)

### Features
- Added ObjectRef dropdown pickers for *RefInput fields: nested, list-valued refs (firewall rule source/destination/country/host, etc.) now render a "name (id)" picker whose selection is written as id or name based on the by (ID|NAME) dropdown, instead of a free-text input
- Resolved nested INPUT_OBJECT picker mappings by camelCased type name, so a single per-type entry covers every operation that nests the type
- Wired 34 RefInput types: 13 via entityLookup (site, country, host, allocatedIP, user, admin, account, networkInterface, service, subscription group/mailing-list/webhook, dhcp relay group) and 21 via dedicated list queries (groups, users groups, custom applications, firewall/socketLan policies, catalog applications, global IP ranges, containers, private applications, mailing lists, RBAC roles, webhooks/templates, ZTNA connectors, DNS server/suffix sets, content-type groups, PoP locations)
