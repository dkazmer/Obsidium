# Release notes: 2.0.0
- new feature: `Obsidia`: attach multiple observers to the same element at once
- extensive type optimizations


# Release notes: 1.2.0
- notifer callbacks: return instance as final argument
- precise `this` context for all notifer callbacks

# Release notes: 1.1.1
- properly typed `this` context for all notifer callbacks

# Release notes: 1.1.0
- precise types in `Notify` interface
- better, less manual `Obsidium` type with generic
- `.on()` return type excludes notifiers already used, when chained
- `.on()` check whether a notifier already exists at runtime
- new! `.subscribe()` method
- export each wrapper class individually
- crossed 80% unit test coverage!

// register "obsidium.dev"
