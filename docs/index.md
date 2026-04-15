---
Title: Feed Development
---
[back](..).
@[Video](../data/gatheredtoolsv2.mp4 "autoplay")



## Template
Start by copying the JSON template below and editing the values. Want to add more tools? Just copy everything inside the curly braces `{ ... }` within the `tools` list and paste it right below. Just remember to add a comma between each tool (except for the last one!).
```JSON
{
  "feed-name": "Feed Name",
  "feed-icon": "/url/to/icon.png",
  "feed-author": "Your Name",
  "feed-author-src": "https://yourwebsite.com",
  "updated": "2027-10-07",
  "tooldata-version": "v2",
  "tools": [
    {
      "id": "tool-id",
      "name": "Tool Name",
      "url": "https://tool.com",
      "description": "All your descriptions should have a similar length.",
      "image": "/path/to/thumbnail.png",
      "pricing": "free",
      "highlight":false,
      "tags": [
        "add",
        "tags",
        "here"]
    }
  ]
}
```

## Use your Feed
To make your feed live on gathered.tools, you'll need to host your JSON file on a web server. GitHub is a fantastic, free option for this.

Once your file is uploaded online, just follow these steps:
1. **Get your RAW Link:** Copy the RAW link: Make sure you grab the direct, raw URL of your file (it should end with .json).
2. **Open Settings:** Visit gathered.tools and click the settings icon in the top right.
3. **Add your Feed:** Paste your RAW link into the input field and click "Add Feed".

Your custom tools will sync and appear in your grid instantly! These changes are saved local on your device cache.

---
(c) 2026 [Nick Figner](https://nickfigner.com/). All rights reserved.
Made with [Nick's Markdown](https://nickfigner.com/nmd).

