---
name: catalog
description: Show the live Macallan service catalog — services, their tickets, the teams each ticket routes to.
---

Load the catalog with the `service-catalog` skill and print it: services
grouped by category, each with its tickets and the team each ticket routes to.
Mark always-on services.

If an argument was given, treat it as a service key or name and show that one
service in full, with its tickets, their teams and the brief questions on each.

$ARGUMENTS

Say if `list_services` reports `seeded: false` — that means the database is
serving the fallback catalog rather than the edited one.
