This plugin for Obsidian ([obsidian.md](https://obsidian.md/)) adds a new type of link that doesn't show up in the graph.

The link is like regular WikiLinks but with curly braces:

```
{{Note|alias}}
{{Note}}
```

It looks like a regular link, except that it doesn't create an edge in the graph view. Useful for making a clickable reference without implying a logical connection.

Does not support Markdown links, only WikiLinks.

Some portions of code adapted from [Frontmatter Links](https://github.com/Trikzon/obsidian-frontmatter-links). Some code contributed by kotaindah55 from the Obsidian discord.
