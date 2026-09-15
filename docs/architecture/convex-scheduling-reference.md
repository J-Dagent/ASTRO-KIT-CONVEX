# Convex scheduling reference

Convex owns delayed, recurring, and asynchronous backend work in this template variant.

Use scheduled functions for one-off work that must run later. Use a Convex cron for a recurring task. Use an action when the task calls an external API. Keep scheduled targets internal and pass only validated arguments.

The template does not install Workflow or Workpool because no current product flow needs multi-step orchestration or bounded parallelism. Add one only when its guarantees match a concrete workload.

No scheduled functions or cron jobs are active in the starter. The public Convex guide explains the available mechanisms without pretending that a background job already exists.
